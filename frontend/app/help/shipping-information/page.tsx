import type { Metadata } from "next";
import { StaticContentPage } from "@/components/landing/static-content-page";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Shipping Information",
  description:
    "Get shipping guidance, destination coverage details, and logistics insights for vehicle exports.",
  path: "/help/shipping-information",
});

export default function ShippingInformationPage() {
  return (
    <StaticContentPage
      title="Shipping Information"
      description="Shipping timelines, destination coverage, and logistics updates will be connected dynamically."
    />
  );
}
