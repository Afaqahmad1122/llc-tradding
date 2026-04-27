import { Prisma, UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

type CreateShippingRegionBody = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type UpdateShippingRegionBody = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type CreateShippingScheduleBody = {
  company?: string;
  shipName?: string;
  voyage?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type UpdateShippingScheduleBody = {
  company?: string;
  shipName?: string;
  voyage?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type ReplaceDeparturesBody = {
  entries?: Array<{
    portName: string;
    etdText: string;
    sortOrder?: number;
  }>;
};

type ReplaceArrivalsBody = {
  entries?: Array<{
    portName: string;
    etaText: string;
    sortOrder?: number;
  }>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

const parseBooleanFilter = (value: unknown): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
};

const toAdminRegionSelect = () =>
  ({
    id: true,
    name: true,
    slug: true,
    sortOrder: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        schedules: true,
      },
    },
  }) satisfies Prisma.ShippingRegionSelect;

const toAdminScheduleSelect = () =>
  ({
    id: true,
    regionId: true,
    company: true,
    shipName: true,
    voyage: true,
    sortOrder: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    departures: {
      select: {
        id: true,
        portName: true,
        etdText: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    },
    arrivals: {
      select: {
        id: true,
        portName: true,
        etaText: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    },
  }) satisfies Prisma.ShippingScheduleSelect;

export const getShippingRegions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const regions = await prisma.shippingRegion.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
    },
  });

  res.status(200).json({ data: regions });
};

export const getShippingSchedulesByRegionSlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const regionSlug = req.params.slug?.trim().toLowerCase();
  if (!regionSlug) {
    res.status(400).json({ message: "region slug is required" });
    return;
  }

  const region = await prisma.shippingRegion.findFirst({
    where: {
      slug: regionSlug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
      schedules: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          company: true,
          shipName: true,
          voyage: true,
          sortOrder: true,
          departures: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              portName: true,
              etdText: true,
              sortOrder: true,
            },
          },
          arrivals: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              portName: true,
              etaText: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });

  if (!region) {
    res.status(404).json({ message: "shipping region not found" });
    return;
  }

  const departurePortSet = new Set<string>();
  const arrivalPortSet = new Set<string>();

  for (const schedule of region.schedules) {
    for (const departure of schedule.departures) {
      if (!departurePortSet.has(departure.portName)) {
        departurePortSet.add(departure.portName);
      }
    }
    for (const arrival of schedule.arrivals) {
      if (!arrivalPortSet.has(arrival.portName)) {
        arrivalPortSet.add(arrival.portName);
      }
    }
  }

  const departurePorts = Array.from(departurePortSet);
  const arrivalPorts = Array.from(arrivalPortSet);
  const rows = region.schedules.map((schedule) => ({
    id: schedule.id,
    company: schedule.company,
    shipName: schedule.shipName,
    voyage: schedule.voyage,
    sortOrder: schedule.sortOrder,
    departures: Object.fromEntries(
      schedule.departures.map((entry) => [entry.portName, entry.etdText]),
    ) as Record<string, string>,
    arrivals: Object.fromEntries(
      schedule.arrivals.map((entry) => [entry.portName, entry.etaText]),
    ) as Record<string, string>,
  }));

  res.status(200).json({
    region: {
      id: region.id,
      name: region.name,
      slug: region.slug,
      sortOrder: region.sortOrder,
    },
    table: {
      departurePorts,
      arrivalPorts,
      rows,
    },
  });
};

export const getAdminShippingRegions = async (
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
  const isActive = parseBooleanFilter(req.query.isActive);
  const sortQuery =
    typeof req.query.sort === "string" ? req.query.sort : "latest";

  if (req.query.isActive !== undefined && isActive === undefined) {
    res.status(400).json({ message: "isActive must be true or false" });
    return;
  }

  const where: Prisma.ShippingRegionWhereInput = {
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ShippingRegionOrderByWithRelationInput =
    sortQuery === "name"
      ? { name: "asc" }
      : sortQuery === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

  const [total, regions] = await Promise.all([
    prisma.shippingRegion.count({ where }),
    prisma.shippingRegion.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: toAdminRegionSelect(),
    }),
  ]);

  res.status(200).json({
    data: regions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export const createAdminShippingRegion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const body = req.body as CreateShippingRegionBody;
  const name = body.name?.trim();
  const slug = body.slug ? normalizeSlug(body.slug) : undefined;

  if (!name || !slug) {
    res.status(400).json({ message: "name and slug are required" });
    return;
  }

  try {
    const region = await prisma.shippingRegion.create({
      data: {
        name,
        slug,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
      select: toAdminRegionSelect(),
    });

    res.status(201).json({ region });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "shipping region slug already exists" });
      return;
    }
    throw error;
  }
};

export const updateAdminShippingRegion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const regionId = req.params.id?.trim();
  if (!regionId) {
    res.status(400).json({ message: "region id is required" });
    return;
  }

  const body = req.body as UpdateShippingRegionBody;
  const data: Prisma.ShippingRegionUpdateInput = {
    ...(body.name !== undefined ? { name: body.name.trim() } : {}),
    ...(body.slug !== undefined ? { slug: normalizeSlug(body.slug) } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
  };

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "at least one field is required" });
    return;
  }

  try {
    const region = await prisma.shippingRegion.update({
      where: { id: regionId },
      data,
      select: toAdminRegionSelect(),
    });
    res.status(200).json({ region });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "shipping region slug already exists" });
      return;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "shipping region not found" });
      return;
    }
    throw error;
  }
};

export const deleteAdminShippingRegion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const regionId = req.params.id?.trim();
  if (!regionId) {
    res.status(400).json({ message: "region id is required" });
    return;
  }

  try {
    await prisma.shippingRegion.update({
      where: { id: regionId },
      data: { isActive: false },
    });
    res
      .status(200)
      .json({ message: "shipping region deactivated successfully" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "shipping region not found" });
      return;
    }
    throw error;
  }
};

export const getAdminShippingSchedulesByRegion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const regionId = req.params.id?.trim();
  if (!regionId) {
    res.status(400).json({ message: "region id is required" });
    return;
  }

  const region = await prisma.shippingRegion.findUnique({
    where: { id: regionId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
  });

  if (!region) {
    res.status(404).json({ message: "shipping region not found" });
    return;
  }

  const schedules = await prisma.shippingSchedule.findMany({
    where: { regionId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: toAdminScheduleSelect(),
  });

  res.status(200).json({
    region,
    data: schedules,
  });
};

export const createAdminShippingSchedule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const regionId = req.params.id?.trim();
  if (!regionId) {
    res.status(400).json({ message: "region id is required" });
    return;
  }

  const region = await prisma.shippingRegion.findUnique({
    where: { id: regionId },
    select: { id: true },
  });
  if (!region) {
    res.status(404).json({ message: "shipping region not found" });
    return;
  }

  const body = req.body as CreateShippingScheduleBody;
  const company = body.company?.trim();
  const shipName = body.shipName?.trim();
  const voyage = body.voyage?.trim();
  if (!company || !shipName || !voyage) {
    res
      .status(400)
      .json({ message: "company, shipName and voyage are required" });
    return;
  }

  const schedule = await prisma.shippingSchedule.create({
    data: {
      regionId,
      company,
      shipName,
      voyage,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
    select: toAdminScheduleSelect(),
  });

  res.status(201).json({ schedule });
};

export const updateAdminShippingSchedule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const scheduleId = req.params.id?.trim();
  if (!scheduleId) {
    res.status(400).json({ message: "schedule id is required" });
    return;
  }

  const body = req.body as UpdateShippingScheduleBody;
  const data: Prisma.ShippingScheduleUpdateInput = {
    ...(body.company !== undefined ? { company: body.company.trim() } : {}),
    ...(body.shipName !== undefined ? { shipName: body.shipName.trim() } : {}),
    ...(body.voyage !== undefined ? { voyage: body.voyage.trim() } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
  };

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "at least one field is required" });
    return;
  }

  try {
    const schedule = await prisma.shippingSchedule.update({
      where: { id: scheduleId },
      data,
      select: toAdminScheduleSelect(),
    });
    res.status(200).json({ schedule });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "shipping schedule not found" });
      return;
    }
    throw error;
  }
};

export const deleteAdminShippingSchedule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const scheduleId = req.params.id?.trim();
  if (!scheduleId) {
    res.status(400).json({ message: "schedule id is required" });
    return;
  }

  try {
    await prisma.shippingSchedule.update({
      where: { id: scheduleId },
      data: { isActive: false },
    });
    res
      .status(200)
      .json({ message: "shipping schedule deactivated successfully" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "shipping schedule not found" });
      return;
    }
    throw error;
  }
};

export const replaceAdminShippingScheduleDepartures = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const scheduleId = req.params.id?.trim();
  if (!scheduleId) {
    res.status(400).json({ message: "schedule id is required" });
    return;
  }

  const body = req.body as ReplaceDeparturesBody;
  const entries = body.entries ?? [];
  const seenPorts = new Set<string>();
  for (const entry of entries) {
    const key = entry.portName.trim().toLowerCase();
    if (seenPorts.has(key)) {
      res
        .status(400)
        .json({ message: "duplicate departure port names are not allowed" });
      return;
    }
    seenPorts.add(key);
  }

  try {
    const schedule = await prisma.$transaction(async (tx) => {
      const existing = await tx.shippingSchedule.findUnique({
        where: { id: scheduleId },
        select: { id: true },
      });

      if (!existing) {
        return null;
      }

      await tx.shippingDepartureEntry.deleteMany({
        where: { scheduleId },
      });

      if (entries.length > 0) {
        await tx.shippingDepartureEntry.createMany({
          data: entries.map((entry, index) => ({
            scheduleId,
            portName: entry.portName.trim(),
            etdText: entry.etdText.trim(),
            sortOrder: entry.sortOrder ?? index,
          })),
        });
      }

      return tx.shippingSchedule.findUnique({
        where: { id: scheduleId },
        select: toAdminScheduleSelect(),
      });
    });

    if (!schedule) {
      res.status(404).json({ message: "shipping schedule not found" });
      return;
    }

    res.status(200).json({ schedule });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res
        .status(409)
        .json({ message: "duplicate departure port names are not allowed" });
      return;
    }
    throw error;
  }
};

export const replaceAdminShippingScheduleArrivals = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const scheduleId = req.params.id?.trim();
  if (!scheduleId) {
    res.status(400).json({ message: "schedule id is required" });
    return;
  }

  const body = req.body as ReplaceArrivalsBody;
  const entries = body.entries ?? [];
  const seenPorts = new Set<string>();
  for (const entry of entries) {
    const key = entry.portName.trim().toLowerCase();
    if (seenPorts.has(key)) {
      res
        .status(400)
        .json({ message: "duplicate arrival port names are not allowed" });
      return;
    }
    seenPorts.add(key);
  }

  try {
    const schedule = await prisma.$transaction(async (tx) => {
      const existing = await tx.shippingSchedule.findUnique({
        where: { id: scheduleId },
        select: { id: true },
      });

      if (!existing) {
        return null;
      }

      await tx.shippingArrivalEntry.deleteMany({
        where: { scheduleId },
      });

      if (entries.length > 0) {
        await tx.shippingArrivalEntry.createMany({
          data: entries.map((entry, index) => ({
            scheduleId,
            portName: entry.portName.trim(),
            etaText: entry.etaText.trim(),
            sortOrder: entry.sortOrder ?? index,
          })),
        });
      }

      return tx.shippingSchedule.findUnique({
        where: { id: scheduleId },
        select: toAdminScheduleSelect(),
      });
    });

    if (!schedule) {
      res.status(404).json({ message: "shipping schedule not found" });
      return;
    }

    res.status(200).json({ schedule });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res
        .status(409)
        .json({ message: "duplicate arrival port names are not allowed" });
      return;
    }
    throw error;
  }
};

export const getAdminShippingScheduleById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!requireAdmin(res)) {
    return;
  }

  const scheduleId = req.params.id?.trim();
  if (!scheduleId) {
    res.status(400).json({ message: "schedule id is required" });
    return;
  }

  const schedule = await prisma.shippingSchedule.findUnique({
    where: { id: scheduleId },
    select: toAdminScheduleSelect(),
  });

  if (!schedule) {
    res.status(404).json({ message: "shipping schedule not found" });
    return;
  }

  res.status(200).json({ schedule });
};
