import crypto from "crypto";
import { timingSafeEqual } from "crypto";
import { env } from "../config/env.js";

const OTP_LENGTH = 6;
const OTP_MAX_ATTEMPTS = 5;
const OTP_TTL_MINUTES = 10;

const padOtp = (value: number): string => value.toString().padStart(OTP_LENGTH, "0");

export const generateOtpCode = (): string => padOtp(crypto.randomInt(0, 1_000_000));

export const hashOtpCode = (email: string, code: string): string => {
  return crypto
    .createHmac("sha256", env.COOKIE_SECRET)
    .update(`${email.trim().toLowerCase()}:${code}`)
    .digest("hex");
};

export const isOtpCodeMatch = (email: string, code: string, expectedHash: string): boolean => {
  const computedHash = hashOtpCode(email, code);
  const a = Buffer.from(computedHash, "utf8");
  const b = Buffer.from(expectedHash, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
};

export const getOtpExpiryDate = (): Date => {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
};

export const isOtpExpired = (expiresAt: Date): boolean => expiresAt.getTime() <= Date.now();

export const getOtpMaxAttempts = (): number => OTP_MAX_ATTEMPTS;

export const isOtpFormatValid = (otp: string): boolean => {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp.trim());
};
