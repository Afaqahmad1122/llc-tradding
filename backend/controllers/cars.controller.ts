import { randomBytes } from "node:crypto";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FuelType, Prisma, TransmissionType, UserRole } from "@prisma/client";
import type { SteeringType } from "@prisma/client";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { s3Bucket, s3Client } from "../config/s3.js";
import { resolvePricePkr } from "../lib/usd-pkr-rate.js";

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
const S3_DELETE_BATCH_SIZE = 1_000;
const S3_IMAGE_KEY_PREFIX = "cars/";

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
  if (authUserRole !== UserRole.ADMIN && authUserRole !== UserRole.STAFF) {
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

type StoredCarImage = {
  key: string | null;
  url: string;
};

const normalizeS3Key = (rawKey: string): string | null => {
  const key = rawKey.trim().replace(/^\/+/, "");
  if (!key.startsWith(S3_IMAGE_KEY_PREFIX)) return null;
  if (key.includes("..")) return null;
  return key;
};

const parseS3KeyFromPublicUrl = (url: string): string | null => {
  if (!s3Bucket) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const validHost =
      host === `${s3Bucket}.s3.amazonaws.com` ||
      host === `${s3Bucket}.s3.${env.AWS_REGION}.amazonaws.com` ||
      (host.startsWith(`${s3Bucket}.s3.`) && host.endsWith(".amazonaws.com"));
    if (!validHost) {
      return null;
    }
    const decodedPath = decodeURIComponent(parsed.pathname);
    return normalizeS3Key(decodedPath);
  } catch {
    return null;
  }
};

const extractS3KeyFromImage = (image: StoredCarImage): string | null => {
  if (image.key) {
    const directKey = normalizeS3Key(image.key);
    if (directKey) return directKey;
  }
  return parseS3KeyFromPublicUrl(image.url);
};

const collectS3KeysFromImages = (images: StoredCarImage[]): string[] => {
  const keys = new Set<string>();
  for (const image of images) {
    const key = extractS3KeyFromImage(image);
    if (key) keys.add(key);
  }
  return [...keys];
};

const deleteS3Objects = async (keys: string[]): Promise<void> => {
  if (!s3Bucket || keys.length === 0) return;
  for (let index = 0; index < keys.length; index += S3_DELETE_BATCH_SIZE) {
    const batch = keys.slice(index, index + S3_DELETE_BATCH_SIZE);
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: s3Bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );
  }
};

const deleteS3ObjectsSafely = async (
  keys: string[],
  context: string,
): Promise<void> => {
  if (keys.length === 0) return;
  try {
    await deleteS3Objects(keys);
  } catch (error) {
    console.error(`[cars] s3 cleanup failed (${context})`, error);
  }
};

const imageIdentity = (image: { key?: string | null; url: string }): string => {
  const validKey = image.key ? normalizeS3Key(image.key) : null;
  if (validKey) return `key:${validKey}`;
  return `url:${image.url.trim()}`;
};

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
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [models, yearAgg, priceAgg, newArrivals, uaeStock, thailandStock, machinery, total, thirdParty] =
    await Promise.all([
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
      prisma.car.count({
        where: { isPublished: true, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.car.count({
        where: {
          isPublished: true,
          country: { contains: "UAE", mode: "insensitive" },
        },
      }),
      prisma.car.count({
        where: {
          isPublished: true,
          country: { contains: "Thailand", mode: "insensitive" },
        },
      }),
      prisma.car.count({
        where: {
          isPublished: true,
          model: {
            bodyType: {
              in: ["Truck", "Van", "Bus", "Machinery", "Heavy Duty", "Pickup"],
              mode: "insensitive",
            },
          },
        },
      }),
      prisma.car.count({ where: { isPublished: true } }),
      prisma.car.count({
        where: { isPublished: true, createdByAdmin: false },
      }),
    ]);

  const brands = [...new Set(models.map((m) => m.brand))].sort();

  res.status(200).json({
    brands,
    models,
    yearRange: { min: yearAgg._min.year, max: yearAgg._max.year },
    priceRange: { min: priceAgg._min.priceUsd, max: priceAgg._max.priceUsd },
    categoryCounts: {
      newArrivals,
      clearance: Math.round(total * 0.22),
      thirdParty,
      machinery,
      uaeStock,
      thailandStock,
    },
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
  const bodyType =
    typeof req.query.bodyType === "string"
      ? req.query.bodyType.trim()
      : undefined;
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
  const steering = parseEnum(req.query.steering, { RHD: "RHD", LHD: "LHD", OTHER: "OTHER" } as const);
  const modelCode =
    typeof req.query.modelCode === "string" && req.query.modelCode.trim()
      ? req.query.modelCode.trim()
      : undefined;
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";

  const modelFilter: Prisma.ModelWhereInput | undefined =
    brand || bodyType
      ? {
          ...(brand
            ? { brand: { equals: brand, mode: Prisma.QueryMode.insensitive } }
            : {}),
          ...(bodyType
            ? {
                bodyType: {
                  equals: bodyType,
                  mode: Prisma.QueryMode.insensitive,
                },
              }
            : {}),
        }
      : undefined;

  const where: Prisma.CarWhereInput = {
    isPublished: true,
    ...(modelId ? { modelId } : {}),
    ...(modelFilter ? { model: modelFilter } : {}),
    ...(fuel ? { fuel } : {}),
    ...(transmission ? { transmission } : {}),
    ...(steering ? { steering } : {}),
    ...(modelCode
      ? { modelCode: { contains: modelCode, mode: Prisma.QueryMode.insensitive } }
      : {}),
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
              chassisNo: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              modelCode: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
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
  const pricePkr = await resolvePricePkr({
    priceUsd: body.priceUsd,
    pricePkr: body.pricePkr,
  });
  const bodyWithPkr: CreateCarBody = {
    ...body,
    ...(pricePkr !== undefined ? { pricePkr } : {}),
  };

  try {
    const car = await prisma.$transaction(async (tx) => {
      const created = await tx.car.create({
        data: buildCreateData(bodyWithPkr, authUserId ?? null),
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

  const body = req.body as UpdateCarBody;
  let pricePkr = body.pricePkr;
  if (body.priceUsd !== undefined && body.pricePkr === undefined) {
    const computed = await resolvePricePkr({ priceUsd: body.priceUsd });
    if (computed !== undefined) pricePkr = computed;
  }
  const bodyWithPkr: UpdateCarBody = {
    ...body,
    ...(pricePkr !== undefined ? { pricePkr } : {}),
  };

  const data = buildUpdateData(bodyWithPkr);
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

  const car = await prisma.car.findUnique({
    where: { id },
    select: {
      id: true,
      images: { select: { key: true, url: true } },
    },
  });
  if (!car) {
    res.status(404).json({ message: "car not found" });
    return;
  }

  const s3Keys = collectS3KeysFromImages(car.images);

  try {
    await prisma.car.delete({ where: { id } });
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

  await deleteS3ObjectsSafely(s3Keys, `delete car ${id}`);
  res.status(200).json({ message: "car deleted successfully" });
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
    select: {
      id: true,
      images: {
        select: {
          key: true,
          url: true,
        },
      },
    },
  });
  if (!existing) {
    res.status(404).json({ message: "car not found" });
    return;
  }

  const incomingIdentities = new Set(images.map((image) => imageIdentity(image)));
  const removedImages = existing.images.filter(
    (image) => !incomingIdentities.has(imageIdentity(image)),
  );
  const removedS3Keys = collectS3KeysFromImages(removedImages);

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
  await deleteS3ObjectsSafely(removedS3Keys, `replace images for car ${id}`);
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
