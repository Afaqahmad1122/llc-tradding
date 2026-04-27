import type { Metadata } from "next";
import {
  ContactCta,
  LandingPageShell,
} from "@/components/landing/home-sections";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Connect With Us",
  description:
    "Contact ICC Trading Co Ltd for Japanese vehicle requirements, pricing guidance, and export support.",
  path: "/contact/connect-with-us",
});

export default function ConnectWithUsPage() {
  return (
    <LandingPageShell mainClassName="relative z-10 pb-8 pt-4 sm:pt-6">
      <section className="mx-auto w-full max-w-6xl px-4 pb-2 pt-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1E104E] sm:text-3xl dark:text-white">
          Connect With Us
        </h1>
        <p className="mt-2 max-w-3xl text-[#452E5A]/85 dark:text-white/70">
          Share your requirements and contact our team directly through verified
          channels.
        </p>
      </section>
      <ContactCta />
    </LandingPageShell>
  );
}
