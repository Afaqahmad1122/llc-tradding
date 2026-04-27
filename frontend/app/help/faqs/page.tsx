import type { Metadata } from "next";
import { StaticContentPage } from "@/components/landing/static-content-page";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQs",
  description:
    "Find quick answers to common questions about buying, shipping, and contacting ICC Trading Co Ltd.",
  path: "/help/faqs",
});

export default function FaqsPage() {
  return (
    <StaticContentPage
      title="FAQs"
      description="Frequently asked questions and quick answers will be served dynamically in the next phase."
    />
  );
}
