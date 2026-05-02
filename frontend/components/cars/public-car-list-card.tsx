"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarIcon,
  CarFrontIcon,
  EyeIcon,
  FuelIcon,
  GaugeIcon,
  HashIcon,
  HeartIcon,
  MailIcon,
  PaletteIcon,
  Settings2Icon,
  TagIcon,
  UsersIcon,
  WaypointsIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicCar } from "@/lib/api/cars";
import { CONTACT_EMAIL_MAILTO, WHATSAPP_URL } from "@/lib/contact-info";

function formatUsd(price: string | null): string {
  const n = price == null ? NaN : Number(price);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPkr(price: string | null): string | null {
  if (price == null || price === "") return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

function inventoryTitle(car: PublicCar): string {
  return car.title?.trim()
    ? car.title.trim()
    : `${car.model.brand} ${car.model.name}`;
}

function displayStr(value: string | null | undefined): string {
  const s = value?.trim();
  return s ? s : "—";
}

function buildInquiryWhatsAppUrl(car: PublicCar): string {
  const title = inventoryTitle(car);
  const text = `Hi, I'm interested in ${car.referenceNo} — ${title}`;
  const params = new URLSearchParams();
  params.set("text", text);
  const base = WHATSAPP_URL.replace(/\/$/, "");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${params.toString()}`;
}

function buildInquireMailto(car: PublicCar): string {
  const title = inventoryTitle(car);
  const subject = encodeURIComponent(`Inquiry: ${car.referenceNo} — ${title}`);
  const body = encodeURIComponent(
    `Hello,\n\nI'm interested in this vehicle:\nReference: ${car.referenceNo}\n${title}\nYear: ${car.year}\n\nPlease share details.\n`,
  );
  return `${CONTACT_EMAIL_MAILTO}?subject=${subject}&body=${body}`;
}

function SpecCell({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <div
        className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60"
        aria-hidden
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </p>
        <p className="text-foreground truncate text-sm font-semibold leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
}

export function PublicCarListCard({ car }: { car: PublicCar }) {
  const [favorited, setFavorited] = useState(false);

  const imageUrl =
    car.images.find((i) => i.isPrimary)?.url ?? car.images[0]?.url ?? null;

  const waHref = buildInquiryWhatsAppUrl(car);
  const mailHref = buildInquireMailto(car);

  const mileageDisplay =
    car.mileage != null
      ? `${car.mileage.toLocaleString()} ${car.mileageUnit}`
      : "—";

  const engineDisplay =
    car.engineCc != null && Number.isFinite(car.engineCc)
      ? `${car.engineCc.toLocaleString()} cc`
      : "—";

  const specRows: [LucideIcon, string, string][][] = [
    [
      [GaugeIcon, "Mileage", mileageDisplay],
      [CalendarIcon, "Year", String(car.year)],
      [ZapIcon, "Engine", engineDisplay],
    ],
    [
      [Settings2Icon, "Transmission", displayStr(car.transmission)],
      [TagIcon, "Model code", displayStr(car.modelCode)],
      [WaypointsIcon, "Steering", displayStr(car.steering)],
    ],
    [
      [FuelIcon, "Fuel", displayStr(car.fuel)],
      [UsersIcon, "Seats", car.seats != null ? String(car.seats) : "—"],
      [HashIcon, "Engine code", displayStr(car.engineCode)],
    ],
    [
      [PaletteIcon, "Color", displayStr(car.color)],
      [CarFrontIcon, "Drive", displayStr(car.drive)],
      [Settings2Icon, "Doors", car.doors != null ? String(car.doors) : "—"],
    ],
  ];

  const originLabel = car.country?.trim()
    ? car.country.trim().toUpperCase()
    : null;

  const usd = formatUsd(car.priceUsd);
  const pkrLine = formatPkr(car.pricePkr);

  return (
    <article
      className={cn(
        "group text-card-foreground overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-foreground/5 ring-1 ring-border/40 transition-[box-shadow,border-color]",
        "hover:border-primary/25 hover:shadow-xl hover:shadow-foreground/10",
        "dark:shadow-black/30 dark:ring-border/60 dark:hover:border-primary/35 dark:hover:shadow-black/40",
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Media */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted lg:aspect-auto lg:w-[min(38%,320px)] lg:max-w-[320px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={inventoryTitle(car)}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(min-width: 1024px) 320px, 100vw"
              unoptimized
            />
          ) : (
            <div className="text-muted-foreground flex h-full min-h-[200px] flex-col items-center justify-center gap-2 lg:min-h-full">
              <CarFrontIcon className="size-14 opacity-50" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                No photo yet
              </span>
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 to-transparent lg:bg-linear-to-r"
            aria-hidden
          />

          <div className="absolute left-3 top-3 z-10 flex gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setFavorited((v) => !v)}
              className={cn(
                "flex size-10 items-center justify-center rounded-full border border-white/20 bg-background/85 text-foreground shadow-md backdrop-blur-md transition hover:bg-background",
                favorited && "text-red-500",
              )}
              aria-pressed={favorited}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <HeartIcon
                className={cn("size-4", favorited && "fill-current")}
                aria-hidden
              />
            </button>
          </div>

          {imageUrl ? (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full border border-white/20 bg-background/85 text-foreground shadow-md backdrop-blur-md transition hover:bg-background"
              aria-label="Open vehicle photo in a new tab"
            >
              <EyeIcon className="size-4" aria-hidden />
            </a>
          ) : null}
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h3 className="font-heading text-base font-bold uppercase leading-snug tracking-wide text-foreground sm:text-lg">
              {inventoryTitle(car)}
            </h3>
            {originLabel ? (
              <p className="text-accent flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
                <span className="bg-accent inline-block size-1.5 rounded-full" aria-hidden />
                {originLabel}
              </p>
            ) : null}
          </div>

          <div className="bg-muted/35 rounded-xl border border-border/70 px-3 py-1 dark:bg-muted/25">
            <div className="divide-y divide-border/80">
              {specRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 gap-4 py-3.5 sm:grid-cols-3 sm:gap-5 sm:py-3"
                >
                  {row.map(([Icon, label, value]) => (
                    <SpecCell
                      key={`${rowIndex}-${label}`}
                      icon={Icon}
                      label={label}
                      value={value}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <span className="bg-muted text-muted-foreground inline-flex w-fit items-center rounded-lg border border-border px-3 py-1.5 font-mono text-xs font-semibold tracking-wide">
              Reference # {car.referenceNo}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                size="icon"
                className="size-11 shrink-0 border-0 bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp about ${car.referenceNo}`}
                >
                  <WhatsAppIcon className="size-5" />
                </a>
              </Button>
              <Button
                asChild
                className="h-11 gap-2 border-0 bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <a href={mailHref} aria-label={`Email inquiry for ${car.referenceNo}`}>
                  <MailIcon className="size-4" aria-hidden />
                  Inquire now
                </a>
              </Button>
            </div>

            <div className="lg:text-right">
              <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                FOB price
              </p>
              <p className="text-accent text-2xl font-bold tabular-nums tracking-tight">
                {usd}
              </p>
              {pkrLine ? (
                <p className="text-accent/90 mt-0.5 text-sm font-semibold tabular-nums">
                  {pkrLine}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
