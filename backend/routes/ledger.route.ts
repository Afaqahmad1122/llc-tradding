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
  getMyLedgerDeals,
  presignAdminLedgerDocumentUpload,
  updateAdminLedgerDeal,
  updateAdminLedgerDocument,
  uploadAdminLedgerDocumentFile,
} from "../controllers/ledger.controller.js";
import { requireAuth, requireAdminRole } from "../middlewares/auth.middleware.js";
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

ledgerRouter.use("/admin", requireAuth, requireAdminRole);

ledgerRouter.get("/admin", getAdminLedgerDeals);
ledgerRouter.post(
  "/admin",
  validateRequestBody(createLedgerDealSchema),
  createAdminLedgerDeal,
);
ledgerRouter.get("/admin/:id", getAdminLedgerDealById);
ledgerRouter.patch(
  "/admin/:id",
  validateRequestBody(updateLedgerDealSchema),
  updateAdminLedgerDeal,
);
ledgerRouter.delete("/admin/:id", deleteAdminLedgerDeal);

ledgerRouter.post(
  "/admin/:id/payments",
  validateRequestBody(addLedgerPaymentSchema),
  addAdminLedgerPayment,
);
ledgerRouter.delete("/admin/:id/payments/:paymentId", deleteAdminLedgerPayment);

ledgerRouter.post(
  "/admin/:id/notes",
  validateRequestBody(createLedgerNoteSchema),
  createAdminLedgerNote,
);

ledgerRouter.post(
  "/admin/:id/documents/presign",
  validateRequestBody(presignLedgerDocumentSchema),
  presignAdminLedgerDocumentUpload,
);
ledgerRouter.post(
  "/admin/:id/documents",
  validateRequestBody(createLedgerDocumentSchema),
  createAdminLedgerDocument,
);
ledgerRouter.post(
  "/admin/:id/documents/upload",
  express.raw({
    type: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    limit: "50mb",
  }),
  uploadAdminLedgerDocumentFile,
);
ledgerRouter.patch(
  "/admin/:id/documents/:documentId",
  validateRequestBody(updateLedgerDocumentSchema),
  updateAdminLedgerDocument,
);
ledgerRouter.delete("/admin/:id/documents/:documentId", deleteAdminLedgerDocument);
ledgerRouter.get(
  "/admin/:id/documents/:documentId/download",
  getAdminLedgerDocumentDownload,
);
ledgerRouter.get(
  "/admin/:id/images/:imageId/download",
  getAdminLedgerCarImageDownload,
);
