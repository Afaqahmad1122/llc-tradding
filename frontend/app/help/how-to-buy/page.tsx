import type { Metadata } from "next";
import { StaticContentPage } from "@/components/landing/static-content-page";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "How to Buy",
  description:
    "Follow our step-by-step process to purchase and import Japanese vehicles confidently.",
  path: "/help/how-to-buy",
});

export default function HowToBuyPage() {
  return (
    <StaticContentPage
      title="How to Buy"
      description="Step-by-step purchase process and required checkpoints will be available through dynamic modules."
    />
  );
}
