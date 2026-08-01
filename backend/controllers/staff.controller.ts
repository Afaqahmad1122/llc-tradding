import type { Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { hashPassword, validatePasswordStrength } from "../utils/password.js";

const PERMISSION_FIELDS = [
  "carsCreate", "carsRead", "carsUpdate", "carsDelete",
  "shippingCreate", "shippingRead", "shippingUpdate", "shippingDelete",
  "reviewsCreate", "reviewsRead", "reviewsUpdate", "reviewsDelete",
  "contactCreate", "contactRead", "contactUpdate", "contactDelete",
  "careersCreate", "careersRead", "careersUpdate", "careersDelete",
] as const;

type PermissionField = (typeof PERMISSION_FIELDS)[number];

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const STAFF_SELECT = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  createdAt: true,
  staffPermission: {
    select: {
      carsCreate: true,
      carsRead: true,
      carsUpdate: true,
      carsDelete: true,
      shippingCreate: true,
      shippingRead: true,
      shippingUpdate: true,
      shippingDelete: true,
      reviewsCreate: true,
      reviewsRead: true,
      reviewsUpdate: true,
      reviewsDelete: true,
      contactCreate: true,
      contactRead: true,
      contactUpdate: true,
      contactDelete: true,
      careersCreate: true,
      careersRead: true,
      careersUpdate: true,
      careersDelete: true,
    },
  },
} as const;

export const listStaffUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    where: { role: "STAFF" as UserRole },
    select: STAFF_SELECT,
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ users });
};

export const createStaffUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ message: "name, email and password are required" });
    return;
  }

  const strengthError = validatePasswordStrength(password);
  if (strengthError) {
    res.status(400).json({ message: strengthError });
    return;
  }

  const normalizedEmail = normalizeEmail(email);

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    res.status(409).json({ message: "email already in use" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "STAFF" as UserRole,
      emailVerifiedAt: new Date(),
      staffPermission: { create: {} },
    },
    select: STAFF_SELECT,
  });

  res.status(201).json({ user });
};

export const updateStaffUser = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name, email, password, isActive } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
  };

  const staff = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!staff || (staff.role as string) !== "STAFF") {
    res.status(404).json({ message: "staff user not found" });
    return;
  }

  const data: Record<string, unknown> = {};

  if (name !== undefined) {
    if (!name.trim()) {
      res.status(400).json({ message: "name cannot be empty" });
      return;
    }
    data.name = name.trim();
  }

  if (email !== undefined) {
    if (!email.trim()) {
      res.status(400).json({ message: "email cannot be empty" });
      return;
    }
    const normalizedEmail = normalizeEmail(email);
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing && existing.id !== id) {
      res.status(409).json({ message: "email already in use" });
      return;
    }
    data.email = normalizedEmail;
  }

  if (password !== undefined) {
    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      res.status(400).json({ message: strengthError });
      return;
    }
    data.passwordHash = await hashPassword(password);
  }

  if (isActive !== undefined) {
    data.isActive = Boolean(isActive);
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "no fields to update" });
    return;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: STAFF_SELECT,
  });

  res.status(200).json({ user });
};

export const updateStaffPermissions = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const body = req.body as Partial<Record<PermissionField, boolean>>;

  const staff = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!staff || (staff.role as string) !== "STAFF") {
    res.status(404).json({ message: "staff user not found" });
    return;
  }

  const data: Partial<Record<PermissionField, boolean>> = {};
  for (const field of PERMISSION_FIELDS) {
    if (field in body) {
      data[field] = Boolean(body[field]);
    }
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "no permission fields provided" });
    return;
  }

  const permission = await prisma.staffPermission.upsert({
    where: { userId: id },
    update: data,
    create: { userId: id, ...data },
    select: {
      carsCreate: true,
      carsRead: true,
      carsUpdate: true,
      carsDelete: true,
      shippingCreate: true,
      shippingRead: true,
      shippingUpdate: true,
      shippingDelete: true,
      reviewsCreate: true,
      reviewsRead: true,
      reviewsUpdate: true,
      reviewsDelete: true,
      contactCreate: true,
      contactRead: true,
      contactUpdate: true,
      contactDelete: true,
      careersCreate: true,
      careersRead: true,
      careersUpdate: true,
      careersDelete: true,
    },
  });

  res.status(200).json({ permissions: permission });
};

export const deleteStaffUser = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const staff = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!staff || (staff.role as string) !== "STAFF") {
    res.status(404).json({ message: "staff user not found" });
    return;
  }

  await prisma.user.delete({ where: { id } });

  res.status(200).json({ success: true });
};
