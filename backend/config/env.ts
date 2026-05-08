import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  DATABASE_URL: z.string().min(1),
  /** Comma-separated list of browser origins allowed to send credentialed requests (e.g. storefront + admin). */
  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform((raw) =>
      raw
        .split(",")
        .map((segment) => segment.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().url()).min(1)),
  AWS_REGION: z.string().default(""),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  AWS_S3_BUCKET: z.string().default(""),
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  COOKIE_SECRET: z.string().min(64),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((value) => value.toLowerCase() === "true"),
  /** SMTP username; full mailbox email (e.g. Hostinger) or provider-specific user (e.g. SendGrid: "apikey"). */
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  /** Inbox for career applications (mailto target after apply); same for every job. */
  JOB_APPLICATIONS_EMAIL: z
    .string()
    .email()
    .default("icctradingjp@gmail.com"),
  /**
   * Optional Open Exchange Rates app id. When unset, FX for the storefront calculator
   * falls back to the free Frankfurter API (EUR-centered; common pairs still covered).
   */
  OPEN_EXCHANGE_RATES_APP_ID: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
