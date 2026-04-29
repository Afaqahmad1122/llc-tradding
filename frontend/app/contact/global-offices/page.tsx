import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { buildPageMetadata } from "@/app/seo";
import { noticeText } from "@/components/landing/home-data";
import { NoticeBar } from "@/components/landing/sections/notice-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { OFFICE_CONTACTS } from "@/lib/contact-info";

export const metadata: Metadata = buildPageMetadata({
  title: "Global Offices",
  description:
    "Find ICC Trading Co Ltd office locations and regional contact channels for quick support.",
  path: "/contact/global-offices",
});

export default function GlobalOfficesPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef]">
      <NoticeBar text={noticeText} />
      <SiteNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EA3B58]">
            Regional Support
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] sm:text-4xl">
            Global Offices
          </h1>
          <p className="max-w-3xl text-base text-[#452E5A]/85 sm:text-lg">
            Contact our regional offices for vehicle sourcing, export guidance,
            shipping schedules, and document support.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {OFFICE_CONTACTS.map((office) => (
            <article
              key={office.title}
              className="rounded-2xl border border-[#452E5A]/15 bg-white/90 p-6 shadow-[0_16px_40px_-30px_rgba(30,16,78,0.75)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EA3B58]/12 text-[#EA3B58]">
                  <MapPin className="size-4" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-[#1E104E] dark:text-white">
                    {office.title}
                  </h2>
                  <div className="mt-3 space-y-1 text-sm text-[#452E5A]/90 sm:text-base dark:text-white/80">
                    {office.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>

              {office.phone && office.phoneHref ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={office.phoneHref}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#452E5A]/15 bg-[#f8f5ff] px-3 text-sm font-semibold text-[#1E104E] transition-colors hover:bg-[#f1ebff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <Phone className="size-4 text-[#d14041]" />
                    {office.phone}
                  </Link>
                  {office.whatsappHref ? (
                    <Link
                      href={office.whatsappHref}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#452E5A]/15 bg-[#f8f5ff] px-3 text-sm font-semibold text-[#1E104E] transition-colors hover:bg-[#f1ebff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <WhatsAppIcon className="size-4 text-[#d14041]" />
                      WhatsApp
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
