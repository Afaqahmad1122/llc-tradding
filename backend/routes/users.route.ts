import { Router } from "express";
import { listAdminCustomers } from "../controllers/users.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const usersRouter = Router();

usersRouter.get("/admin/customers", requireAuth, listAdminCustomers);
