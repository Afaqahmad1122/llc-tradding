import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
};

export const verifyPassword = async (
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, passwordHash);
};
