import type { Metadata } from "next";
import { buildPageMetadata } from "@/app/seo";
import { CareersJobsSection } from "@/components/landing/sections/careers-jobs-section";

export const metadata: Metadata = buildPageMetadata({
  title: "Careers",
  description:
    "Discover career opportunities at ICC Trading Co Ltd and grow with our global vehicle trading team.",
  path: "/careers",
});

export default function CareersPage() {
  return <CareersJobsSection />;
}
