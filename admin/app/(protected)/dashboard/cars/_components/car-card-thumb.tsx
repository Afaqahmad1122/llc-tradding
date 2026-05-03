import { CarFront } from "lucide-react";
import Image from "next/image";

import type { AdminCar } from "@/lib/api/cars";

export function CarCardThumb({ car }: { car: AdminCar }) {
  const primary =
    car.images.find((x) => x.isPrimary)?.url ?? car.images[0]?.url ?? null;
  if (!primary) {
    return (
      <div className="bg-muted text-muted-foreground ring-border/60 flex size-29 shrink-0 items-center justify-center rounded-xl border shadow-inner ring-1 md:size-36">
        <CarFront className="size-10 opacity-45" aria-hidden />
      </div>
    );
  }

  return (
    <div className="border-border/70 relative size-29 shrink-0 overflow-hidden rounded-xl border shadow-sm ring-1 ring-black/4 md:size-36 dark:ring-white/6">
      <Image
        src={primary}
        alt={car.referenceNo}
        fill
        className="object-cover"
        sizes="144px"
        unoptimized
      />
    </div>
  );
}
