import { Prisma, UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

type CreateReviewBody = {
  invoiceReference?: string;
  rating?: number;
  comment?: string;
  title?: string;
  country?: string;
  carId?: string;
};

type UpdateReviewBody = {
  rating?: number;
  comment?: string;
  title?: string;
  country?: string;
};

type CreateEligibilityBody = {
  userId?: string;
  invoiceReference?: string;
  carId?: string;
  expiresAt?: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const normalizeInvoiceReference = (value: string): string =>
  value.trim().toUpperCase();
const normalizeOptionalString = (value: string | undefined): string | null => {
  if (value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
};

const requireAdmin = (res: Response): boolean => {
  const authUserRole = res.locals.authUserRole as UserRole | undefined;
  if (authUserRole !== UserRole.ADMIN) {
    res.status(403).json({ message: "admin access required" });
    return false;
  }
  return true;
};

export const getReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const rating = req.query.rating ? Number(req.query.rating) : undefined;
  const carId =
    typeof req.query.carId === "string" ? req.query.carId.trim() : undefined;
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";

  if (
    rating !== undefined &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    res
      .status(400)
      .json({ message: "rating filter must be an integer between 1 and 5" });
    return;
  }

  const where: Prisma.ReviewWhereInput = {
    isPublished: true,
    ...(rating !== undefined ? { rating } : {}),
    ...(carId ? { carId } : {}),
  };

  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "highest"
        ? { rating: "desc" }
        : { createdAt: "desc" };

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        country: true,
        createdAt: true,
        invoiceReference: true,
        carId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  res.status(200).json({
    data: reviews,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export const getReviewSummary = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const [aggregate, grouped] = await Promise.all([
    prisma.review.aggregate({
      where: { isPublished: true },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { isPublished: true },
      _count: { rating: true },
      orderBy: { rating: "asc" },
    }),
  ]);

  const countsByRating = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const item of grouped) {
    if (item.rating >= 1 && item.rating <= 5) {
      countsByRating[item.rating as 1 | 2 | 3 | 4 | 5] = item._count.rating;
    }
  }

  res.status(200).json({
    totalReviews: aggregate._count._all,
    averageRating: aggregate._avg.rating ?? 0,
    countsByRating,
  });
};

export const createReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authUserId = res.locals.authUserId as string | undefined;
  if (!authUserId) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const body = req.body as CreateReviewBody;
  const invoiceReference = body.invoiceReference
    ? normalizeInvoiceReference(body.invoiceReference)
    : undefined;
  const rating = body.rating;
  const comment = normalizeOptionalString(body.comment);
  const title = normalizeOptionalString(body.title);
  const country = normalizeOptionalString(body.country);
  const carId = normalizeOptionalString(body.carId);

  if (!invoiceReference || !rating || !comment) {
    res
      .status(400)
      .json({ message: "invoiceReference, rating and comment are required" });
    return;
  }

  const now = new Date();
  const eligibility = await prisma.reviewEligibility.findFirst({
    where: {
      userId: authUserId,
      invoiceReference,
      isUsed: false,
    },
    select: {
      id: true,
      carId: true,
      expiresAt: true,
    },
  });

  if (!eligibility) {
    res
      .status(403)
      .json({ message: "review not allowed for this invoice reference" });
    return;
  }

  if (eligibility.expiresAt && eligibility.expiresAt <= now) {
    res.status(403).json({ message: "review eligibility has expired" });
    return;
  }

  if (carId && eligibility.carId && carId !== eligibility.carId) {
    res
      .status(400)
      .json({ message: "carId does not match review eligibility" });
    return;
  }

  try {
    const createdReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId: authUserId,
          invoiceReference,
          eligibilityId: eligibility.id,
          carId: carId ?? eligibility.carId ?? null,
          rating,
          title,
          comment,
          country,
          isPublished: true,
        },
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          country: true,
          createdAt: true,
          invoiceReference: true,
          carId: true,
        },
      });

      await tx.reviewEligibility.update({
        where: { id: eligibility.id },
        data: { isUsed: true },
      });

      return review;
    });

    res.status(201).json({ review: createdReview });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res
        .status(409)
        .json({ message: "review already exists for this invoice reference" });
      return;
    }
    throw error;
  }
};

export const getMyReviews = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const authUserId = res.locals.authUserId as string | undefined;
  if (!authUserId) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { userId: authUserId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      country: true,
      isPublished: true,
      invoiceReference: true,
      createdAt: true,
      updatedAt: true,
      carId: true,
    },
  });

  res.status(200).json({ data: reviews });
};

export const updateReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authUserId = res.locals.authUserId as string | undefined;
  if (!authUserId) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const reviewId = req.params.id?.trim();
  if (!reviewId) {
    res.status(400).json({ message: "review id is required" });
    return;
  }

  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true },
  });

  if (!existingReview) {
    res.status(404).json({ message: "review not found" });
    return;
  }

  if (existingReview.userId !== authUserId) {
    res.status(403).json({ message: "not allowed to update this review" });
    return;
  }

  const body = req.body as UpdateReviewBody;
  const data: Prisma.ReviewUpdateInput = {
    ...(body.rating !== undefined ? { rating: body.rating } : {}),
    ...(body.comment !== undefined ? { comment: body.comment.trim() } : {}),
    ...(body.title !== undefined
      ? { title: normalizeOptionalString(body.title) }
      : {}),
    ...(body.country !== undefined
      ? { country: normalizeOptionalString(body.country) }
      : {}),
  };

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "at least one field is required" });
    return;
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data,
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      country: true,
      isPublished: true,
      invoiceReference: true,
      createdAt: true,
      updatedAt: true,
      carId: true,
    },
  });

  res.status(200).json({ review });
};

export const createReviewEligibility = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const body = req.body as CreateEligibilityBody;
  const userId = body.userId?.trim();
  const invoiceReference = body.invoiceReference
    ? normalizeInvoiceReference(body.invoiceReference)
    : undefined;
  const carId = normalizeOptionalString(body.carId);
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  if (!userId || !invoiceReference) {
    res
      .status(400)
      .json({ message: "userId and invoiceReference are required" });
    return;
  }

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    res.status(400).json({ message: "invalid expiresAt value" });
    return;
  }

  const [user, car] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    carId
      ? prisma.car.findUnique({ where: { id: carId }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  if (!user) {
    res.status(404).json({ message: "user not found" });
    return;
  }

  if (carId && !car) {
    res.status(404).json({ message: "car not found" });
    return;
  }

  try {
    const eligibility = await prisma.reviewEligibility.create({
      data: {
        userId,
        invoiceReference,
        carId,
        expiresAt,
      },
      select: {
        id: true,
        userId: true,
        invoiceReference: true,
        carId: true,
        isUsed: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    res.status(201).json({ eligibility });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res
        .status(409)
        .json({
          message: "invoiceReference already has an eligibility record",
        });
      return;
    }
    throw error;
  }
};

export const getReviewEligibilities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const userId =
    typeof req.query.userId === "string" ? req.query.userId.trim() : undefined;
  const invoiceReference =
    typeof req.query.invoiceReference === "string"
      ? normalizeInvoiceReference(req.query.invoiceReference)
      : undefined;
  const isUsedQuery = req.query.isUsed;

  let isUsed: boolean | undefined;
  if (typeof isUsedQuery === "string") {
    if (isUsedQuery !== "true" && isUsedQuery !== "false") {
      res.status(400).json({ message: "isUsed must be true or false" });
      return;
    }
    isUsed = isUsedQuery === "true";
  }

  const where: Prisma.ReviewEligibilityWhereInput = {
    ...(userId ? { userId } : {}),
    ...(invoiceReference ? { invoiceReference } : {}),
    ...(isUsed !== undefined ? { isUsed } : {}),
  };

  const [total, eligibilities] = await Promise.all([
    prisma.reviewEligibility.count({ where }),
    prisma.reviewEligibility.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        userId: true,
        invoiceReference: true,
        carId: true,
        isUsed: true,
        expiresAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  res.status(200).json({
    data: eligibilities,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};
