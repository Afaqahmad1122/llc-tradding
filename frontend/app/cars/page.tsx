import type { Metadata } from "next";
import { StaticContentPage } from "@/components/landing/static-content-page";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cars",
  description:
    "Browse export-ready Japanese used cars with transparent details and direct quote support.",
  path: "/cars",
});

export default function CarsPage() {
  return (
    <StaticContentPage
      title="Cars"
      description="Browse available stock and featured vehicles. Detailed inventory modules will be connected dynamically."
    />
  );
}
