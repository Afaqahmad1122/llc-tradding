"use client";
import {
  bodyTypeSidebarItems,
  categories,
  currencyItems,
  featuredVehicles,
  heroFilters,
  latestVehicles,
  makeSidebarItems,
  noticeText,
  priceSidebarItems,
  promoBanners,
  rightSidebarFilters,
  stats,
  testimonials,
} from "@/components/landing/home-data";
import {
  CategoryGrid,
  ContactCta,
  HeroSection,
  MarketplaceWithSidebars,
  NoticeBar,
  PromoBannerStrip,
  SectionBlock,
  TestimonialGrid,
  TopCarsStrip,
  TrustFeatures,
  VehicleGrid,
} from "@/components/landing/home-sections";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0c0720] dark:via-[#120932] dark:to-[#1a0e3d]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#452E5A]/20 blur-3xl dark:bg-[#FF653F]/15" />
      <div className="pointer-events-none absolute -right-24 top-44 h-80 w-80 rounded-full bg-[#FF653F]/20 blur-3xl dark:bg-[#FFC85C]/10" />
      <NoticeBar text={noticeText} />
      <SiteNavbar />
      <main className="relative z-10 pb-6 pt-2 sm:pt-3">
        <MarketplaceWithSidebars
          makes={makeSidebarItems}
          priceRanges={priceSidebarItems}
          currencies={currencyItems}
          filters={rightSidebarFilters}
          bodyTypes={bodyTypeSidebarItems}
        >
          <HeroSection filters={heroFilters} stats={stats} />
          <PromoBannerStrip items={promoBanners} />
          <TopCarsStrip />
          <SectionBlock
            id="featured"
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
            <TestimonialGrid items={testimonials} />
          </SectionBlock>
          <ContactCta />
        </MarketplaceWithSidebars>
      </main>
      <SiteFooter />
    </div>
  );
}
