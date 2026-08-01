import { CarFrontIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicCar } from "@/lib/api/cars";
import {
  buildInquiryWhatsAppUrl,
  displayStr,
  formatPkr,
  hasVisiblePrice,
  inventoryTitle,
  primaryPriceLabel,
} from "@/lib/car-display";

function primaryImageUrl(car: PublicCar): string | null {
  const primary = car.images.find((i) => i.isPrimary)?.url;
  if (primary) return primary;
  return car.images[0]?.url ?? null;
}

function formatMileage(car: PublicCar): string {
  if (car.mileage == null || !Number.isFinite(car.mileage)) return "Mileage N/A";
  const unit = car.mileageUnit?.trim() || "km";
  return `${car.mileage.toLocaleString()} ${unit}`;
}

function locationText(car: PublicCar): string {
  const city = car.city?.trim();
  const country = car.country?.trim();
  if (city && country) return `${city}, ${country}`;
  return city || country || "Location N/A";
}

type VehicleGridColumns = 2 | 3;

function gridColumnsClass(columns: VehicleGridColumns): string {
  return columns === 2 ? "md:grid-cols-2 xl:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3";
}

export function VehicleGrid({
  vehicles,
  columns = 3,
}: {
  vehicles: PublicCar[];
  columns?: VehicleGridColumns;
}) {
  if (vehicles.length === 0) {
    return (
      <p className="rounded-2xl border border-[#452E5A]/15 bg-white/80 px-4 py-5 text-sm text-[#452E5A]/80 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
        No published vehicles in inventory yet. Check back soon.
      </p>
    );
  }

  return (
    <div className={`grid gap-5 ${gridColumnsClass(columns)}`}>
      {vehicles.map((car) => {
        const imageUrl = primaryImageUrl(car);
        const title = inventoryTitle(car);
        const detailHref = `/cars/${encodeURIComponent(car.referenceNo)}`;
        const enginePart =
          car.engineCc != null && Number.isFinite(car.engineCc)
            ? `${car.engineCc.toLocaleString()}cc`
            : "—";
        const fuelPart = displayStr(car.fuel);
        const transmissionPart = displayStr(car.transmission);
        const locationPart = locationText(car);
        const mileagePart = formatMileage(car);
        const hasPrice = hasVisiblePrice(car);
        const primaryPrice = primaryPriceLabel(car);
        const pkrLine = formatPkr(car.pricePkr);

        return (
          <Card
            key={car.id}
            className="group h-full overflow-hidden rounded-2xl border-[#452E5A]/15 bg-white/95 shadow-[0_18px_46px_-28px_rgba(30,16,78,0.7)] ring-1 ring-[#452E5A]/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF653F]/45 hover:shadow-[0_22px_52px_-26px_rgba(30,16,78,0.68)] dark:border-white/10 dark:bg-[#150e2e]/95 dark:ring-white/5"
          >
            <div className="relative h-48 w-full overflow-hidden border-b border-[#452E5A]/10 bg-[#f4f4f6] dark:border-white/10 dark:bg-[#120d27]">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#1E104E]/50 via-[#1E104E]/10 to-transparent" />
                </>
              ) : (
                <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
                  <CarFrontIcon className="size-12 opacity-50" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    No photo yet
                  </span>
                </div>
              )}
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <Badge className="bg-white/90 text-[#1E104E] shadow-sm dark:bg-[#1E104E]/80 dark:text-white">
                  {car.year}
                </Badge>
                {fuelPart !== "—" ? (
                  <Badge
                    variant="secondary"
                    className="bg-[#1E104E]/85 text-white shadow-sm dark:bg-white/20"
                  >
                    {fuelPart}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="h-1 w-full brand-gradient-warm" />
            <CardHeader className="space-y-2 pb-2 pt-4">
              <CardTitle className="line-clamp-2 min-h-[2.75rem] text-lg leading-snug text-[#1E104E] dark:text-white">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-[#452E5A]/75 dark:text-white/60">
                {car.year} • {enginePart}
                {transmissionPart !== "—" ? ` • ${transmissionPart}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-[#452E5A]/75 dark:text-white/60">
                <MapPinIcon className="size-3.5" aria-hidden />
                <span className="truncate">{locationPart}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C4A76] dark:text-white/55">
                  {hasPrice ? "FOB price" : "Price"}
                </p>
                <p
                  className={`mt-1 text-3xl font-semibold tracking-tight text-[#1E104E] dark:text-white ${
                    hasPrice
                      ? ""
                      : "inline-flex animate-bounce rounded-lg bg-amber-300 px-3 py-1 text-[#1E104E] shadow-sm dark:text-[#1E104E]"
                  }`}
                >
                  {primaryPrice}
                </p>
                {pkrLine ? (
                  <p className="mt-1 text-base font-semibold tabular-nums text-[#EA3B58]">
                    {pkrLine}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-[#452E5A]/20 bg-[#F8F5FF] text-[#452E5A] dark:border-white/20 dark:bg-white/10 dark:text-white/80"
                >
                  {mileagePart}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-[#452E5A]/20 bg-[#F8F5FF] text-[#452E5A] dark:border-white/20 dark:bg-white/10 dark:text-white/80"
                >
                  Ref #{car.referenceNo}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2.5 border-t border-[#452E5A]/10 bg-[#F8F5FF]/65 p-3.5 dark:border-white/10 dark:bg-white/5">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full rounded-xl border-[#452E5A]/25 text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white/85 dark:hover:bg-white/10"
                asChild
              >
                <Link href={detailHref}>View Details</Link>
              </Button>
              <Button
                size="sm"
                className="h-9 w-full rounded-xl border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] shadow-sm transition-all hover:brightness-95"
                asChild
              >
                <a
                  href={buildInquiryWhatsAppUrl(car)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Request Quote
                </a>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export function VehicleGridSkeleton({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: VehicleGridColumns;
}) {
  return (
    <div className={`grid gap-5 ${gridColumnsClass(columns)}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden rounded-2xl border-[#452E5A]/15 bg-white dark:border-white/10 dark:bg-[#150e2e]"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="h-1 w-full bg-muted" />
          <CardHeader className="space-y-2 pb-2 pt-4">
            <Skeleton className="h-6 w-[75%]" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-9 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2.5 border-t border-[#452E5A]/10 bg-[#F8F5FF]/70 p-3.5 dark:border-white/10 dark:bg-white/5">
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
