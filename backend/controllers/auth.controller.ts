import type { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { refreshCookieOptions } from "../config/security.js";
import { sendPasswordResetOtpEmail, sendVerificationOtpEmail } from "../utils/email.js";
import { hashPassword, validatePasswordStrength, verifyPassword } from "../utils/password.js";
import {
  generateOtpCode,
  getOtpExpiryDate,
  getOtpMaxAttempts,
  hashOtpCode,
  isOtpFormatValid,
  isOtpCodeMatch,
  isOtpExpired,
} from "../utils/otp.js";
import {
  getTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const REFRESH_COOKIE_NAME = "refreshToken";

type AuthBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
};

type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  role: string;
};

const PROFILE_FIELD_KEYS = ["phone", "country", "city", "address", "postalCode"] as const;
const UPDATE_PROFILE_FIELD_KEYS = ["name", ...PROFILE_FIELD_KEYS] as const;
type UpdateProfileData = {
  name?: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
};
const PROFILE_MAX_LENGTHS = {
  name: 100,
  phone: 32,
  country: 100,
  city: 100,
  address: 255,
  postalCode: 20,
} as const;
const POSTAL_CODE_PATTERN = /^[a-z0-9\s-]+$/i;
const PHONE_PATTERN = /^\+?[0-9()\-\s]{7,20}$/;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const normalizeOtp = (otp: string): string => otp.trim();
const neutralForgotPasswordResponse = {
  message: "if the account exists, a password reset code has been sent",
};

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions,
    expires: getTokenExpiryDate(token),
  });
};

const sendAuthSuccess = (res: Response, user: PublicUser): void => {
  const auth = getAuthResponse(user);
  setRefreshCookie(res, auth.refreshToken);
  res.status(200).json({ accessToken: auth.accessToken, user: auth.user });
};

const getAuthResponse = (user: PublicUser) => {
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
      phone: user.phone,
      country: user.country,
      city: user.city,
      address: user.address,
      postalCode: user.postalCode,
      role: user.role,
    },
  };
};

const getPublicUser = (user: PublicUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  country: user.country,
  city: user.city,
  address: user.address,
  postalCode: user.postalCode,
  role: user.role,
});

const validatePasswordInput = (
  password: string,
  confirmPassword: string | undefined,
): string | null => {
  const strengthError = validatePasswordStrength(password);
  if (strengthError) {
    return strengthError;
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return "passwords do not match";
  }
  return null;
};

const findUserForLogin = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      address: true,
      postalCode: true,
      role: true,
      passwordHash: true,
      emailVerifiedAt: true,
      isActive: true,
    },
  });
};

const parseProfileData = (
  body: AuthBody,
  mode: "register" | "update",
): { data: Partial<Record<(typeof PROFILE_FIELD_KEYS)[number], string | null>>; error?: string } => {
  const data: Partial<Record<(typeof PROFILE_FIELD_KEYS)[number], string | null>> = {};
  for (const key of PROFILE_FIELD_KEYS) {
    const rawValue = body[key];
    if (rawValue === undefined) {
      continue;
    }

    const value = rawValue.trim();
    if (!value) {
      if (mode === "update") {
        data[key] = null;
      }
      continue;
    }

    if (value.length > PROFILE_MAX_LENGTHS[key]) {
      return { data: {}, error: `${key} exceeds allowed length` };
    }

    if (key === "phone" && !PHONE_PATTERN.test(value)) {
      return { data: {}, error: "invalid phone format" };
    }

    if (key === "postalCode" && !POSTAL_CODE_PATTERN.test(value)) {
      return { data: {}, error: "invalid postalCode format" };
    }

    data[key] = value;
  }

  return { data };
};

const parseUpdateProfileData = (
  body: AuthBody,
): { data: UpdateProfileData; error?: string } => {
  const data: UpdateProfileData = {};

  for (const key of UPDATE_PROFILE_FIELD_KEYS) {
    const rawValue = body[key];
    if (rawValue === undefined) {
      continue;
    }

    const value = rawValue.trim();
    if (!value) {
      if (key === "name") {
        return { data: {}, error: "name is required" };
      }
      data[key] = null;
      continue;
    }

    if (value.length > PROFILE_MAX_LENGTHS[key]) {
      return { data: {}, error: `${key} exceeds allowed length` };
    }

    if (key === "phone" && !PHONE_PATTERN.test(value)) {
      return { data: {}, error: "invalid phone format" };
    }

    if (key === "postalCode" && !POSTAL_CODE_PATTERN.test(value)) {
      return { data: {}, error: "invalid postalCode format" };
    }

    data[key] = value;
  }

  return { data };
};

const verifyLoginEligibility = async (
  user: Awaited<ReturnType<typeof findUserForLogin>>,
  password: string,
): Promise<string | null> => {
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return "invalid email or password";
  }
  if (!user.isActive) {
    return "account is inactive";
  }
  if (!user.emailVerifiedAt) {
    return "email not verified";
  }
  return null;
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

  const passwordValidationError = validatePasswordInput(password, confirmPassword);
  if (passwordValidationError) {
    res.status(400).json({ message: passwordValidationError });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const parsedProfile = parseProfileData(body, "register");
  if (parsedProfile.error) {
    res.status(400).json({ message: parsedProfile.error });
    return;
  }
  const otpCode = generateOtpCode();
  const otpCodeHash = hashOtpCode(normalizedEmail, otpCode);
  const otpCodeExpiresAt = getOtpExpiryDate();
  const otpCodeSentAt = new Date();

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
      otpCodeHash,
      otpCodeExpiresAt,
      otpCodeSentAt,
      ...parsedProfile.data,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      address: true,
      postalCode: true,
      role: true,
    },
  });

  try {
    await sendVerificationOtpEmail(user.email, user.name, otpCode);
  } catch (error) {
    console.error("Verification OTP email send failed", error);
    res.status(500).json({ message: "account created but failed to send verification code email" });
    return;
  }

  res.status(201).json({
    user: getPublicUser(user),
    verification: {
      otpSent: true,
    },
  });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AuthBody;
  const email = body.email?.trim();
  const otp = body.otp?.trim();

  if (!email || !otp) {
    res.status(400).json({ message: "email and otp are required" });
    return;
  }

  if (!isOtpFormatValid(normalizeOtp(otp))) {
    res.status(400).json({ message: "invalid otp format" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      address: true,
      postalCode: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      otpCodeHash: true,
      otpCodeExpiresAt: true,
      otpCodeAttempts: true,
    },
  });

  if (!user || !user.isActive) {
    res.status(401).json({ message: "invalid otp" });
    return;
  }

  if (user.emailVerifiedAt) {
    res.status(200).json({ message: "email already verified, please login" });
    return;
  }

  if (!user.otpCodeHash || !user.otpCodeExpiresAt) {
    res.status(400).json({ message: "otp not available, request a new one" });
    return;
  }

  if (user.otpCodeAttempts >= getOtpMaxAttempts()) {
    res.status(429).json({ message: "too many invalid otp attempts" });
    return;
  }

  if (isOtpExpired(user.otpCodeExpiresAt)) {
    res.status(400).json({ message: "otp expired" });
    return;
  }

  const validOtp = isOtpCodeMatch(normalizedEmail, normalizeOtp(otp), user.otpCodeHash);
  if (!validOtp) {
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCodeAttempts: { increment: 1 } },
    });
    res.status(400).json({ message: "invalid otp" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      otpCodeHash: null,
      otpCodeExpiresAt: null,
      otpCodeAttempts: 0,
    },
  });

  res.status(200).json({ message: "email verified successfully, please login" });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AuthBody;
  const email = body.email?.trim();

  if (!email) {
    res.status(400).json({ message: "email is required" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    res.status(200).json(neutralForgotPasswordResponse);
    return;
  }

  const otpCode = generateOtpCode();
  const passwordResetOtpHash = hashOtpCode(normalizedEmail, otpCode);
  const passwordResetOtpExpiresAt = getOtpExpiryDate();
  const passwordResetOtpSentAt = new Date();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetOtpHash,
      passwordResetOtpExpiresAt,
      passwordResetOtpSentAt,
      passwordResetOtpAttempts: 0,
    },
  });

  try {
    await sendPasswordResetOtpEmail(user.email, user.name, otpCode);
  } catch (error) {
    console.error("Password reset OTP email send failed", error);
  }

  res.status(200).json(neutralForgotPasswordResponse);
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AuthBody;
  const email = body.email?.trim();
  const otp = body.otp?.trim();
  const newPassword = body.newPassword;
  const confirmNewPassword = body.confirmNewPassword;

  if (!email || !otp || !newPassword) {
    res.status(400).json({ message: "email, otp and newPassword are required" });
    return;
  }

  if (!isOtpFormatValid(normalizeOtp(otp))) {
    res.status(400).json({ message: "invalid otp format" });
    return;
  }

  const passwordValidationError = validatePasswordInput(newPassword, confirmNewPassword);
  if (passwordValidationError) {
    res.status(400).json({ message: passwordValidationError });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      isActive: true,
      passwordResetOtpHash: true,
      passwordResetOtpExpiresAt: true,
      passwordResetOtpAttempts: true,
    },
  });

  if (!user || !user.isActive) {
    res.status(400).json({ message: "invalid or expired reset code" });
    return;
  }

  if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
    res.status(400).json({ message: "invalid or expired reset code" });
    return;
  }

  if (user.passwordResetOtpAttempts >= getOtpMaxAttempts()) {
    res.status(429).json({ message: "too many invalid otp attempts" });
    return;
  }

  if (isOtpExpired(user.passwordResetOtpExpiresAt)) {
    res.status(400).json({ message: "invalid or expired reset code" });
    return;
  }

  const validOtp = isOtpCodeMatch(normalizedEmail, normalizeOtp(otp), user.passwordResetOtpHash);
  if (!validOtp) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtpAttempts: { increment: 1 },
      },
    });
    res.status(400).json({ message: "invalid or expired reset code" });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetOtpHash: null,
      passwordResetOtpExpiresAt: null,
      passwordResetOtpAttempts: 0,
      passwordResetOtpSentAt: null,
    },
  });

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  res.status(200).json({ message: "password reset successful" });
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
  const user = await findUserForLogin(normalizedEmail);
  const eligibilityError = await verifyLoginEligibility(user, password);
  if (eligibilityError) {
    const statusCode = eligibilityError === "invalid email or password" ? 401 : 403;
    res.status(statusCode).json({ message: eligibilityError });
    return;
  }

  const authenticatedUser = user as NonNullable<typeof user>;
  sendAuthSuccess(res, authenticatedUser);
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as AuthBody;
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await findUserForLogin(normalizedEmail);
  const eligibilityError = await verifyLoginEligibility(user, password);
  if (eligibilityError) {
    const statusCode = eligibilityError === "invalid email or password" ? 401 : 403;
    res.status(statusCode).json({ message: eligibilityError });
    return;
  }

  const authenticatedUser = user as NonNullable<typeof user>;
  if (authenticatedUser.role !== UserRole.ADMIN) {
    res.status(403).json({ message: "admin access required" });
    return;
  }

  sendAuthSuccess(res, authenticatedUser);
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
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        city: true,
        address: true,
        postalCode: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
      res.status(401).json({ message: "invalid session" });
      return;
    }

    sendAuthSuccess(res, user);
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    res.status(401).json({ message: "invalid refresh token" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = res.locals.authUserId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  const body = req.body as AuthBody;
  const parsedProfile = parseUpdateProfileData(body);
  if (parsedProfile.error) {
    res.status(400).json({ message: parsedProfile.error });
    return;
  }

  if (Object.keys(parsedProfile.data).length === 0) {
    res.status(400).json({ message: "at least one profile field is required" });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: parsedProfile.data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      address: true,
      postalCode: true,
      role: true,
    },
  });

  res.status(200).json({ user: getPublicUser(updatedUser) });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  res.status(200).json({ success: true });
};
