import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().url(),
  AWS_REGION: z.string().default(""),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  AWS_S3_BUCKET: z.string().default(""),
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  COOKIE_SECRET: z.string().min(64),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
