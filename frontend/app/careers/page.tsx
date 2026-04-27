import type { Metadata } from "next";
import { StaticContentPage } from "@/components/landing/static-content-page";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Careers",
  description:
    "Discover career opportunities at ICC Trading Co Ltd and grow with our global vehicle trading team.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <StaticContentPage
      title="Careers"
      description="Open roles, culture details, and the application flow will be connected from dynamic data."
    />
  );
}
