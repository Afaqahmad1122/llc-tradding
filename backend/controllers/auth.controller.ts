import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { refreshCookieOptions } from "../config/security.js";
import { sendPasswordResetOtpEmail, sendVerificationOtpEmail } from "../utils/email.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
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
const PASSWORD_MIN_LENGTH = 8;

type AuthBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

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

const getPublicUser = (user: { id: string; name: string; email: string; role: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const validatePasswordInput = (
  password: string,
  confirmPassword: string | undefined,
): string | null => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "password must be at least 8 characters";
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return "passwords do not match";
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
    },
    select: {
      id: true,
      name: true,
      email: true,
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
    const auth = getAuthResponse(user);
    setRefreshCookie(res, auth.refreshToken);
    res.status(200).json({ accessToken: auth.accessToken, user: auth.user });
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

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      otpCodeHash: null,
      otpCodeExpiresAt: null,
      otpCodeAttempts: 0,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const auth = getAuthResponse(verifiedUser);
  setRefreshCookie(res, auth.refreshToken);
  res.status(200).json({ accessToken: auth.accessToken, user: auth.user });
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
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      emailVerifiedAt: true,
      isActive: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ message: "invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: "account is inactive" });
    return;
  }

  if (!user.emailVerifiedAt) {
    res.status(403).json({ message: "email not verified" });
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
