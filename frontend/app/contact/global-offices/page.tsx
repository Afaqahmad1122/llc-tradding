import type { Metadata } from "next";
import { StaticContentPage } from "@/components/landing/static-content-page";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Global Offices",
  description:
    "Find ICC Trading Co Ltd office locations and regional contact channels for quick support.",
  path: "/contact/global-offices",
});

export default function GlobalOfficesPage() {
  return (
    <StaticContentPage
      title="Global Offices"
      description="Office locations and regional contact details will be filled from dynamic content."
    />
  );
}
