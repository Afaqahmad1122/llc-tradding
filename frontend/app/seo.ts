import type { Metadata } from "next";

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}`;
};

const SITE_NAME = "ICC Trading Co Ltd";
const DEFAULT_OG_IMAGE = "/bernardsie-honda-1596081_1920.png";

export const buildPageMetadata = ({
  title,
  description,
  path,
}: BuildPageMetadataInput): Metadata => ({
  title,
  description,
  alternates: {
    canonical: path,
  },
  openGraph: {
    type: "website",
    url: path,
    siteName: SITE_NAME,
    title: `${title} | ${SITE_NAME}`,
    description,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: `${SITE_NAME} vehicle listing`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE_NAME}`,
    description,
    images: [DEFAULT_OG_IMAGE],
  },
});
