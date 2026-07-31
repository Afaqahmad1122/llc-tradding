import type { PublicCar } from "@/lib/api/cars";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/contact-info";

export function inventoryTitle(car: PublicCar): string {
  return car.title?.trim()
    ? car.title.trim()
    : `${car.model.brand} ${car.model.name}`;
}

export function formatUsd(price: string | null): string {
  const n = price == null ? NaN : Number(price);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPkr(price: string | null): string | null {
  if (price == null || price === "") return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatJpy(price: string | null): string | null {
  if (price == null || price === "") return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n);
}

export function displayStr(value: string | null | undefined): string {
  const s = value?.trim();
  return s ? s : "—";
}

export function buildInquiryWhatsAppUrl(
  car: PublicCar,
  extra?: string,
): string {
  const title = inventoryTitle(car);
  let text = `Hi, I'm interested in ${car.referenceNo} — ${title}`;
  if (extra?.trim()) {
    text += `\n\n${extra.trim()}`;
  }
  const params = new URLSearchParams();
  params.set("text", text);
  const base = WHATSAPP_URL.replace(/\/$/, "");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${params.toString()}`;
}

export function buildInquireMailto(car: PublicCar, extra?: string): string {
  const title = inventoryTitle(car);
  const subject = `Inquiry: ${car.referenceNo} — ${title}`;
  let bodyText = `Hello,\n\nI'm interested in this vehicle:\nReference: ${car.referenceNo}\n${title}\nYear: ${car.year}\n\nPlease share details.\n`;
  if (extra?.trim()) {
    bodyText += `\n${extra.trim()}\n`;
  }
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: CONTACT_EMAIL,
    su: subject,
    body: bodyText,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function featureEntryActive(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    return s === "yes" || s === "true" || s === "1" || s === "y";
  }
  return false;
}

export function humanizeFeatureKey(key: string): string {
  const t = key.trim();
  if (!t) return key;
  return t
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
