import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/app/seo";
import { PublicCarDetailView } from "@/components/cars/public-car-detail-view";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { ApiError } from "@/lib/api/client";
import { fetchPublicCarByReference } from "@/lib/api/cars";
import { inventoryTitle } from "@/lib/car-display";

type PageProps = {
  params: Promise<{ referenceNo: string }>;
};

function normalizeReference(raw: string): string {
  return decodeURIComponent(raw).trim().toUpperCase();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const referenceNo = normalizeReference((await params).referenceNo);
  try {
    const { car } = await fetchPublicCarByReference(referenceNo);
    const title = inventoryTitle(car);
    const description = `${title} — ${car.year}. Reference ${car.referenceNo}. FOB ${car.priceUsd} USD. Export-ready stock from ICC Trading Co Ltd.`;
    return buildPageMetadata({
      title: `${car.referenceNo} · ${title}`,
      description,
      path: `/cars/${car.referenceNo}` as `/${string}`,
    });
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return buildPageMetadata({
        title: "Vehicle not found",
        description: "This listing is unavailable or has been removed.",
        path: `/cars/${referenceNo}` as `/${string}`,
      });
    }
    return buildPageMetadata({
      title: "Vehicle",
      description: "View export-ready vehicle details from ICC Trading Co Ltd.",
      path: `/cars/${referenceNo}` as `/${string}`,
    });
  }
}

export default async function PublicCarDetailPage({ params }: PageProps) {
  const referenceNo = normalizeReference((await params).referenceNo);
  try {
    const { car, similarCars } = await fetchPublicCarByReference(referenceNo);
    return (
      <LandingPageShell mainClassName="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <PublicCarDetailView car={car} similarCars={similarCars} />
      </LandingPageShell>
    );
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      notFound();
    }
    throw e;
  }
}
