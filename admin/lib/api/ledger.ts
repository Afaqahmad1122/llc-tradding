import { http } from "@/lib/api/http";
import { apiClient } from "@/lib/api/client";

export type LedgerCurrency = "JPY" | "USD" | "PKR" | "AED";
export type LedgerDealType = "FOB" | "CNF" | "CIF";
export type LedgerDealStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "PAYMENT_COMPLETED"
  | "DOCUMENTS_DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";
export type LedgerPaymentType =
  | "DOWN_PAYMENT"
  | "INSTALLMENT"
  | "FINAL_PAYMENT"
  | "REFUND"
  | "ADJUSTMENT";
export type LedgerPaymentMethod =
  | "BANK_TRANSFER"
  | "CASH"
  | "CARD"
  | "ONLINE"
  | "OTHER";
export type LedgerDocumentType =
  | "INVOICE"
  | "PURCHASE_RECEIPT"
  | "INSPECTION_SHEET"
  | "EXPORT_CERTIFICATE"
  | "BILL_OF_LADING"
  | "SHIPPING_INVOICE"
  | "PAYMENT_RECEIPT"
  | "OTHER";

export type LedgerDealCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
};

export type LedgerDealCar = {
  id: string;
  referenceNo: string;
  title: string | null;
  year: number;
  chassisNo: string | null;
  priceJpy: number | null;
  priceUsd: number | null;
  pricePkr: number | null;
  model: {
    id: string;
    name: string;
    brand: string;
    bodyType: string | null;
  };
  images: Array<{ id: string; url: string; altText: string | null }>;
};

export type LedgerPayment = {
  id: string;
  amount: number;
  currency: LedgerCurrency;
  type: LedgerPaymentType;
  method: LedgerPaymentMethod;
  paidAt: string;
  referenceNo: string | null;
  note: string | null;
  createdAt: string;
  receivedBy: { id: string; name: string; email: string } | null;
};

export type LedgerDocument = {
  id: string;
  type: LedgerDocumentType;
  title: string;
  fileKey: string;
  fileUrl: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
  visibleToCustomer: boolean;
  note: string | null;
  createdAt: string;
  uploadedBy: { id: string; name: string; email: string } | null;
};

export type LedgerEvent = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  createdBy: { id: string; name: string; email: string } | null;
};

export type LedgerPaymentSummary = {
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus:
    | "NO_PAYMENT"
    | "FULLY_PAID"
    | "PARTIALLY_PAID";
  isOverdue: boolean;
  paidPercent: number;
};

export type LedgerSummaryCurrency = {
  currency: LedgerCurrency;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  dealCount: number;
  customerCount: number;
};

export type LedgerSummary = {
  dealCount: number;
  customerCount: number;
  byCurrency: LedgerSummaryCurrency[];
};

export type LedgerDeal = {
  id: string;
  orderNumber: string;
  userId: string;
  carId: string;
  totalAmount: number;
  currency: LedgerCurrency;
  dealType: LedgerDealType;
  downPaymentRequired: number | null;
  dueDate: string | null;
  shipmentOrigin: string | null;
  shipmentDestination: string | null;
  shippingLine: string | null;
  vesselName: string | null;
  estimatedDeparture: string | null;
  estimatedArrival: string | null;
  bookingNo: string | null;
  billOfLadingNo: string | null;
  currentLocation: string | null;
  shipmentNote: string | null;
  status: LedgerDealStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  user: LedgerDealCustomer;
  car: LedgerDealCar;
  payments: LedgerPayment[];
  documents: LedgerDocument[];
  events: LedgerEvent[];
  paymentSummary: LedgerPaymentSummary;
};

export type LedgerDealsResponse = {
  data: LedgerDeal[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: LedgerSummary;
};

export type LedgerDealsQuery = {
  page?: number;
  pageSize?: number;
  userId?: string;
  search?: string;
  status?: LedgerDealStatus;
  currency?: LedgerCurrency;
  paymentStatus?: "OVERDUE" | "FULLY_PAID" | "BALANCE_PENDING";
};

export type AdminLedgerShipment = {
  id: string;
  orderNumber: string;
  shipmentOrigin: string | null;
  shipmentDestination: string | null;
  shippingLine: string | null;
  vesselName: string | null;
  estimatedDeparture: string | null;
  estimatedArrival: string | null;
  bookingNo: string | null;
  billOfLadingNo: string | null;
  currentLocation: string | null;
  shipmentNote: string | null;
  status: LedgerDealStatus;
  updatedAt: string;
  documentCount: number;
  user: LedgerDealCustomer;
  car: Pick<LedgerDealCar, "id" | "referenceNo" | "title" | "chassisNo" | "model">;
};

export type AdminLedgerShipmentsResponse = {
  data: AdminLedgerShipment[];
  pagination: LedgerDealsResponse["pagination"];
};

export type AdminLedgerShipmentsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: LedgerDealStatus;
};

export type CreateLedgerDealBody = {
  orderNumber?: string;
  userId: string;
  carId: string;
  totalAmount: number;
  currency: LedgerCurrency;
  dealType?: LedgerDealType;
  downPaymentRequired?: number | null;
  dueDate?: string | null;
  shipmentOrigin?: string | null;
  shipmentDestination?: string | null;
  shippingLine?: string | null;
  vesselName?: string | null;
  estimatedDeparture?: string | null;
  estimatedArrival?: string | null;
  bookingNo?: string | null;
  billOfLadingNo?: string | null;
  currentLocation?: string | null;
  shipmentNote?: string | null;
  status?: LedgerDealStatus;
  note?: string | null;
};

export type UpdateLedgerDealBody = Partial<
  Omit<CreateLedgerDealBody, "userId" | "carId">
> & {
  userId?: string;
  carId?: string;
};

export type AddLedgerPaymentBody = {
  amount: number;
  currency?: LedgerCurrency;
  type: LedgerPaymentType;
  method: LedgerPaymentMethod;
  paidAt?: string;
  referenceNo?: string;
  note?: string | null;
};

export type PresignLedgerDocumentBody = {
  contentType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  ext: "pdf" | "jpg" | "jpeg" | "png" | "webp";
};

export type PresignLedgerDocumentResponse = {
  uploadUrl: string;
  key: string;
  fileUrl: string;
  expiresIn: number;
};

export type CreateLedgerDocumentBody = {
  type: LedgerDocumentType;
  title: string;
  fileKey: string;
  fileUrl?: string | null;
  fileName: string;
  mimeType: PresignLedgerDocumentBody["contentType"];
  fileSize?: number | null;
  visibleToCustomer: boolean;
  note?: string | null;
};

export type UploadLedgerDocumentFileBody = {
  type: LedgerDocumentType;
  title: string;
  file: File;
  visibleToCustomer?: boolean;
  note?: string | null;
};

export function fetchLedgerDeals(params: LedgerDealsQuery = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.userId) search.set("userId", params.userId);
  if (params.search) search.set("search", params.search);
  if (params.status) search.set("status", params.status);
  if (params.currency) search.set("currency", params.currency);
  if (params.paymentStatus) search.set("paymentStatus", params.paymentStatus);
  const qs = search.toString();
  return http.get<LedgerDealsResponse>(`/ledger/admin${qs ? `?${qs}` : ""}`);
}

export function fetchAdminLedgerShipments(params: AdminLedgerShipmentsQuery = {}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.search) search.set("search", params.search);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return http.get<AdminLedgerShipmentsResponse>(
    `/ledger/admin/shipments${qs ? `?${qs}` : ""}`,
  );
}

export function createLedgerDeal(body: CreateLedgerDealBody) {
  return http.post<{ deal: LedgerDeal }, CreateLedgerDealBody>("/ledger/admin", body);
}

export function fetchLedgerDeal(id: string) {
  return http.get<{ deal: LedgerDeal }>(`/ledger/admin/${encodeURIComponent(id)}`);
}

export function updateLedgerDeal(id: string, body: UpdateLedgerDealBody) {
  return http.patch<{ deal: LedgerDeal }, UpdateLedgerDealBody>(
    `/ledger/admin/${encodeURIComponent(id)}`,
    body,
  );
}

export function deleteLedgerDeal(id: string) {
  return http.delete<{ success: boolean }>(`/ledger/admin/${encodeURIComponent(id)}`);
}

export function addLedgerPayment(dealId: string, body: AddLedgerPaymentBody) {
  return http.post<
    { payment: LedgerPayment; deal: LedgerDeal | null },
    AddLedgerPaymentBody
  >(`/ledger/admin/${encodeURIComponent(dealId)}/payments`, body);
}

export function createLedgerNote(dealId: string, message: string) {
  return http.post<{ event: LedgerEvent }, { message: string }>(
    `/ledger/admin/${encodeURIComponent(dealId)}/notes`,
    { message },
  );
}

export function presignLedgerDocument(
  dealId: string,
  body: PresignLedgerDocumentBody,
) {
  return http.post<PresignLedgerDocumentResponse, PresignLedgerDocumentBody>(
    `/ledger/admin/${encodeURIComponent(dealId)}/documents/presign`,
    body,
  );
}

export function createLedgerDocument(
  dealId: string,
  body: CreateLedgerDocumentBody,
) {
  return http.post<{ document: LedgerDocument }, CreateLedgerDocumentBody>(
    `/ledger/admin/${encodeURIComponent(dealId)}/documents`,
    body,
  );
}

export async function uploadLedgerDocumentFile(
  dealId: string,
  body: UploadLedgerDocumentFileBody,
) {
  const response = await apiClient.post<{ document: LedgerDocument }>(
    `/ledger/admin/${encodeURIComponent(dealId)}/documents/upload`,
    body.file,
    {
      headers: {
        "Content-Type": body.file.type,
        "x-document-type": body.type,
        "x-document-title": encodeURIComponent(body.title),
        "x-file-name": encodeURIComponent(body.file.name),
        "x-visible-to-customer": String(body.visibleToCustomer ?? true),
        ...(body.note?.trim()
          ? { "x-document-note": encodeURIComponent(body.note.trim()) }
          : {}),
      },
      timeout: 60_000,
    },
  );
  return response.data;
}

export function getLedgerDocumentDownload(dealId: string, documentId: string) {
  return http.get<{ downloadUrl: string; expiresIn: number }>(
    `/ledger/admin/${encodeURIComponent(dealId)}/documents/${encodeURIComponent(documentId)}/download`,
  );
}

export function getLedgerCarImageDownload(dealId: string, imageId: string) {
  return http.get<{ downloadUrl: string; fileName: string; expiresIn: number }>(
    `/ledger/admin/${encodeURIComponent(dealId)}/images/${encodeURIComponent(imageId)}/download`,
  );
}
