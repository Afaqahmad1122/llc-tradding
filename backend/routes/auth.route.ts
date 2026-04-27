import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  updateProfile,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyOtpSchema,
} from "../validations/auth.validation.js";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "too many login attempts, try again later" },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "too many otp attempts, try again later" },
});

authRouter.post("/register", otpLimiter, validateRequestBody(registerSchema), register);
authRouter.post("/verify-otp", otpLimiter, validateRequestBody(verifyOtpSchema), verifyOtp);
authRouter.post(
  "/forgot-password",
  otpLimiter,
  validateRequestBody(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/reset-password",
  otpLimiter,
  validateRequestBody(resetPasswordSchema),
  resetPassword,
);
authRouter.post("/login", loginLimiter, validateRequestBody(loginSchema), login);
authRouter.post("/admin/login", loginLimiter, validateRequestBody(loginSchema), adminLogin);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.patch("/profile", requireAuth, validateRequestBody(updateProfileSchema), updateProfile);
