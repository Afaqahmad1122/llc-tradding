import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  verifyOtp,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/login", login);
authRouter.post("/admin/login", adminLogin);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
