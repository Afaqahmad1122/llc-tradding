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

export default function CarsPage() {
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
        <PublicCarsInventory />
      </div>
    </LandingPageShell>
  );
}
