"use client";

import { CheckIcon, ChevronLeft, ChevronRight, HomeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import {
  buildInquireMailto,
  buildInquiryWhatsAppUrl,
  displayStr,
  featureEntryActive,
  formatPkr,
  formatUsd,
  humanizeFeatureKey,
  inventoryTitle,
} from "@/lib/car-display";
import type { PublicCar } from "@/lib/api/cars";
import { submitCarInquiry } from "@/lib/api/cars";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const CALC_COUNTRIES = [
  "Pakistan",
  "Bangladesh",
  "UAE",
  "Kenya",
  "Tanzania",
  "South Africa",
  "Other",
] as const;

const PORTS_BY_COUNTRY: Record<string, string[]> = {
  Pakistan: ["Karachi", "Gwadar", "Port Qasim"],
  Bangladesh: ["Chattogram", "Mongla"],
  UAE: ["Jebel Ali", "Abu Dhabi", "Sharjah"],
  Kenya: ["Mombasa"],
  Tanzania: ["Dar es Salaam"],
  "South Africa": ["Durban", "Cape Town"],
  Other: ["Nearest major port"],
};

const SHIPMENT_MODES = ["Roro", "Container"] as const;

function sortedGallery(car: PublicCar) {
  return [...car.images].sort((a, b) => a.position - b.position);
}

function calculatorNote(opts: {
  country: string;
  port: string;
  shipment: string;
  freight: string;
  inspection: string;
  insurance: string;
  currencyLabel: string;
}): string {
  return [
    "Shipping quote request:",
    `Destination: ${opts.country} — ${opts.port}`,
    `Shipment: ${opts.shipment}`,
    `Freight: ${opts.freight}`,
    `Inspection: ${opts.inspection}`,
    `Insurance: ${opts.insurance}`,
    `Currency: ${opts.currencyLabel}`,
    "",
    "Please confirm total landed cost.",
  ].join("\n");
}

function SimilarCarCard({ car }: { car: PublicCar }) {
  const imageUrl =
    car.images.find((i) => i.isPrimary)?.url ?? car.images[0]?.url ?? null;
  const title = inventoryTitle(car);
  const usd = formatUsd(car.priceUsd);
  const pkrLine = formatPkr(car.pricePkr);
  const waHref = buildInquiryWhatsAppUrl(car);
  const mailHref = buildInquireMailto(car);
  const engineBadge =
    car.engineCc != null && Number.isFinite(car.engineCc)
      ? `${car.engineCc}cc`
      : "—";

  return (
    <article className="bg-card text-card-foreground flex w-[min(100%,280px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-border shadow-md ring-1 ring-border/40">
      <Link
        href={`/cars/${encodeURIComponent(car.referenceNo)}`}
        className="relative block aspect-[16/11] bg-muted"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="280px"
            unoptimized
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs font-semibold">
            No photo
          </div>
        )}
        <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
          {car.year}
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
          {engineBadge}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <Link
          href={`/cars/${encodeURIComponent(car.referenceNo)}`}
          className="line-clamp-2 min-h-10 text-xs font-bold uppercase leading-snug tracking-wide hover:underline"
        >
          {title}
        </Link>
        <div className="text-[11px]">
          <span className="text-muted-foreground">Reference #</span>{" "}
          <span className="font-mono font-semibold">{car.referenceNo}</span>
        </div>
        <div className="text-right text-xs">
          <div className="text-muted-foreground text-left text-[10px] font-bold uppercase">
            FOB price
          </div>
          <p className="text-destructive text-base font-bold tabular-nums">
            {usd}
          </p>
          {pkrLine ? (
            <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold tabular-nums">
              {pkrLine}
            </p>
          ) : null}
        </div>
        <div className="mt-auto flex gap-2">
          <Button
            asChild
            className="h-9 flex-1 border-0 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            <a href={mailHref}>Inquire now</a>
          </Button>
          <Button
            asChild
            size="icon"
            className="h-9 w-9 shrink-0 border-0 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp about ${car.referenceNo}`}
            >
              <WhatsAppIcon className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

function SectionTab({ children }: { children: React.ReactNode }) {
  return (
    <div className="brand-gradient-main inline-flex rounded-t-lg rounded-br-lg px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-sm">
      {children}
    </div>
  );
}

export function PublicCarDetailView({
  car,
  similarCars,
}: {
  car: PublicCar;
  similarCars: PublicCar[];
}) {
  const gallery = useMemo(() => sortedGallery(car), [car]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = gallery[activeIndex] ?? null;

  const [currency, setCurrency] = useState<"USD" | "PKR">("USD");
  const [country, setCountry] = useState<string>(CALC_COUNTRIES[0]);
  const portOptions = PORTS_BY_COUNTRY[country] ?? PORTS_BY_COUNTRY.Other;
  const [port, setPort] = useState(() => portOptions[0] ?? "");
  const [shipment, setShipment] = useState<string>(SHIPMENT_MODES[0]);
  const [freight, setFreight] = useState("prepaid");
  const [inspection, setInspection] = useState("yes");
  const [insurance, setInsurance] = useState("yes");

  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    destinationCountry: "",
    destinationPort: "",
    message: "",
  });
  const [inquirySending, setInquirySending] = useState(false);

  const title = inventoryTitle(car);
  const usd = formatUsd(car.priceUsd);
  const pkrLine = formatPkr(car.pricePkr);
  const originLabel = car.country?.trim()
    ? car.country.trim().toUpperCase()
    : null;

  const mileageDisplay =
    car.mileage != null
      ? `${car.mileage.toLocaleString()} ${car.mileageUnit}`
      : "—";
  const engineDisplay =
    car.engineCc != null && Number.isFinite(car.engineCc)
      ? `${car.engineCc.toLocaleString()} CC`
      : "—";

  const allSpecRows = useMemo(() => {
    const specPairs: [string, string][] = [
      ["Reference #", car.referenceNo],
      ["Chassis No.", displayStr(car.chassisNo)],
      ["Mileage", mileageDisplay],
      ["Year", String(car.year)],
      ["Engine", engineDisplay],
      ["Fuel", displayStr(car.fuel)],
      ["Seats", car.seats != null ? String(car.seats) : "—"],
      ["Engine code", displayStr(car.engineCode)],
      ["Color", displayStr(car.color)],
      ["Drive", displayStr(car.drive)],
      ["Doors", car.doors != null ? String(car.doors) : "—"],
      ["Transmission", displayStr(car.transmission)],
      ["Model code", displayStr(car.modelCode)],
      ["Steering", displayStr(car.steering)],
    ];
    const seen = new Set(specPairs.map(([label]) => label.toLowerCase()));
    const rows: [string, string][] = [...specPairs];
    if (car.specifications && typeof car.specifications === "object") {
      for (const [rawKey, rawVal] of Object.entries(car.specifications)) {
        const label = humanizeFeatureKey(rawKey);
        const lk = label.toLowerCase();
        if (seen.has(lk)) continue;
        seen.add(lk);
        const val =
          typeof rawVal === "object" && rawVal !== null
            ? JSON.stringify(rawVal)
            : String(rawVal ?? "—");
        rows.push([label, val]);
      }
    }
    return rows;
  }, [car, mileageDisplay, engineDisplay]);

  const featureEntries = useMemo(() => {
    if (!car.features || typeof car.features !== "object") return [];
    return Object.entries(car.features)
      .filter(([k]) => k.trim())
      .map(([key, value]) => ({
        key,
        label: humanizeFeatureKey(key),
        active: featureEntryActive(value),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [car.features]);

  const calcLines = calculatorNote({
    country,
    port,
    shipment,
    freight: freight === "prepaid" ? "Prepaid" : "Collect",
    inspection: inspection === "yes" ? "Yes" : "No",
    insurance: insurance === "yes" ? "Yes" : "No",
    currencyLabel: currency,
  });

  const askWa = buildInquiryWhatsAppUrl(car, calcLines);
  const askMail = buildInquireMailto(car, calcLines);

  const showPrev = gallery.length > 1;
  const goPrev = () =>
    setActiveIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1));
  const goNext = () =>
    setActiveIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1));

  async function onInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    setInquirySending(true);
    try {
      await submitCarInquiry(car.referenceNo, {
        name: inquiry.name.trim(),
        email: inquiry.email.trim(),
        phone: inquiry.phone.trim(),
        destinationCountry: inquiry.destinationCountry.trim() || undefined,
        destinationPort: inquiry.destinationPort.trim() || undefined,
        message: inquiry.message.trim() || undefined,
      });
      toast.success("Inquiry sent. Our team will get back to you shortly.");
      setInquiry((s) => ({
        ...s,
        name: "",
        email: "",
        phone: "",
        message: "",
      }));
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      toast.error(msg);
    } finally {
      setInquirySending(false);
    }
  }

  return (
    <div className="space-y-10 pb-16">
      <Breadcrumb>
        <BreadcrumbList className="text-xs sm:text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="inline-flex items-center gap-1">
                <HomeIcon className="size-3.5" aria-hidden />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/cars">Cars</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/cars?brand=${encodeURIComponent(car.model.brand)}`}>
                {car.model.brand}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[min(100%,12rem)] truncate font-semibold sm:max-w-none">
              {title.toUpperCase()}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-md bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              FOB price
            </span>
            <h1 className="font-heading max-w-4xl text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl lg:text-4xl">
              {title.toUpperCase()}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                {car.year}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                {mileageDisplay}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                {engineDisplay}
              </span>
              <span className="inline-flex items-center rounded-full border border-dashed border-border bg-muted/60 px-3 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
                {car.referenceNo}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <p className="inline-flex min-w-[10rem] items-center justify-center rounded-xl bg-destructive px-5 py-3 text-2xl font-bold tabular-nums text-white shadow-md sm:text-3xl">
              {usd}
            </p>
            {pkrLine ? (
              <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {pkrLine}
              </p>
            ) : null}
            {originLabel ? (
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <span className="bg-accent inline-block size-2 rounded-full shadow-sm" />
                Origin · {originLabel}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_min(100%,380px)] lg:items-start">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/80 shadow-inner ring-1 ring-border/50">
            <div className="relative aspect-[16/10] w-full bg-linear-to-b from-muted/50 to-muted">
              {active?.url ? (
                <Image
                  src={active.url}
                  alt={active.altText ?? title}
                  fill
                  className="object-contain sm:object-cover"
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                  unoptimized
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-sm font-semibold">
                  No photos yet
                </div>
              )}
              {showPrev ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white dark:bg-white/85"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white dark:bg-white/85"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div
                    className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
                    aria-hidden
                  >
                    {gallery.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-2 rounded-full bg-white/50 transition",
                          i === activeIndex && "bg-white w-5",
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {gallery.length > 1 ? (
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-gutter:stable]">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative size-16 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition sm:size-20",
                    i === activeIndex
                      ? "border-foreground ring-2 ring-primary/30"
                      : "border-transparent opacity-80 hover:opacity-100",
                  )}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <details className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Download images
              </summary>
              <ul className="mt-3 space-y-2">
                {gallery.map((img, i) => (
                  <li key={img.id}>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                      Photo {i + 1}
                      {img.isPrimary ? " (primary)" : ""}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-2 text-xs">
                Open each link and save from your browser if downloads are
                blocked for external URLs.
              </p>
            </details>
          </div>
        </div>

        <aside className="brand-gradient-main sticky top-24 space-y-4 rounded-2xl p-5 text-white shadow-xl ring-1 ring-black/15 dark:ring-white/10">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight">
              Total price calculator
            </h2>
            <NativeSelect
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "USD" | "PKR")}
              className="h-9 max-w-[5.5rem] border-white/25 bg-white text-xs font-semibold text-primary"
            >
              <NativeSelectOption value="USD">USD</NativeSelectOption>
              <NativeSelectOption value="PKR">PKR</NativeSelectOption>
            </NativeSelect>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              Vehicle price
            </p>
            <p className="mt-2 inline-block min-w-[8rem] rounded-lg bg-destructive px-4 py-2 text-center text-xl font-bold tabular-nums shadow-md">
              {currency === "USD" ? usd : (pkrLine ?? usd)}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-[10px] font-bold uppercase text-white/90">
                Destination country
              </Label>
              <NativeSelect
                className="mt-1 h-10 w-full border-white/25 bg-white text-sm font-medium text-primary"
                value={country}
                onChange={(e) => {
                  const next = e.target.value;
                  setCountry(next);
                  const ports =
                    PORTS_BY_COUNTRY[next] ?? PORTS_BY_COUNTRY.Other;
                  setPort(ports[0] ?? "");
                }}
              >
                {CALC_COUNTRIES.map((c) => (
                  <NativeSelectOption key={c} value={c}>
                    {c}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase text-white/90">
                Ports
              </Label>
              <NativeSelect
                className="mt-1 h-10 w-full border-white/25 bg-white text-sm font-medium text-primary"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              >
                {portOptions.map((p) => (
                  <NativeSelectOption key={p} value={p}>
                    {p}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase text-white/90">
                Shipment
              </Label>
              <NativeSelect
                className="mt-1 h-10 w-full border-white/25 bg-white text-sm font-medium text-primary"
                value={shipment}
                onChange={(e) => setShipment(e.target.value)}
              >
                {SHIPMENT_MODES.map((s) => (
                  <NativeSelectOption key={s} value={s}>
                    {s}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/15 pt-4">
            <CalcRadioRow
              label="Freight"
              value={freight}
              onChange={setFreight}
              options={[
                { value: "prepaid", label: "Prepaid" },
                { value: "collect", label: "Collect" },
              ]}
            />
            <CalcRadioRow
              label="Inspection"
              value={inspection}
              onChange={setInspection}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
            <CalcRadioRow
              label="Insurance"
              value={insurance}
              onChange={setInsurance}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </div>

          <div className="space-y-3 border-t border-white/15 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider">
              Total price
            </p>
            <Button
              asChild
              className="h-11 w-full bg-destructive text-sm font-bold uppercase tracking-wide text-white hover:bg-destructive/90"
            >
              <a href={askWa} target="_blank" rel="noopener noreferrer">
                Ask on WhatsApp
              </a>
            </Button>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/90">
              Total price in local
            </p>
            <Button
              asChild
              className="h-11 w-full bg-amber-300 text-sm font-bold uppercase tracking-wide text-primary hover:bg-amber-200 dark:bg-amber-400 dark:text-primary dark:hover:bg-amber-300"
            >
              <a href={askMail}>Ask by email</a>
            </Button>
          </div>
        </aside>
      </div>

      <section className="space-y-0">
        <SectionTab>Specifications</SectionTab>
        <div className="overflow-hidden rounded-b-xl rounded-tr-xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {allSpecRows.map(([label, val], idx) => (
              <div
                key={`${idx}-${label}`}
                className="border-border flex min-h-[3rem] border-b border-r text-sm lg:[&:nth-child(3n)]:border-r-0"
              >
                <div className="flex w-[42%] shrink-0 items-center px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:w-[38%]">
                  {label}
                </div>
                <div className="bg-background/80 flex flex-1 items-center px-3 py-2.5 font-semibold">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featureEntries.length > 0 ? (
        <section className="space-y-0">
          <SectionTab>Features</SectionTab>
          <div className="overflow-hidden rounded-b-xl rounded-tr-xl border border-border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featureEntries.map((f) => (
                <div
                  key={f.key}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium sm:text-sm",
                    f.active
                      ? "border-emerald-500/25 bg-emerald-500/5"
                      : "border-border/60 bg-muted/20 text-muted-foreground",
                  )}
                >
                  <span className={cn(f.active && "font-semibold")}>
                    {f.label}
                  </span>
                  {f.active ? (
                    <CheckIcon
                      className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-label="Included"
                    />
                  ) : (
                    <span className="text-[10px] uppercase text-muted-foreground/70">
                      —
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionTab>Inquiry</SectionTab>
        <form
          onSubmit={onInquirySubmit}
          className="space-y-4 rounded-b-2xl rounded-tr-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-border/40 dark:bg-card/80"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <fieldset className="rounded-lg border border-border bg-background px-3 pb-3 pt-1">
              <legend className="text-muted-foreground px-1 text-[11px] font-semibold">
                Reference #
              </legend>
              <p className="font-mono text-sm font-semibold">
                {car.referenceNo}
              </p>
            </fieldset>
            <div>
              <Label htmlFor="dest-country">Destination country</Label>
              <Input
                id="dest-country"
                className="mt-1.5"
                value={inquiry.destinationCountry}
                onChange={(e) =>
                  setInquiry((s) => ({
                    ...s,
                    destinationCountry: e.target.value,
                  }))
                }
                placeholder="Country"
              />
            </div>
            <div>
              <Label htmlFor="dest-port">Destination port</Label>
              <Input
                id="dest-port"
                className="mt-1.5"
                value={inquiry.destinationPort}
                onChange={(e) =>
                  setInquiry((s) => ({ ...s, destinationPort: e.target.value }))
                }
                placeholder="Port"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="inquiry-name">Name</Label>
              <Input
                id="inquiry-name"
                required
                className="mt-1.5"
                value={inquiry.name}
                onChange={(e) =>
                  setInquiry((s) => ({ ...s, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="inquiry-email">Email</Label>
              <Input
                id="inquiry-email"
                type="email"
                required
                className="mt-1.5"
                value={inquiry.email}
                onChange={(e) =>
                  setInquiry((s) => ({ ...s, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="inquiry-phone">Contact number</Label>
              <Input
                id="inquiry-phone"
                required
                className="mt-1.5"
                value={inquiry.phone}
                onChange={(e) =>
                  setInquiry((s) => ({ ...s, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="inquiry-msg">Message</Label>
            <Textarea
              id="inquiry-msg"
              className="mt-1.5 min-h-[120px]"
              value={inquiry.message}
              onChange={(e) =>
                setInquiry((s) => ({ ...s, message: e.target.value }))
              }
              placeholder={`I'm interested in ${car.referenceNo}…`}
            />
          </div>
          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              disabled={inquirySending}
              className="h-12 min-w-[200px] bg-accent px-8 text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-sm hover:bg-accent/90"
            >
              {inquirySending ? "Sending…" : "Submit inquiry"}
            </Button>
          </div>
        </form>
      </section>

      {similarCars.length > 0 ? (
        <section className="space-y-4 border-t border-border pt-10">
          <h2 className="font-heading text-xl font-bold tracking-tight text-primary">
            Similar cars
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 pt-1">
            {similarCars.map((c) => (
              <SimilarCarCard key={c.id} car={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CalcRadioRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/85">
        {label}
      </p>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="mt-2 flex flex-wrap gap-4"
      >
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <RadioGroupItem
              value={o.value}
              className="border-white/60 data-checked:border-destructive data-checked:bg-destructive"
            />
            {o.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
