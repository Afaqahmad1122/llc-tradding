import {
  CONTACT_EMAIL,
  CONTACT_PHONE_TEL,
  INSTAGRAM_URL,
} from "@/lib/contact-info";
import { SITE_ORIGIN } from "@/lib/site-origin";

/** Rich results / entity hints for ICC Trading vs similar domain names */
export function RootJsonLd() {
  const orgId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;

  const graph = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: "ICC Trading Co Ltd",
      alternateName: ["ICC Trading Japan", "icctradingco.com"],
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/body-types/logo_hino.png`,
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE_TEL,
      sameAs: [INSTAGRAM_URL],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: "ICC Trading Co Ltd",
      url: SITE_ORIGIN,
      inLanguage: "en",
      publisher: { "@id": orgId },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
