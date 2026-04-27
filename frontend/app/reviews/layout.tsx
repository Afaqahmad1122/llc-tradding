import type { Metadata } from "next";

import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Reviews",
  description:
    "Read public customer reviews from buyers who imported vehicles through ICC Trading Co Ltd.",
  path: "/reviews",
});

export default function ReviewsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
