import type { Metadata } from "next";
import Link from "next/link";
import { AboutPageShell } from "@/components/landing/about-page-shell";
import { buildPageMetadata } from "@/app/seo";
import { FaqsClient } from "./faqs-client";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQs",
  description:
    "Answers about importing from Japan, contacting ICC Trading, worldwide shipping, and choosing the right vehicle.",
  path: "/help/faqs",
});

export default function FaqsPage() {
  return (
    <AboutPageShell
      badge="Help Center"
      title="Frequently Asked Questions"
      subtitle="Straightforward answers about buying, shipping, and working with ICC Trading—organized so you can expand only what you need."
    >
      <section className="rounded-3xl border border-[#452E5A]/12 bg-white/95 px-5 py-10 shadow-[0_20px_55px_-32px_rgba(30,16,78,0.85)] dark:border-white/10 dark:bg-[#150e2e]/90 sm:px-10 sm:py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#ff653f] sm:text-3xl">
          Got questions? We have answers.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-[#452E5A]/82 dark:text-white/75 sm:text-base">
          Browse the topics below for importing from Japan, getting in touch,
          international shipping, and picking a vehicle that fits your market.
        </p>
        <FaqsClient />
        <p className="mt-10 border-t border-[#452E5A]/10 pt-8 text-center text-sm text-[#452E5A]/72 dark:border-white/10 dark:text-white/65">
          Need something else?{" "}
          <Link
            href="/contact/connect-with-us"
            className="font-semibold text-[#ff653f] underline-offset-4 hover:underline"
          >
            Contact our team
          </Link>
          .
        </p>
      </section>
    </AboutPageShell>
  );
}
