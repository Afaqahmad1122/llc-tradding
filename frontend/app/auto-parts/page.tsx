import type { Metadata } from "next";
import { StaticContentPage } from "@/components/landing/static-content-page";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Auto Parts",
  description:
    "Explore Japanese auto parts options with inquiry support for sourcing and export.",
  path: "/auto-parts",
});

export default function AutoPartsPage() {
  return (
    <StaticContentPage
      title="Auto Parts"
      description="Auto parts listings, categories, and inquiry flow are prepared here and will be loaded dynamically."
    />
  );
}
