import type { Metadata } from "next";

import { PublicCarsInventory } from "@/components/cars/public-cars-inventory";
import { noticeText } from "@/components/landing/home-data";
import { NoticeBar } from "@/components/landing/sections/notice-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cars",
  description:
    "Browse live export-ready inventory with transparent specs, pricing in USD, and shipping guidance from ICC Trading Co Ltd.",
  path: "/cars",
});

export default function CarsPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef]">
      <NoticeBar text={noticeText} />
      <SiteNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <header className="rounded-3xl border border-[#452E5A]/15 bg-white/85 px-8 py-8 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)]">
            <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] sm:text-4xl">
              Cars
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[#452E5A]/85 sm:text-lg">
              Browse ICC Trading&apos;s available stock sourced from auctions and
              partner yards. Pricing is shown in USD; published listings mirror
              the admin catalogue in near real-time.
            </p>
          </header>
          <PublicCarsInventory />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
