import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "./seo";

/** Public routes for search indexing */
const STATIC_PATHS: `/${string}`[] = [
  "/",
  "/about",
  "/about/company-profile",
  "/about/payment-information",
  "/about/why-choose-us",
  "/auto-parts",
  "/careers",
  "/cars",
  "/contact",
  "/contact/connect-with-us",
  "/contact/global-offices",
  "/help/faqs",
  "/help/how-to-buy",
  "/help/shipping-information",
  "/reviews",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map((path) => ({
    url: `${SITE_ORIGIN}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
