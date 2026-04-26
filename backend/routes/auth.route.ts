import { Router } from "express";
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

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/login", login);
authRouter.post("/admin/login", adminLogin);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.patch("/profile", requireAuth, updateProfile);
