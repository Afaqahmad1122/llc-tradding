import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FuelType, Prisma, TransmissionType, UserRole } from "@prisma/client";
import type { SteeringType } from "@prisma/client";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { s3Bucket, s3Client } from "../config/s3.js";

type CarImageInput = {
  url: string;
  key?: string;
  altText?: string;
  position?: number;
  isPrimary?: boolean;
};

type CreateCarBody = {
  referenceNo: string;
  title?: string;
  modelId: string;
  year: number;
  mileage?: number;
  mileageUnit?: string;
  priceUsd: number;
  pricePkr?: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  seats?: number;
  color?: string;
  drive?: string;
  doors?: number;
  steering?: SteeringType;
  engineCc?: number;
  engineCode?: string;
  modelCode?: string;
  chassisNo?: string;
  country?: string;
  city?: string;
  specifications?: Record<string, unknown>;
  features?: Record<string, unknown>;
  isPublished?: boolean;
  images?: CarImageInput[];
};

type UpdateCarBody = Partial<CreateCarBody>;
type ReplaceImagesBody = { images: CarImageInput[] };
type PresignBody = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "jpeg" | "png" | "webp";
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;
const PRESIGN_EXPIRES_IN_SEC = 300;
const SIMILAR_CARS_LIMIT = 5;

const PUBLIC_CAR_SELECT = {
  id: true,
  referenceNo: true,
  title: true,
  year: true,
  mileage: true,
  mileageUnit: true,
  priceUsd: true,
  pricePkr: true,
  fuel: true,
  transmission: true,
  seats: true,
  color: true,
  drive: true,
  doors: true,
  steering: true,
  engineCc: true,
  engineCode: true,
  modelCode: true,
  chassisNo: true,
  country: true,
  city: true,
  specifications: true,
  features: true,
  createdAt: true,
  model: {
    select: { id: true, name: true, brand: true, slug: true, bodyType: true },
  },
  images: {
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      url: true,
      altText: true,
      position: true,
      isPrimary: true,
    },
  },
} satisfies Prisma.CarSelect;

const ADMIN_CAR_SELECT = {
  ...PUBLIC_CAR_SELECT,
  isPublished: true,
  createdById: true,
  createdByAdmin: true,
  updatedAt: true,
  images: {
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      url: true,
      key: true,
      altText: true,
      position: true,
      isPrimary: true,
    },
  },
} satisfies Prisma.CarSelect;

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
};

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseEnum = <T extends Record<string, string>>(
  value: unknown,
  enumObject: T,
): T[keyof T] | undefined => {
  if (typeof value !== "string") return undefined;
  const candidate = value.trim().toUpperCase();
  return (Object.values(enumObject) as string[]).includes(candidate)
    ? (candidate as T[keyof T])
    : undefined;
};

const requireAdmin = (res: Response): boolean => {
  const authUserRole = res.locals.authUserRole as UserRole | undefined;
  if (authUserRole !== UserRole.ADMIN) {
    res.status(403).json({ message: "admin access required" });
    return false;
  }
  return true;
};

const normalizeReferenceNo = (value: string): string =>
  value.trim().toUpperCase();

const normalizeChassisNo = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  const trimmed = value.trim().toUpperCase();
  return trimmed ? trimmed : undefined;
};

const ensureSinglePrimary = (images: CarImageInput[]): CarImageInput[] => {
  if (images.length === 0) return images;
  const hasPrimary = images.some((image) => image.isPrimary);
  return images.map((image, index) => ({
    ...image,
    position: image.position ?? index,
    isPrimary: hasPrimary ? Boolean(image.isPrimary) : index === 0,
  }));
};

const toCarImageCreateMany = (
  images: CarImageInput[],
): Prisma.CarImageCreateManyInput[] =>
  images.map((image, index) => ({
    url: image.url.trim(),
    key: image.key?.trim() || null,
    altText: image.altText?.trim() || null,
    position: image.position ?? index,
    isPrimary: Boolean(image.isPrimary),
    carId: "",
  }));

const buildCreateData = (
  body: CreateCarBody,
  createdById: string | null,
): Prisma.CarCreateInput => {
  const data: Prisma.CarCreateInput = {
    referenceNo: normalizeReferenceNo(body.referenceNo),
    year: body.year,
    priceUsd: body.priceUsd,
    chassisNo: normalizeChassisNo(body.chassisNo) ?? null,
    model: { connect: { id: body.modelId } },
    createdByAdmin: true,
  };
  if (createdById) data.createdBy = { connect: { id: createdById } };
  if (body.title !== undefined) data.title = body.title;
  if (body.mileage !== undefined) data.mileage = body.mileage;
  if (body.mileageUnit !== undefined) data.mileageUnit = body.mileageUnit;
  if (body.pricePkr !== undefined) data.pricePkr = body.pricePkr;
  if (body.fuel !== undefined) data.fuel = body.fuel;
  if (body.transmission !== undefined) data.transmission = body.transmission;
  if (body.seats !== undefined) data.seats = body.seats;
  if (body.color !== undefined) data.color = body.color;
  if (body.drive !== undefined) data.drive = body.drive;
  if (body.doors !== undefined) data.doors = body.doors;
  if (body.steering !== undefined) data.steering = body.steering;
  if (body.engineCc !== undefined) data.engineCc = body.engineCc;
  if (body.engineCode !== undefined) data.engineCode = body.engineCode;
  if (body.modelCode !== undefined) data.modelCode = body.modelCode;
  if (body.country !== undefined) data.country = body.country;
  if (body.city !== undefined) data.city = body.city;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;
  if (body.specifications !== undefined)
    data.specifications = body.specifications as Prisma.InputJsonValue;
  if (body.features !== undefined)
    data.features = body.features as Prisma.InputJsonValue;
  return data;
};

const buildUpdateData = (body: UpdateCarBody): Prisma.CarUpdateInput => {
  const data: Prisma.CarUpdateInput = {};
  if (body.referenceNo !== undefined)
    data.referenceNo = normalizeReferenceNo(body.referenceNo);
  if (body.title !== undefined) data.title = body.title;
  if (body.modelId !== undefined)
    data.model = { connect: { id: body.modelId } };
  if (body.year !== undefined) data.year = body.year;
  if (body.mileage !== undefined) data.mileage = body.mileage;
  if (body.mileageUnit !== undefined) data.mileageUnit = body.mileageUnit;
  if (body.priceUsd !== undefined) data.priceUsd = body.priceUsd;
  if (body.pricePkr !== undefined) data.pricePkr = body.pricePkr;
  if (body.fuel !== undefined) data.fuel = body.fuel;
  if (body.transmission !== undefined) data.transmission = body.transmission;
  if (body.seats !== undefined) data.seats = body.seats;
  if (body.color !== undefined) data.color = body.color;
  if (body.drive !== undefined) data.drive = body.drive;
  if (body.doors !== undefined) data.doors = body.doors;
  if (body.steering !== undefined) data.steering = body.steering;
  if (body.engineCc !== undefined) data.engineCc = body.engineCc;
  if (body.engineCode !== undefined) data.engineCode = body.engineCode;
  if (body.modelCode !== undefined) data.modelCode = body.modelCode;
  if (body.chassisNo !== undefined)
    data.chassisNo = normalizeChassisNo(body.chassisNo) ?? null;
  if (body.country !== undefined) data.country = body.country;
  if (body.city !== undefined) data.city = body.city;
  if (body.specifications !== undefined)
    data.specifications = body.specifications as Prisma.InputJsonValue;
  if (body.features !== undefined)
    data.features = body.features as Prisma.InputJsonValue;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;
  return data;
};

const handleCarUniqueError = (error: unknown, res: Response): boolean => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = (error.meta?.target as string[] | undefined)?.join(",");
    const field = target?.includes("chassisNo") ? "chassisNo" : "referenceNo";
    res.status(409).json({ message: `${field} already exists` });
    return true;
  }
  return false;
};

export const getCarsMeta = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const [models, yearAgg, priceAgg] = await Promise.all([
    prisma.model.findMany({
      where: { cars: { some: { isPublished: true } } },
      select: { id: true, name: true, brand: true, slug: true, bodyType: true },
      orderBy: [{ brand: "asc" }, { name: "asc" }],
    }),
    prisma.car.aggregate({
      where: { isPublished: true },
      _min: { year: true },
      _max: { year: true },
    }),
    prisma.car.aggregate({
      where: { isPublished: true },
      _min: { priceUsd: true },
      _max: { priceUsd: true },
    }),
  ]);

  const brands = [...new Set(models.map((m) => m.brand))].sort();

  res.status(200).json({
    brands,
    models,
    yearRange: { min: yearAgg._min.year, max: yearAgg._max.year },
    priceRange: { min: priceAgg._min.priceUsd, max: priceAgg._max.priceUsd },
  });
};

export const getCars = async (req: Request, res: Response): Promise<void> => {
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const brand =
    typeof req.query.brand === "string" ? req.query.brand.trim() : undefined;
  const modelId =
    typeof req.query.modelId === "string"
      ? req.query.modelId.trim()
      : undefined;
  const yearMin = parseOptionalNumber(req.query.yearMin);
  const yearMax = parseOptionalNumber(req.query.yearMax);
  const priceMin = parseOptionalNumber(req.query.priceMin);
  const priceMax = parseOptionalNumber(req.query.priceMax);
  const fuel = parseEnum(req.query.fuel, FuelType);
  const transmission = parseEnum(req.query.transmission, TransmissionType);
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";

  const where: Prisma.CarWhereInput = {
    isPublished: true,
    ...(modelId ? { modelId } : {}),
    ...(brand
      ? {
          model: {
            brand: { equals: brand, mode: Prisma.QueryMode.insensitive },
          },
        }
      : {}),
    ...(fuel ? { fuel } : {}),
    ...(transmission ? { transmission } : {}),
    ...(yearMin !== undefined || yearMax !== undefined
      ? {
          year: {
            ...(yearMin !== undefined ? { gte: yearMin } : {}),
            ...(yearMax !== undefined ? { lte: yearMax } : {}),
          },
        }
      : {}),
    ...(priceMin !== undefined || priceMax !== undefined
      ? {
          priceUsd: {
            ...(priceMin !== undefined ? { gte: priceMin } : {}),
            ...(priceMax !== undefined ? { lte: priceMax } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              referenceNo: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              title: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            {
              model: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    brand: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.CarOrderByWithRelationInput =
    sort === "priceAsc"
      ? { priceUsd: "asc" }
      : sort === "priceDesc"
        ? { priceUsd: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" };

  const [total, data] = await Promise.all([
    prisma.car.count({ where }),
    prisma.car.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: PUBLIC_CAR_SELECT,
    }),
  ]);

  res.status(200).json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export const getCarByReference = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const referenceNo = req.params.referenceNo
    ? normalizeReferenceNo(req.params.referenceNo)
    : "";
  if (!referenceNo) {
    res.status(400).json({ message: "referenceNo is required" });
    return;
  }

  const car = await prisma.car.findFirst({
    where: { referenceNo, isPublished: true },
    select: PUBLIC_CAR_SELECT,
  });

  if (!car) {
    res.status(404).json({ message: "car not found" });
    return;
  }

  const similarCars = await prisma.car.findMany({
    where: {
      isPublished: true,
      id: { not: car.id },
      OR: [{ modelId: car.model.id }, { model: { brand: car.model.brand } }],
    },
    orderBy: { createdAt: "desc" },
    take: SIMILAR_CARS_LIMIT,
    select: PUBLIC_CAR_SELECT,
  });

  res.status(200).json({ car, similarCars });
};

type CarInquiryBody = {
  name: string;
  email: string;
  phone: string;
  destinationCountry?: string;
  destinationPort?: string;
  message?: string;
};

export const submitCarInquiry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const referenceNo = req.params.referenceNo
    ? normalizeReferenceNo(req.params.referenceNo)
    : "";
  if (!referenceNo) {
    res.status(400).json({ message: "referenceNo is required" });
    return;
  }

  const car = await prisma.car.findFirst({
    where: { referenceNo, isPublished: true },
    select: { id: true },
  });

  if (!car) {
    res.status(404).json({ message: "car not found" });
    return;
  }

  const body = req.body as CarInquiryBody;

  await prisma.contactMessage.create({
    data: {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      country: body.destinationCountry?.trim() || null,
      city: body.destinationPort?.trim() || null,
      vehicleRequirement: referenceNo,
      message: body.message?.trim() || `Inquiry for vehicle ${referenceNo}`,
    },
  });

  res.status(201).json({ message: "inquiry submitted successfully" });
};

export const getAdminModels = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  const models = await prisma.model.findMany({
    select: { id: true, name: true, brand: true, slug: true, bodyType: true },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });

  res.status(200).json({ models });
};

export const getAdminCars = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const isPublishedQuery = req.query.isPublished;
  const createdById =
    typeof req.query.createdById === "string"
      ? req.query.createdById.trim()
      : undefined;
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";

  let isPublished: boolean | undefined;
  if (typeof isPublishedQuery === "string") {
    if (isPublishedQuery !== "true" && isPublishedQuery !== "false") {
      res.status(400).json({ message: "isPublished must be true or false" });
      return;
    }
    isPublished = isPublishedQuery === "true";
  }

  const where: Prisma.CarWhereInput = {
    ...(isPublished !== undefined ? { isPublished } : {}),
    ...(createdById ? { createdById } : {}),
    ...(search
      ? {
          OR: [
            {
              referenceNo: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              title: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            {
              chassisNo: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.CarOrderByWithRelationInput =
    sort === "priceAsc"
      ? { priceUsd: "asc" }
      : sort === "priceDesc"
        ? { priceUsd: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" };

  const [total, data] = await Promise.all([
    prisma.car.count({ where }),
    prisma.car.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: ADMIN_CAR_SELECT,
    }),
  ]);

  res.status(200).json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export const getAdminCarById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  const id = req.params.id?.trim();
  if (!id) {
    res.status(400).json({ message: "car id is required" });
    return;
  }

  const car = await prisma.car.findUnique({
    where: { id },
    select: ADMIN_CAR_SELECT,
  });

  if (!car) {
    res.status(404).json({ message: "car not found" });
    return;
  }

  res.status(200).json({ car });
};

export const createAdminCar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  const authUserId = res.locals.authUserId as string | undefined;
  const body = req.body as CreateCarBody;
  const images = ensureSinglePrimary(body.images ?? []);

  try {
    const car = await prisma.$transaction(async (tx) => {
      const created = await tx.car.create({
        data: buildCreateData(body, authUserId ?? null),
        select: { id: true },
      });

      if (images.length > 0) {
        await tx.carImage.createMany({
          data: toCarImageCreateMany(images).map((image) => ({
            ...image,
            carId: created.id,
          })),
        });
      }

      return tx.car.findUnique({
        where: { id: created.id },
        select: ADMIN_CAR_SELECT,
      });
    });

    res.status(201).json({ car });
  } catch (error) {
    if (handleCarUniqueError(error, res)) return;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "model not found" });
      return;
    }
    throw error;
  }
};

export const updateAdminCar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  const id = req.params.id?.trim();
  if (!id) {
    res.status(400).json({ message: "car id is required" });
    return;
  }

  const data = buildUpdateData(req.body as UpdateCarBody);
  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "at least one field is required" });
    return;
  }

  try {
    const car = await prisma.car.update({
      where: { id },
      data,
      select: ADMIN_CAR_SELECT,
    });
    res.status(200).json({ car });
  } catch (error) {
    if (handleCarUniqueError(error, res)) return;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "car not found" });
      return;
    }
    throw error;
  }
};

export const deleteAdminCar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  const id = req.params.id?.trim();
  if (!id) {
    res.status(400).json({ message: "car id is required" });
    return;
  }

  try {
    await prisma.car.update({
      where: { id },
      data: { isPublished: false },
    });
    res.status(200).json({ message: "car unpublished successfully" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "car not found" });
      return;
    }
    throw error;
  }
};

export const replaceAdminCarImages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  const id = req.params.id?.trim();
  if (!id) {
    res.status(400).json({ message: "car id is required" });
    return;
  }

  const body = req.body as ReplaceImagesBody;
  const images = ensureSinglePrimary(body.images ?? []);

  const existing = await prisma.car.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    res.status(404).json({ message: "car not found" });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.carImage.deleteMany({ where: { carId: id } });
    if (images.length > 0) {
      await tx.carImage.createMany({
        data: toCarImageCreateMany(images).map((image) => ({
          ...image,
          carId: id,
        })),
      });
    }
  });

  const car = await prisma.car.findUnique({
    where: { id },
    select: ADMIN_CAR_SELECT,
  });
  res.status(200).json({ car });
};

export const presignCarImageUpload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) return;

  if (!s3Bucket) {
    res.status(503).json({ message: "image upload is not configured" });
    return;
  }

  const body = req.body as PresignBody;
  const random = randomBytes(8).toString("hex");
  const key = `cars/${Date.now()}-${random}.${body.ext}`;

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ContentType: body.contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGN_EXPIRES_IN_SEC,
  });

  const region = env.AWS_REGION;
  const publicUrl = `https://${s3Bucket}.s3.${region}.amazonaws.com/${key}`;

  res.status(200).json({
    uploadUrl,
    key,
    publicUrl,
    expiresInSec: PRESIGN_EXPIRES_IN_SEC,
  });
};
