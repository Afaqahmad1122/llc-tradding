import { http } from "@/lib/api/http";

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

export type LedgerPaymentStatus =
  | "NO_PAYMENT"
  | "FULLY_PAID"
  | "PARTIALLY_PAID";

export type LedgerEventType =
  | "DEAL_CREATED"
  | "DEAL_UPDATED"
  | "PAYMENT_ADDED"
  | "DOCUMENT_ADDED"
  | "DOCUMENT_UPDATED";

export type MyLedgerDealUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
};

export type MyLedgerDealCarImage = {
  id: string;
  url: string;
  altText: string | null;
};

export type MyLedgerDealCar = {
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
  images: MyLedgerDealCarImage[];
};

export type MyLedgerPayment = {
  id: string;
  amount: number | null;
  currency: LedgerCurrency;
  type: LedgerPaymentType;
  method: string;
  paidAt: string;
  referenceNo: string | null;
  createdAt: string;
};

export type MyLedgerDocument = {
  id: string;
  type: string;
  title: string;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MyLedgerEvent = {
  id: string;
  type: LedgerEventType;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type MyLedgerPaymentSummary = {
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: LedgerPaymentStatus;
  isOverdue: boolean;
  paidPercent: number;
};

export type MyLedgerDeal = {
  id: string;
  orderNumber: string;
  userId: string;
  carId: string;
  totalAmount: number | null;
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
  createdAt: string;
  updatedAt: string;
  user: MyLedgerDealUser;
  car: MyLedgerDealCar;
  payments: MyLedgerPayment[];
  documents: MyLedgerDocument[];
  events: MyLedgerEvent[];
  paymentSummary: MyLedgerPaymentSummary;
};

export type MyLedgerDealsResponse = {
  data: MyLedgerDeal[];
};

export function fetchMyLedgerDeals() {
  return http.get<MyLedgerDealsResponse>("/ledger/me");
}

export type MyLedgerDocumentDownloadResponse = {
  downloadUrl: string;
  expiresIn: number;
};

export function getMyLedgerDocumentDownload(dealId: string, documentId: string) {
  return http.get<MyLedgerDocumentDownloadResponse>(
    `/ledger/me/${encodeURIComponent(dealId)}/documents/${encodeURIComponent(documentId)}/download`,
  );
}

export type MyLedgerCarImageDownloadResponse = {
  downloadUrl: string;
  fileName: string;
  expiresIn: number;
};

export function getMyLedgerCarImageDownload(dealId: string, imageId: string) {
  return http.get<MyLedgerCarImageDownloadResponse>(
    `/ledger/me/${encodeURIComponent(dealId)}/images/${encodeURIComponent(imageId)}/download`,
  );
}
