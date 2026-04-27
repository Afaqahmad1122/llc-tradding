import { Router } from "express";
import {
  createContactMessage,
  getAdminContactMessageById,
  getAdminContactMessages,
  updateAdminContactMessage,
} from "../controllers/contact-messages.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  createContactMessageSchema,
  updateContactMessageSchema,
} from "../validations/contact-messages.validation.js";

export const contactMessagesRouter = Router();

contactMessagesRouter.post(
  "/",
  validateRequestBody(createContactMessageSchema),
  createContactMessage,
);

contactMessagesRouter.get("/admin", requireAuth, getAdminContactMessages);
contactMessagesRouter.get("/admin/:id", requireAuth, getAdminContactMessageById);
contactMessagesRouter.patch(
  "/admin/:id",
  requireAuth,
  validateRequestBody(updateContactMessageSchema),
  updateAdminContactMessage,
);
