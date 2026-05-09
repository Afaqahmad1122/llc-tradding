import type { Metadata } from "next";

import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Write a review",
  description:
    "Share buyer feedback after ICC Trading enables review access on your signed-in account.",
  path: "/reviews/submit",
});

export default function SubmitReviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
