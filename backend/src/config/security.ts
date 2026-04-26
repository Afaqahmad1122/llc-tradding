import type { CookieOptions } from "express";
import { env } from "./env.js";

const isProd = env.NODE_ENV === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  signed: true,
  path: "/",
};

export const refreshCookieOptions: CookieOptions = {
  ...authCookieOptions,
  sameSite: isProd ? "strict" : "lax",
};
