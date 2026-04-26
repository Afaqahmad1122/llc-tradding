import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { refreshCookieOptions } from "../config/security.js";
import { generateOtpCode, sendVerificationOtpEmail } from "../utils/email.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  getTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const PASSWORD_MIN_LENGTH = 8;

type AuthBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions,
    expires: getTokenExpiryDate(token),
  });
};

const getAuthResponse = (user: { id: string; name: string; email: string; role: string }) => {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AuthBody;
  const name = body.name?.trim();
  const email = body.email?.trim();
  const password = body.password;
  const confirmPassword = body.confirmPassword;

  if (!name || !email || !password) {
    res.status(400).json({ message: "name, email and password are required" });
    return;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    res.status(400).json({ message: "password must be at least 8 characters" });
    return;
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    res.status(400).json({ message: "passwords do not match" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    res.status(409).json({ message: "email already in use" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const auth = getAuthResponse(user);
  setRefreshCookie(res, auth.refreshToken);

  try {
    const otpCode = generateOtpCode();
    await sendVerificationOtpEmail(user.email, user.name, otpCode);
  } catch (error) {
    console.error("Verification OTP email send failed", error);
    res.status(500).json({ message: "account created but failed to send verification code email" });
    return;
  }

  res.status(201).json({
    accessToken: auth.accessToken,
    user: auth.user,
    verification: {
      otpSent: true,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AuthBody;
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ message: "invalid email or password" });
    return;
  }

  const auth = getAuthResponse(user);
  setRefreshCookie(res, auth.refreshToken);
  res.status(200).json({ accessToken: auth.accessToken, user: auth.user });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.signedCookies?.[REFRESH_COOKIE_NAME] as string | undefined;

  if (!refreshToken) {
    res.status(401).json({ message: "refresh token missing" });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
      res.status(401).json({ message: "invalid session" });
      return;
    }

    const auth = getAuthResponse(user);
    setRefreshCookie(res, auth.refreshToken);
    res.status(200).json({ accessToken: auth.accessToken, user: auth.user });
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    res.status(401).json({ message: "invalid refresh token" });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  res.status(200).json({ success: true });
};
