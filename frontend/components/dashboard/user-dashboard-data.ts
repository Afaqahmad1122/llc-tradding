import {
  CheckCircle2,
  Clock3,
  Ship,
  Truck,
} from "lucide-react";

export type DashboardOrderStatus =
  | "Pending confirmation"
  | "Confirmed"
  | "In transit"
  | "Arrived"
  | "Delivered";

export type DashboardOrder = {
  id: string;
  orderNumber: string;
  carName: string;
  referenceNo: string;
  image: string;
  status: DashboardOrderStatus;
  paymentStatus: "Deposit paid" | "Balance pending" | "Paid";
  totalAmount: string;
  orderedAt: string;
  eta: string;
  progress: number;
  portFrom: string;
  portTo: string;
};

export type DashboardShipmentEvent = {
  title: string;
  description: string;
  date: string;
  state: "complete" | "current" | "upcoming";
};

export const dashboardOrders: DashboardOrder[] = [
  {
    id: "order-1",
    orderNumber: "ICC-ORD-24018",
    carName: "Toyota Corolla Axio 2020",
    referenceNo: "ICC-AXIO-9204",
    image: "/download (4).jpeg",
    status: "In transit",
    paymentStatus: "Balance pending",
    totalAmount: "JPY 1,840,000",
    orderedAt: "24 Jul 2026",
    eta: "18 Sep 2026",
    progress: 68,
    portFrom: "Yokohama, Japan",
    portTo: "Karachi, Pakistan",
  },
  {
    id: "order-2",
    orderNumber: "ICC-ORD-24011",
    carName: "Honda Vezel Hybrid 2019",
    referenceNo: "ICC-VEZ-4418",
    image: "/download (2).jpeg",
    status: "Confirmed",
    paymentStatus: "Deposit paid",
    totalAmount: "JPY 2,160,000",
    orderedAt: "02 Aug 2026",
    eta: "Awaiting vessel",
    progress: 34,
    portFrom: "Nagoya, Japan",
    portTo: "Port Qasim, Pakistan",
  },
];

export const shipmentEvents: DashboardShipmentEvent[] = [
  {
    title: "Order confirmed",
    description: "ICC team confirmed the order and started export handling.",
    date: "24 Jul 2026",
    state: "complete",
  },
  {
    title: "Inspection completed",
    description: "Vehicle inspection and document preparation completed.",
    date: "29 Jul 2026",
    state: "complete",
  },
  {
    title: "Loaded on vessel",
    description: "Shipment loaded from Yokohama port.",
    date: "05 Aug 2026",
    state: "current",
  },
  {
    title: "Arriving at destination",
    description: "Customer clearance and local delivery will start after arrival.",
    date: "18 Sep 2026",
    state: "upcoming",
  },
];

export const dashboardStats = [
  {
    label: "Active orders",
    value: "2",
    detail: "1 currently in transit",
    icon: Truck,
  },
  {
    label: "Shipment ETA",
    value: "18 Sep",
    detail: "Yokohama to Karachi",
    icon: Ship,
  },
  {
    label: "Next action",
    value: "Balance",
    detail: "Payment pending for active shipment",
    icon: Clock3,
  },
];

export const shipmentMeta = [
  ["Vessel", "Ocean Sakura"],
  ["Booking No.", "BK-ICC-77320"],
  ["BL No.", "Pending release"],
  ["Origin", "Yokohama, Japan"],
  ["Destination", "Karachi, Pakistan"],
  ["ETA", "18 Sep 2026"],
];

export const orderStatusStyles: Record<DashboardOrderStatus, string> = {
  "Pending confirmation": "border-amber-200 bg-amber-50 text-amber-700",
  Confirmed: "border-sky-200 bg-sky-50 text-sky-700",
  "In transit": "border-indigo-200 bg-indigo-50 text-indigo-700",
  Arrived: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Delivered: "border-green-200 bg-green-50 text-green-700",
};

export const eventIcons = {
  complete: CheckCircle2,
  current: Ship,
  upcoming: Clock3,
};
