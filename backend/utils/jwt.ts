import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
  sub: string;
  role: string;
};

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: parseTtlToSeconds(env.ACCESS_TOKEN_TTL),
  });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: parseTtlToSeconds(env.REFRESH_TOKEN_TTL),
  });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const getTokenExpiryDate = (token: string): Date | undefined => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    return undefined;
  }
  return new Date(decoded.exp * 1000);
};

const parseTtlToSeconds = (value: string): number => {
  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d+)(s|m|h|d)?$/);

  if (!match) {
    throw new Error(`Invalid token TTL format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? "s";
  const multiplier =
    unit === "d" ? 86400 : unit === "h" ? 3600 : unit === "m" ? 60 : 1;

  return amount * multiplier;
};
