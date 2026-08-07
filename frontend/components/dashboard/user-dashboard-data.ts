import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  ReceiptText,
  Ship,
  Truck,
} from "lucide-react";

import type {
  LedgerDealStatus,
  LedgerEventType,
  LedgerPaymentType,
  MyLedgerDeal,
} from "@/lib/api/ledger";

export type DashboardOrderStatus =
  | "Pending confirmation"
  | "Confirmed"
  | "In transit"
  | "Arrived"
  | "Payment completed"
  | "Documents dispatched"
  | "Delivered"
  | "Cancelled";

export type DashboardShipmentEvent = {
  title: string;
  description: string;
  date: string;
  state: "complete" | "current" | "upcoming";
};

export type DashboardOrderDocument = {
  id: string;
  title: string;
  type: string;
  fileName: string;
  createdAt: string;
};

export type DashboardOrderImage = {
  id: string;
  url: string;
  altText: string | null;
};

export type DashboardPayment = {
  id: string;
  amount: string;
  type: LedgerPaymentType;
  typeLabel: string;
  method: string;
  paidAt: string;
  referenceNo: string | null;
};

export const paymentTypeLabels: Record<LedgerPaymentType, string> = {
  DOWN_PAYMENT: "Down payment",
  INSTALLMENT: "Installment",
  FINAL_PAYMENT: "Final payment",
  REFUND: "Refund",
  ADJUSTMENT: "Adjustment",
};

export const paymentTypeStyles: Record<LedgerPaymentType, string> = {
  DOWN_PAYMENT: "border-sky-200 bg-sky-50 text-sky-700",
  INSTALLMENT: "border-indigo-200 bg-indigo-50 text-indigo-700",
  FINAL_PAYMENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REFUND: "border-amber-200 bg-amber-50 text-amber-700",
  ADJUSTMENT: "border-violet-200 bg-violet-50 text-violet-700",
};

function formatMethodLabel(method: string) {
  return method
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type DashboardOrder = {
  id: string;
  orderNumber: string;
  carName: string;
  referenceNo: string;
  chassisNo: string;
  image: string | null;
  images: DashboardOrderImage[];
  status: DashboardOrderStatus;
  statusCode: LedgerDealStatus;
  paymentStatus: string;
  totalAmount: string;
  downPayment: string;
  paidAmount: string;
  balance: string;
  remainingBalanceAmount: number;
  orderedAt: string;
  eta: string;
  progress: number;
  paymentProgress: number;
  portFrom: string;
  portTo: string;
  vesselName: string;
  bookingNo: string;
  billOfLadingNo: string;
  currentLocation: string;
  shipmentNote: string;
  documentsReady: number;
  documents: DashboardOrderDocument[];
  currency: string;
  payments: DashboardPayment[];
  timeline: DashboardShipmentEvent[];
  isActive: boolean;
  isInTransit: boolean;
  isOverdue: boolean;
};

export const orderStatusStyles: Record<DashboardOrderStatus, string> = {
  "Pending confirmation": "border-amber-200 bg-amber-50 text-amber-700",
  Confirmed: "border-sky-200 bg-sky-50 text-sky-700",
  "In transit": "border-indigo-200 bg-indigo-50 text-indigo-700",
  Arrived: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Payment completed": "border-green-200 bg-green-50 text-green-700",
  "Documents dispatched": "border-violet-200 bg-violet-50 text-violet-700",
  Delivered: "border-green-200 bg-green-50 text-green-700",
  Cancelled: "border-red-200 bg-red-50 text-red-700",
};

export const eventIcons = {
  complete: CheckCircle2,
  current: Ship,
  upcoming: Clock3,
};

export const statIcons = {
  activeOrders: Truck,
  eta: Ship,
  nextAction: Clock3,
  documents: FileCheck2,
  payment: ReceiptText,
};

const statusLabels: Record<LedgerDealStatus, DashboardOrderStatus> = {
  PENDING_CONFIRMATION: "Pending confirmation",
  CONFIRMED: "Confirmed",
  IN_TRANSIT: "In transit",
  ARRIVED: "Arrived",
  PAYMENT_COMPLETED: "Payment completed",
  DOCUMENTS_DISPATCHED: "Documents dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusProgress: Record<LedgerDealStatus, number> = {
  PENDING_CONFIRMATION: 12,
  CONFIRMED: 28,
  IN_TRANSIT: 68,
  ARRIVED: 84,
  PAYMENT_COMPLETED: 90,
  DOCUMENTS_DISPATCHED: 95,
  DELIVERED: 100,
  CANCELLED: 0,
};

const eventCopy: Record<LedgerEventType, { title: string; description: string }> = {
  DEAL_CREATED: {
    title: "Order confirmed",
    description: "ICC team linked this car order to your account.",
  },
  DEAL_UPDATED: {
    title: "Order updated",
    description: "Order details were updated by the ICC team.",
  },
  PAYMENT_ADDED: {
    title: "Payment received",
    description: "A payment was recorded against this order.",
  },
  DOCUMENT_ADDED: {
    title: "Document uploaded",
    description: "A car document is ready in your order record.",
  },
  DOCUMENT_UPDATED: {
    title: "Document updated",
    description: "A car document was updated by the ICC team.",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDashboardDate(value: string | null | undefined) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "Awaiting schedule";
}

export function formatDashboardShortDate(value: string | null | undefined) {
  const date = parseDate(value);
  return date ? shortDateFormatter.format(date) : "Awaiting";
}

function formatMoney(amount: number | null | undefined, currency: string) {
  const numericAmount = Number(amount ?? 0);
  return `${currency} ${numericAmount.toLocaleString("en-US", {
    maximumFractionDigits: Number.isInteger(numericAmount) ? 0 : 2,
  })}`;
}

function getCustomerPaymentLabel(deal: MyLedgerDeal) {
  if (deal.paymentSummary.isOverdue) return "Overdue";
  if (deal.paymentSummary.remainingBalance <= 0) return "Paid";
  if (deal.paymentSummary.paidAmount > 0) return "Balance pending";
  return "No payment";
}

function getCarName(deal: MyLedgerDeal) {
  if (deal.car.title?.trim()) return deal.car.title.trim();
  const parts = [deal.car.model.brand, deal.car.model.name, deal.car.year].filter(Boolean);
  return parts.join(" ");
}

function getDestination(deal: MyLedgerDeal) {
  return (
    deal.shipmentDestination?.trim() ||
    [deal.user.city, deal.user.country].filter(Boolean).join(", ") ||
    "Destination pending"
  );
}

function getOrigin(deal: MyLedgerDeal) {
  return deal.shipmentOrigin?.trim() || "Japan";
}

function buildTimeline(deal: MyLedgerDeal): DashboardShipmentEvent[] {
  const sortedEvents = [...deal.events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const isCompleteOrder =
    deal.status === "DELIVERED" || deal.status === "CANCELLED" || deal.status === "DOCUMENTS_DISPATCHED";
  const events: DashboardShipmentEvent[] = sortedEvents.map((event, index) => {
    const copy = eventCopy[event.type] ?? {
      title: event.message,
      description: event.message,
    };
    const isLast = index === sortedEvents.length - 1;

    return {
      title: copy.title,
      description: copy.description,
      date: formatDashboardDate(event.createdAt),
      state: isLast && !isCompleteOrder ? "current" : "complete",
    };
  });

  if (events.length === 0) {
    events.push({
      title: statusLabels[deal.status],
      description: "ICC team is preparing this order record.",
      date: formatDashboardDate(deal.createdAt),
      state: deal.status === "PENDING_CONFIRMATION" ? "current" : "complete",
    });
  }

  if (deal.dueDate && deal.status !== "DELIVERED" && deal.status !== "CANCELLED") {
    events.push({
      title: "Estimated arrival",
      description: "ETA will be updated as shipment movement changes.",
      date: formatDashboardDate(deal.dueDate),
      state: "upcoming",
    });
  }

  return events;
}

export function mapLedgerDealToDashboardOrder(deal: MyLedgerDeal): DashboardOrder {
  const status = statusLabels[deal.status];
  const destination = getDestination(deal);
  const image = deal.car.images[0]?.url ?? null;

  return {
    id: deal.id,
    orderNumber: deal.orderNumber,
    carName: getCarName(deal),
    referenceNo: deal.car.referenceNo,
    chassisNo: deal.car.chassisNo || "No chassis",
    image,
    images: deal.car.images,
    status,
    statusCode: deal.status,
    paymentStatus: getCustomerPaymentLabel(deal),
    totalAmount: formatMoney(deal.paymentSummary.totalAmount, deal.currency),
    downPayment: formatMoney(deal.downPaymentRequired ?? 0, deal.currency),
    paidAmount: formatMoney(deal.paymentSummary.paidAmount, deal.currency),
    balance: formatMoney(deal.paymentSummary.remainingBalance, deal.currency),
    remainingBalanceAmount: deal.paymentSummary.remainingBalance,
    orderedAt: formatDashboardDate(deal.createdAt),
    eta: formatDashboardDate(deal.dueDate),
    progress: statusProgress[deal.status],
    paymentProgress: deal.paymentSummary.paidPercent,
    portFrom: getOrigin(deal),
    portTo: destination,
    vesselName: deal.vesselName?.trim() || "Not added",
    bookingNo: deal.bookingNo?.trim() || "Not added",
    billOfLadingNo: deal.billOfLadingNo?.trim() || "Not added",
    currentLocation: deal.currentLocation?.trim() || status,
    shipmentNote: deal.shipmentNote?.trim() || "Shipment update will appear here once admin adds it.",
    documentsReady: deal.documents.length,
    documents: deal.documents.map((document) => ({
      id: document.id,
      title: document.title,
      type: document.type,
      fileName: document.fileName,
      createdAt: formatDashboardDate(document.createdAt),
    })),
    currency: deal.currency,
    payments: [...deal.payments]
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
      .map((payment) => ({
        id: payment.id,
        amount: formatMoney(payment.amount, payment.currency),
        type: payment.type,
        typeLabel: paymentTypeLabels[payment.type] ?? payment.type,
        method: formatMethodLabel(payment.method),
        paidAt: formatDashboardDate(payment.paidAt),
        referenceNo: payment.referenceNo,
      })),
    timeline: buildTimeline(deal),
    isActive: deal.status !== "DELIVERED" && deal.status !== "CANCELLED",
    isInTransit: deal.status === "IN_TRANSIT",
    isOverdue: deal.paymentSummary.isOverdue,
  };
}

export function mapLedgerDealsToDashboardOrders(deals: MyLedgerDeal[]) {
  return deals.map(mapLedgerDealToDashboardOrder);
}
