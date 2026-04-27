import type { Metadata } from "next";
import { buildPageMetadata } from "@/app/seo";
import { ShippingInformationClient } from "@/app/help/shipping-information/shipping-information-client";

export const metadata: Metadata = buildPageMetadata({
  title: "Shipping Information",
  description:
    "Get shipping guidance, destination coverage details, and logistics insights for vehicle exports.",
  path: "/help/shipping-information",
});

export default function ShippingInformationPage() {
  return <ShippingInformationClient />;
}
