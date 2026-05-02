import { CarFront } from "lucide-react";
import Image from "next/image";

import type { AdminCar } from "@/lib/api/cars";

export function CarCardThumb({ car }: { car: AdminCar }) {
  const primary =
    car.images.find((x) => x.isPrimary)?.url ?? car.images[0]?.url ?? null;
  if (!primary) {
    return (
      <div className="bg-muted text-muted-foreground flex size-[7.25rem] shrink-0 items-center justify-center rounded-lg border md:size-36">
        <CarFront className="size-10 opacity-50" aria-hidden />
      </div>
    );
  }

  return (
    <div className="relative size-[7.25rem] shrink-0 overflow-hidden rounded-lg border md:size-36">
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
