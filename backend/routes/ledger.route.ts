import { Router } from "express";
import express from "express";
import {
  addAdminLedgerPayment,
  createAdminLedgerDeal,
  createAdminLedgerDocument,
  createAdminLedgerNote,
  deleteAdminLedgerDeal,
  deleteAdminLedgerDocument,
  deleteAdminLedgerPayment,
  getAdminLedgerDealById,
  getAdminLedgerCarImageDownload,
  getAdminLedgerDeals,
  getAdminLedgerDocumentDownload,
  getAdminLedgerShipments,
  getMyLedgerCarImageDownload,
  getMyLedgerDeals,
  getMyLedgerDocumentDownload,
  presignAdminLedgerDocumentUpload,
  updateAdminLedgerDeal,
  updateAdminLedgerDocument,
  uploadAdminLedgerDocumentFile,
} from "../controllers/ledger.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequestBody } from "../middlewares/validate-request.middleware.js";
import {
  addLedgerPaymentSchema,
  createLedgerDealSchema,
  createLedgerDocumentSchema,
  createLedgerNoteSchema,
  presignLedgerDocumentSchema,
  updateLedgerDealSchema,
  updateLedgerDocumentSchema,
} from "../validations/ledger.validation.js";

export const ledgerRouter = Router();

ledgerRouter.get("/me", requireAuth, getMyLedgerDeals);
ledgerRouter.get(
  "/me/:id/documents/:documentId/download",
  requireAuth,
  getMyLedgerDocumentDownload,
);
ledgerRouter.get(
  "/me/:id/images/:imageId/download",
  requireAuth,
  getMyLedgerCarImageDownload,
);

ledgerRouter.use("/admin", requireAuth);

ledgerRouter.get("/admin", requirePermission("ledgerRead"), getAdminLedgerDeals);
ledgerRouter.get("/admin/shipments", requirePermission("shippingRead"), getAdminLedgerShipments);
ledgerRouter.post(
  "/admin",
  requirePermission("ledgerCreate"),
  validateRequestBody(createLedgerDealSchema),
  createAdminLedgerDeal,
);
ledgerRouter.get("/admin/:id", requirePermission("ledgerRead"), getAdminLedgerDealById);
ledgerRouter.patch(
  "/admin/:id",
  requirePermission("ledgerUpdate"),
  validateRequestBody(updateLedgerDealSchema),
  updateAdminLedgerDeal,
);
ledgerRouter.delete("/admin/:id", requirePermission("ledgerDelete"), deleteAdminLedgerDeal);

ledgerRouter.post(
  "/admin/:id/payments",
  requirePermission("ledgerUpdate"),
  validateRequestBody(addLedgerPaymentSchema),
  addAdminLedgerPayment,
);
ledgerRouter.delete(
  "/admin/:id/payments/:paymentId",
  requirePermission("ledgerUpdate"),
  deleteAdminLedgerPayment,
);

ledgerRouter.post(
  "/admin/:id/notes",
  requirePermission("ledgerUpdate"),
  validateRequestBody(createLedgerNoteSchema),
  createAdminLedgerNote,
);

ledgerRouter.post(
  "/admin/:id/documents/presign",
  requirePermission("ledgerUpdate"),
  validateRequestBody(presignLedgerDocumentSchema),
  presignAdminLedgerDocumentUpload,
);
ledgerRouter.post(
  "/admin/:id/documents",
  requirePermission("ledgerUpdate"),
  validateRequestBody(createLedgerDocumentSchema),
  createAdminLedgerDocument,
);
ledgerRouter.post(
  "/admin/:id/documents/upload",
  requirePermission("ledgerUpdate"),
  express.raw({
    type: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    limit: "50mb",
  }),
  uploadAdminLedgerDocumentFile,
);
ledgerRouter.patch(
  "/admin/:id/documents/:documentId",
  requirePermission("ledgerUpdate"),
  validateRequestBody(updateLedgerDocumentSchema),
  updateAdminLedgerDocument,
);
ledgerRouter.delete(
  "/admin/:id/documents/:documentId",
  requirePermission("ledgerUpdate"),
  deleteAdminLedgerDocument,
);
ledgerRouter.get(
  "/admin/:id/documents/:documentId/download",
  requirePermission("ledgerRead"),
  getAdminLedgerDocumentDownload,
);
ledgerRouter.get(
  "/admin/:id/images/:imageId/download",
  requirePermission("ledgerRead"),
  getAdminLedgerCarImageDownload,
);
