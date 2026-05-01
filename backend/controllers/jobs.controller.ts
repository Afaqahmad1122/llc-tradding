import { Prisma, UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

type CreateJobBody = {
  title?: string;
  slug?: string;
  location?: string;
  type?: string;
  description?: string;
  applyEmail?: string;
  isActive?: boolean;
};

type UpdateJobBody = CreateJobBody;
type ApplyJobBody = { note?: string };

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
};

const normalizeOptionalString = (value: string | undefined): string | null => {
  if (value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getApplyEmail = (): string => env.JOB_APPLICATIONS_EMAIL;

const requireAdmin = (res: Response): boolean => {
  const authUserRole = res.locals.authUserRole as UserRole | undefined;
  if (authUserRole !== UserRole.ADMIN) {
    res.status(403).json({ message: "admin access required" });
    return false;
  }
  return true;
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";

  const where: Prisma.JobWhereInput = {
    isActive: true,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              location: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            { type: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [total, data] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        type: true,
        description: true,
        applyEmail: true,
        createdAt: true,
      },
    }),
  ]);

  res.status(200).json({
    data: data.map((item) => ({
      ...item,
      applyEmail: getApplyEmail(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export const getJobBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const slug = req.params.slug?.trim().toLowerCase();
  if (!slug) {
    res.status(400).json({ message: "job slug is required" });
    return;
  }

  const job = await prisma.job.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      location: true,
      type: true,
      description: true,
      applyEmail: true,
      createdAt: true,
    },
  });

  if (!job) {
    res.status(404).json({ message: "job not found" });
    return;
  }

  res.status(200).json({
    job: {
      ...job,
      applyEmail: getApplyEmail(),
    },
  });
};

export const getAdminJobs = async (
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
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";
  const isActiveQuery = req.query.isActive;

  let isActive: boolean | undefined;
  if (typeof isActiveQuery === "string") {
    if (isActiveQuery !== "true" && isActiveQuery !== "false") {
      res.status(400).json({ message: "isActive must be true or false" });
      return;
    }
    isActive = isActiveQuery === "true";
  }

  const where: Prisma.JobWhereInput = {
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              location: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            { type: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [total, data] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        type: true,
        description: true,
        applyEmail: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { applications: true },
        },
      },
    }),
  ]);

  res.status(200).json({
    data: data.map((item) => ({
      ...item,
      applyEmail: getApplyEmail(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export const createAdminJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const body = req.body as CreateJobBody;
  const title = body.title?.trim();
  const slug = body.slug ? normalizeSlug(body.slug) : undefined;
  const description = body.description?.trim();

  if (!title || !slug || !description) {
    res
      .status(400)
      .json({ message: "title, slug and description are required" });
    return;
  }

  try {
    const job = await prisma.job.create({
      data: {
        title,
        slug,
        location: normalizeOptionalString(body.location),
        type: normalizeOptionalString(body.type),
        description,
        applyEmail: normalizeOptionalString(body.applyEmail),
        isActive: body.isActive ?? true,
      },
    });
    res
      .status(201)
      .json({ job: { ...job, applyEmail: getApplyEmail() } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "job slug already exists" });
      return;
    }
    throw error;
  }
};

export const updateAdminJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const jobId = req.params.id?.trim();
  if (!jobId) {
    res.status(400).json({ message: "job id is required" });
    return;
  }

  const body = req.body as UpdateJobBody;
  const data: Prisma.JobUpdateInput = {
    ...(body.title !== undefined ? { title: body.title.trim() } : {}),
    ...(body.slug !== undefined ? { slug: normalizeSlug(body.slug) } : {}),
    ...(body.location !== undefined
      ? { location: normalizeOptionalString(body.location) }
      : {}),
    ...(body.type !== undefined
      ? { type: normalizeOptionalString(body.type) }
      : {}),
    ...(body.description !== undefined
      ? { description: body.description.trim() }
      : {}),
    ...(body.applyEmail !== undefined
      ? { applyEmail: normalizeOptionalString(body.applyEmail) }
      : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
  };

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "at least one field is required" });
    return;
  }

  try {
    const job = await prisma.job.update({
      where: { id: jobId },
      data,
    });
    res
      .status(200)
      .json({ job: { ...job, applyEmail: getApplyEmail() } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "job slug already exists" });
      return;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "job not found" });
      return;
    }
    throw error;
  }
};

export const deleteAdminJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const jobId = req.params.id?.trim();
  if (!jobId) {
    res.status(400).json({ message: "job id is required" });
    return;
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { isActive: false },
    });
    res.status(200).json({ message: "job deactivated successfully" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "job not found" });
      return;
    }
    throw error;
  }
};

/** Permanently removes the job and related applications (DB cascade). Admin only. */
export const destroyAdminJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const jobId = req.params.id?.trim();
  if (!jobId) {
    res.status(400).json({ message: "job id is required" });
    return;
  }

  try {
    await prisma.job.delete({
      where: { id: jobId },
    });
    res.status(200).json({ message: "job deleted permanently" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "job not found" });
      return;
    }
    throw error;
  }
};

export const applyToJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authUserId = res.locals.authUserId as string | undefined;
  if (!authUserId) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const jobId = req.params.jobId?.trim();
  if (!jobId) {
    res.status(400).json({ message: "job id is required" });
    return;
  }

  const body = req.body as ApplyJobBody;
  const job = await prisma.job.findFirst({
    where: { id: jobId, isActive: true },
    select: { id: true, title: true },
  });

  if (!job) {
    res.status(404).json({ message: "job not found" });
    return;
  }

  try {
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        userId: authUserId,
        note: normalizeOptionalString(body.note),
      },
      select: {
        id: true,
        jobId: true,
        userId: true,
        status: true,
        appliedAt: true,
      },
    });

    res.status(201).json({
      application,
      applyEmail: getApplyEmail(),
      jobTitle: job.title,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "you have already applied to this job" });
      return;
    }
    throw error;
  }
};

export const getMyJobApplicationStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authUserId = res.locals.authUserId as string | undefined;
  if (!authUserId) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const jobId = req.params.jobId?.trim();
  if (!jobId) {
    res.status(400).json({ message: "job id is required" });
    return;
  }

  const application = await prisma.jobApplication.findUnique({
    where: {
      jobId_userId: {
        jobId,
        userId: authUserId,
      },
    },
    select: {
      id: true,
      status: true,
      appliedAt: true,
    },
  });

  res.status(200).json({
    hasApplied: Boolean(application),
    application,
  });
};
