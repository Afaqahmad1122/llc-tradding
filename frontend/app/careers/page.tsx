import type { Metadata } from "next";
import { buildPageMetadata } from "@/app/seo";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { CareersJobsSection } from "@/components/landing/sections/careers-jobs-section";

export const metadata: Metadata = buildPageMetadata({
  title: "Careers",
  description:
    "Discover career opportunities at ICC Trading Co Ltd and grow with our global vehicle trading team.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <LandingPageShell
      showBackgroundGlows
      mainClassName="relative z-10 pb-6 pt-2 sm:pt-3"
    >
      <CareersJobsSection />
    </LandingPageShell>
  );
}
