"use client";
import {
  categories,
  featuredVehicles,
  heroFilters,
  latestVehicles,
  noticeText,
  stats,
  testimonials,
} from "@/components/landing/home-data";
import {
  CategoryGrid,
  ContactCta,
  HeroSection,
  NoticeBar,
  SectionBlock,
  TestimonialGrid,
  TrustFeatures,
  VehicleGrid,
} from "@/components/landing/home-sections";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-linear-to-b from-background to-muted/30">
      <NoticeBar text={noticeText} />
      <main className="pb-4">
        <HeroSection filters={heroFilters} stats={stats} />
        <SectionBlock
          title="Featured Collection"
          description="A curated selection based on demand, quality checks, and export readiness."
        >
          <VehicleGrid vehicles={featuredVehicles} />
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
          <VehicleGrid vehicles={latestVehicles} />
        </SectionBlock>
        <SectionBlock
          title="Why Buyers Work With Us"
          description="Same business purpose as the reference platform, but intentionally redesigned with reusable blocks."
        >
          <TrustFeatures />
        </SectionBlock>
        <SectionBlock
          title="Customer Reviews"
          description="Feedback from importers who received vehicles in line with listing and expectation."
        >
          <TestimonialGrid items={testimonials} />
        </SectionBlock>
        <ContactCta />
      </main>
    </div>
  );
}
