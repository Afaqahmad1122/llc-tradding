import { Router } from "express";
import {
  createAdminCustomer,
  listAdminCustomers,
  listAllUsers,
} from "../controllers/users.controller.js";
import {
  createStaffUser,
  deleteStaffUser,
  listStaffUsers,
  updateStaffPermissions,
  updateStaffUser,
} from "../controllers/staff.controller.js";
import { requireAuth, requireAdminRole } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

export const usersRouter = Router();

usersRouter.get("/admin/customers", requireAuth, listAdminCustomers);
usersRouter.post("/admin/customers", requireAuth, requireAdminRole, createAdminCustomer);
usersRouter.get("/admin/all", requireAuth, listAllUsers);

usersRouter.get("/admin/staff", requireAuth, requirePermission("usersRead"), listStaffUsers);
usersRouter.post("/admin/staff", requireAuth, requirePermission("usersCreate"), createStaffUser);
usersRouter.patch("/admin/staff/:id", requireAuth, requirePermission("usersUpdate"), updateStaffUser);
usersRouter.patch("/admin/staff/:id/permissions", requireAuth, requireAdminRole, updateStaffPermissions);
usersRouter.delete("/admin/staff/:id", requireAuth, requirePermission("usersDelete"), deleteStaffUser);
