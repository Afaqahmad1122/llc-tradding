import bcrypt from "bcrypt";
import { env } from "../config/env.js";

const PASSWORD_MIN_LENGTH = 8;
const LOWERCASE_PATTERN = /[a-z]/;
const UPPERCASE_PATTERN = /[A-Z]/;
const DIGIT_PATTERN = /[0-9]/;

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
};

export const verifyPassword = async (
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, passwordHash);
};

export const validatePasswordStrength = (password: string): string | null => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "password must be at least 8 characters";
  }
  if (!LOWERCASE_PATTERN.test(password)) {
    return "password must include at least one lowercase letter";
  }
  if (!UPPERCASE_PATTERN.test(password)) {
    return "password must include at least one uppercase letter";
  }
  if (!DIGIT_PATTERN.test(password)) {
    return "password must include at least one number";
  }
  return null;
};
