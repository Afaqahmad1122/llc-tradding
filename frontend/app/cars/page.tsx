import type { Metadata } from "next";

import { buildPageMetadata } from "@/app/seo";
import { PublicCarsInventory } from "@/components/cars/public-cars-inventory";
import { LandingPageShell } from "@/components/landing/home-sections";

export const metadata: Metadata = buildPageMetadata({
  title: "Cars",
  description:
    "Browse live export-ready inventory with transparent specs, pricing in USD, and shipping guidance from ICC Trading Co Ltd.",
  path: "/cars",
});

function parseOptionalInt(value: string | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{
    brand?: string;
    make?: string;
    bodyType?: string;
    priceMin?: string;
    priceMax?: string;
    search?: string;
    modelId?: string;
    modelCode?: string;
    steering?: string;
    yearMin?: string;
    yearMax?: string;
    fuel?: string;
    transmission?: string;
  }>;
}) {
  const sp = await searchParams;
  const initialBrand =
    (typeof sp.brand === "string" ? sp.brand.trim() : "") ||
    (typeof sp.make === "string" ? sp.make.trim() : "");
  const initialBodyType =
    typeof sp.bodyType === "string" ? sp.bodyType.trim() : "";
  const initialSearch =
    typeof sp.search === "string" ? sp.search.trim() : "";
  const initialModelId =
    typeof sp.modelId === "string" ? sp.modelId.trim() : "";
  const initialModelCode =
    typeof sp.modelCode === "string" ? sp.modelCode.trim() : "";
  const initialSteering =
    typeof sp.steering === "string" ? sp.steering.trim() : "";
  const initialFuel = typeof sp.fuel === "string" ? sp.fuel.trim() : "";
  const initialTransmission =
    typeof sp.transmission === "string" ? sp.transmission.trim() : "";
  const initialPriceMin = parseOptionalInt(
    typeof sp.priceMin === "string" ? sp.priceMin : undefined,
  );
  const initialPriceMax = parseOptionalInt(
    typeof sp.priceMax === "string" ? sp.priceMax : undefined,
  );
  const initialYearMin = parseOptionalInt(
    typeof sp.yearMin === "string" ? sp.yearMin : undefined,
  );
  const initialYearMax = parseOptionalInt(
    typeof sp.yearMax === "string" ? sp.yearMax : undefined,
  );

  return (
    <LandingPageShell mainClassName="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <header className="rounded-3xl border border-border bg-card/90 px-8 py-8 shadow-lg shadow-foreground/5 backdrop-blur-sm dark:bg-card/85 dark:shadow-black/25">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cars
          </h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
            Browse ICC Trading&apos;s available stock sourced from auctions and
            partner yards. Pricing is shown in USD; published listings mirror
            the admin catalogue in near real-time.
          </p>
        </header>
        <PublicCarsInventory
          initialBrand={initialBrand}
          initialBodyType={initialBodyType}
          initialSearch={initialSearch}
          initialPriceMin={initialPriceMin}
          initialPriceMax={initialPriceMax}
          initialModelId={initialModelId}
          initialModelCode={initialModelCode}
          initialSteering={initialSteering}
          initialYearMin={initialYearMin}
          initialYearMax={initialYearMax}
          initialFuel={initialFuel}
          initialTransmission={initialTransmission}
        />
      </div>
    </LandingPageShell>
  );
}
