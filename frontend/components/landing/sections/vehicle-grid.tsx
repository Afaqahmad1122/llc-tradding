import { CarFrontIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicCar } from "@/lib/api/cars";
import {
  buildInquiryWhatsAppUrl,
  displayStr,
  formatUsd,
  inventoryTitle,
} from "@/lib/car-display";

function primaryImageUrl(car: PublicCar): string | null {
  const primary = car.images.find((i) => i.isPrimary)?.url;
  if (primary) return primary;
  return car.images[0]?.url ?? null;
}

export function VehicleGrid({ vehicles }: { vehicles: PublicCar[] }) {
  if (vehicles.length === 0) {
    return (
      <p className="rounded-2xl border border-[#452E5A]/15 bg-white/80 px-4 py-5 text-sm text-[#452E5A]/80 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
        No published vehicles in inventory yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((car) => {
        const imageUrl = primaryImageUrl(car);
        const title = inventoryTitle(car);
        const detailHref = `/cars/${encodeURIComponent(car.referenceNo)}`;
        const enginePart =
          car.engineCc != null && Number.isFinite(car.engineCc)
            ? `${car.engineCc.toLocaleString()}cc`
            : "—";
        const fuelPart = displayStr(car.fuel);

        return (
          <Card
            key={car.id}
            className="group overflow-hidden border-[#452E5A]/15 bg-white shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF653F]/45 dark:border-white/10 dark:bg-[#150e2e]"
          >
            <div className="relative h-44 w-full overflow-hidden border-b border-[#452E5A]/10 bg-[#f4f4f6] dark:border-white/10 dark:bg-[#120d27]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
                  <CarFrontIcon className="size-12 opacity-50" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    No photo yet
                  </span>
                </div>
              )}
            </div>
            <div className="h-1.5 w-full brand-gradient-warm" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#1E104E] dark:text-white">
                {title}
              </CardTitle>
              <CardDescription className="text-[#452E5A]/75 dark:text-white/60">
                {car.year} • {enginePart}
                {fuelPart !== "—" ? ` • ${fuelPart}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-3xl font-semibold tracking-tight text-[#1E104E] dark:text-white">
                {formatUsd(car.priceUsd)}
              </p>
              <p className="text-sm text-[#452E5A]/70 dark:text-white/55">
                Ref #{car.referenceNo}
              </p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 border-t border-[#452E5A]/10 bg-[#F8F5FF]/70 dark:border-white/10 dark:bg-white/5">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white/85 dark:hover:bg-white/10"
                asChild
              >
                <Link href={detailHref}>View Details</Link>
              </Button>
              <Button
                size="sm"
                className="w-full border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] shadow-sm hover:opacity-90"
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

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border-[#452E5A]/15 bg-white dark:border-white/10 dark:bg-[#150e2e]"
        >
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="h-1.5 w-full bg-muted" />
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-[75%]" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2 border-t border-[#452E5A]/10 bg-[#F8F5FF]/70 dark:border-white/10 dark:bg-white/5">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
