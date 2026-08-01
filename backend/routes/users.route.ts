import { Router } from "express";
import { listAdminCustomers, listAllUsers } from "../controllers/users.controller.js";
import {
  createStaffUser,
  deleteStaffUser,
  listStaffUsers,
  updateStaffPermissions,
  updateStaffUser,
} from "../controllers/staff.controller.js";
import { requireAuth, requireAdminRole } from "../middlewares/auth.middleware.js";

export const usersRouter = Router();

usersRouter.get("/admin/customers", requireAuth, listAdminCustomers);
usersRouter.get("/admin/all", requireAuth, listAllUsers);

usersRouter.get("/admin/staff", requireAuth, requireAdminRole, listStaffUsers);
usersRouter.post("/admin/staff", requireAuth, requireAdminRole, createStaffUser);
usersRouter.patch("/admin/staff/:id", requireAuth, requireAdminRole, updateStaffUser);
usersRouter.patch("/admin/staff/:id/permissions", requireAuth, requireAdminRole, updateStaffPermissions);
usersRouter.delete("/admin/staff/:id", requireAuth, requireAdminRole, deleteStaffUser);
