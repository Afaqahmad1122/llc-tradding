"use client";

import Link from "next/link";
import { useMemo } from "react";
import { heroFilters, promoBanners } from "@/components/landing/home-data";
import {
  CategoryGrid,
  ContactCta,
  HeroSection,
  LandingPageShell,
  MarketplaceWithSidebars,
  PromoBannerStrip,
  SectionBlock,
  TestimonialGrid,
  TopCarsStrip,
  TrustFeatures,
  VehicleGrid,
  VehicleGridSkeleton,
} from "@/components/landing/home-sections";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { fetchCarsMeta, fetchPublicCars } from "@/lib/api/cars";
import { getPublicReviews } from "@/lib/api/reviews";
import { buildPriceBuckets } from "@/lib/home-price-buckets";
import { buildCarsInventoryUrl } from "@/lib/inventory-search-url";

export default function Home() {
  const { data: carsResponse, isLoading: carsLoading } = useApiQuery({
    queryKey: ["public-cars", "home", { pageSize: 8, sort: "latest" }],
    queryFn: () => fetchPublicCars({ page: 1, pageSize: 8, sort: "latest" }),
  });

  const { data: meta } = useApiQuery({
    queryKey: ["cars-meta"],
    queryFn: fetchCarsMeta,
  });

  const { data: reviewsResponse } = useApiQuery({
    queryKey: ["public-reviews", { page: 1, pageSize: 2, sort: "latest" }],
    queryFn: () => getPublicReviews({ page: 1, pageSize: 2, sort: "latest" }),
  });

  const cars = carsResponse?.data ?? [];
  const totalCars = carsResponse?.pagination.total ?? null;

  const makes = useMemo(() => meta?.brands ?? [], [meta]);

  const bodyTypes = useMemo(() => {
    const set = new Set<string>();
    for (const m of meta?.models ?? []) {
      const bt = m.bodyType?.trim();
      if (bt) set.add(bt);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [meta]);

  const priceBuckets = useMemo(
    () => buildPriceBuckets(meta?.priceRange),
    [meta],
  );

  const makeLinks = useMemo(
    () =>
      makes.map((name) => ({
        label: name,
        href: buildCarsInventoryUrl({ brand: name }),
      })),
    [makes],
  );

  const priceLinks = useMemo(
    () =>
      priceBuckets.map((b) => ({
        label: b.label,
        href: buildCarsInventoryUrl({
          priceMin: b.priceMin,
          priceMax: b.priceMax,
        }),
      })),
    [priceBuckets],
  );

  const bodyTypeLinks = useMemo(
    () =>
      bodyTypes.map((bt) => ({
        label: bt,
        href: buildCarsInventoryUrl({ bodyType: bt }),
      })),
    [bodyTypes],
  );

  const stats = useMemo(
    () => [
      {
        label: "Total Cars in Stock",
        value: totalCars != null ? totalCars.toLocaleString() : "…",
      },
      { label: "Insured Global Shipping", value: "120+ Countries" },
      { label: "Customer Satisfaction", value: "99%" },
    ],
    [totalCars],
  );

  const reviews = reviewsResponse?.data ?? [];

  const categoryCounts = meta?.categoryCounts;
  const categories = useMemo(() => {
    if (!categoryCounts) return null;
    return [
      { name: "New Arrivals", count: categoryCounts.newArrivals },
      { name: "Clearance", count: categoryCounts.clearance },
      { name: "Third Party", count: categoryCounts.thirdParty },
      { name: "Machinery", count: categoryCounts.machinery },
      { name: "UAE Stock", count: categoryCounts.uaeStock },
      { name: "Thailand Stock", count: categoryCounts.thailandStock },
    ];
  }, [categoryCounts]);

  const featuredCars = cars.slice(0, 4);
  const latestCars = cars.slice(0, 6);

  return (
    <LandingPageShell
      showBackgroundGlows
      mainClassName="relative z-10 pb-6 pt-2 sm:pt-3"
    >
      <MarketplaceWithSidebars
        makeLinks={makeLinks}
        priceLinks={priceLinks}
        bodyTypeLinks={bodyTypeLinks}
        sidebarMeta={{
          brands: makes,
          models: meta?.models ?? [],
          yearRange: meta?.yearRange ?? { min: null, max: null },
        }}
      >
        <HeroSection filters={heroFilters} stats={stats} />
        <PromoBannerStrip items={promoBanners} />
        <TopCarsStrip cars={cars} isLoading={carsLoading} />
        <SectionBlock
          id="featured"
          title="Featured Collection"
          description="A curated selection based on demand, quality checks, and export readiness."
        >
          {carsLoading && cars.length === 0 ? (
            <VehicleGridSkeleton count={4} />
          ) : (
            <VehicleGrid vehicles={featuredCars} />
          )}
        </SectionBlock>
        <SectionBlock
          title="Inventory Categories"
          description="Browse stock by inventory stream to quickly identify what matches your market."
        >
          <CategoryGrid items={categories} />
        </SectionBlock>
        <SectionBlock
          id="inventory"
          title="Latest Arrivals"
          description="Freshly listed vehicles with reference IDs and target pricing for quick decisions."
        >
          {carsLoading && cars.length === 0 ? (
            <VehicleGridSkeleton count={6} />
          ) : (
            <VehicleGrid vehicles={latestCars} />
          )}
        </SectionBlock>
        <SectionBlock
          id="about"
          title="Why Buyers Work With Us"
          description="Same business purpose as the reference platform, but intentionally redesigned with reusable blocks."
        >
          <TrustFeatures />
        </SectionBlock>
        <SectionBlock
          id="reviews"
          title="Customer Reviews"
          description="Feedback from importers who received vehicles in line with listing and expectation."
        >
          {reviews.length > 0 ? (
            <TestimonialGrid items={reviews} />
          ) : (
            <p className="rounded-2xl border border-[#452E5A]/15 bg-white/80 px-4 py-5 text-sm text-[#452E5A]/80 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
              No public reviews yet.
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl border-[#452E5A]/25 bg-white/85 px-6 shadow-sm transition-colors hover:bg-[#f3ecff] dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15"
            >
              <Link href="/reviews">Show more reviews</Link>
            </Button>
          </div>
        </SectionBlock>
        <ContactCta />
      </MarketplaceWithSidebars>
    </LandingPageShell>
  );
}
