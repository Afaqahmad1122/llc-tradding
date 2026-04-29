import type { Metadata } from "next";
import { AboutPageShell } from "@/components/landing/about-page-shell";
import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Globe2,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { buildPageMetadata } from "@/app/seo";
import { OFFICE_CONTACTS } from "@/lib/contact-info";

export const metadata: Metadata = buildPageMetadata({
  title: "Company Profile",
  description:
    "Learn about ICC Trading Co Ltd, our history, offices, and quality-first approach to vehicle export.",
  path: "/about/company-profile",
});

const phoneNumbers = OFFICE_CONTACTS.flatMap((office) => {
  if (!office.phone || !office.phoneHref) {
    return [];
  }

  return [{
    country: office.phoneLabel ?? office.title.replace(" Office", ""),
    number: office.phone,
    href: office.phoneHref,
  }];
});

const companyStrengths = [
  {
    icon: ShieldCheck,
    title: "Trusted Process",
    description:
      "From sourcing to shipment documents, every deal follows a clear and verified flow.",
  },
  {
    icon: Globe2,
    title: "Global Service Network",
    description:
      "Our team supports buyers across multiple regions with responsive communication.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Commitment",
    description:
      "Vehicles are selected with a quality-first approach to maintain long-term customer trust.",
  },
];

export default function CompanyProfilePage() {
  return (
    <AboutPageShell
      badge="Trusted Since 2002"
      title="Company Profile"
      subtitle="ICC TRADING CO, LTD has built a strong reputation in global vehicle trading through consistent service standards, transparent communication, and customer-first support."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="relative overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white/90 p-5 shadow-[0_16px_40px_-28px_rgba(30,16,78,0.9)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#ff9f80]/25 blur-2xl" />
          <CalendarClock className="size-4 text-[#d14041]" />
          <p className="mt-2 text-sm text-[#452E5A]/75 dark:text-white/65">
            Established
          </p>
          <p className="mt-1 text-3xl font-bold text-[#1E104E] dark:text-white">
            2002
          </p>
        </article>
        <article className="relative overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white/90 p-5 shadow-[0_16px_40px_-28px_rgba(30,16,78,0.9)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#7f9bff]/20 blur-2xl" />
          <Building2 className="size-4 text-[#1e47b8]" />
          <p className="mt-2 text-sm text-[#452E5A]/75 dark:text-white/65">
            International Offices
          </p>
          <p className="mt-1 text-3xl font-bold text-[#1E104E] dark:text-white">
            {OFFICE_CONTACTS.length}
          </p>
        </article>
        <article className="relative overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white/90 p-5 shadow-[0_16px_40px_-28px_rgba(30,16,78,0.9)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#86f0c2]/20 blur-2xl" />
          <Sparkles className="size-4 text-[#0f8a66]" />
          <p className="mt-2 text-sm text-[#452E5A]/75 dark:text-white/65">
            Core Focus
          </p>
          <p className="mt-1 text-lg font-semibold text-[#1E104E] dark:text-white">
            Premium Auto Trading
          </p>
        </article>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {companyStrengths.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[#452E5A]/15 bg-white/90 p-5 shadow-[0_16px_40px_-30px_rgba(30,16,78,0.85)] dark:border-white/10 dark:bg-white/5"
          >
            <item.icon className="size-5 text-[#d14041]" />
            <h2 className="mt-3 text-lg font-semibold text-[#1E104E] dark:text-white">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-[#452E5A]/90 dark:text-white/80">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-[#452E5A]/15 bg-white/90 p-4 shadow-[0_20px_45px_-30px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-white/5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#1E104E] dark:text-white">
            Inside Our Automotive World
          </h2>
          <span className="rounded-full bg-[#1E104E]/8 px-3 py-1 text-xs font-semibold text-[#1E104E] dark:bg-white/10 dark:text-white/80">
            Company Showcase
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="group overflow-hidden rounded-2xl border border-[#452E5A]/12 bg-[#f8f5ff] dark:border-white/10 dark:bg-white/5">
            <div className="relative h-56 w-full sm:h-72">
              <Image
                src="/gerlex-ferrari-from-the-inside-4746504_1920.jpg"
                alt="Luxury sports car interior"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </article>
          <article className="group overflow-hidden rounded-2xl border border-[#452E5A]/12 bg-[#f8f5ff] dark:border-white/10 dark:bg-white/5">
            <div className="relative h-56 w-full sm:h-72">
              <Image
                src="/piro4d-lamborghini-1819244_1920.jpg"
                alt="Green luxury sports car on display"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </article>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {OFFICE_CONTACTS.map((office) => (
          <article
            key={office.title}
            className="rounded-2xl border border-[#452E5A]/15 bg-white/90 p-6 shadow-[0_16px_40px_-30px_rgba(30,16,78,0.75)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
          >
            <h2 className="text-xl font-semibold text-[#1E104E] dark:text-white">
              {office.title}
            </h2>
            <div className="mt-3 space-y-1 text-sm text-[#452E5A]/90 sm:text-base dark:text-white/80">
              {office.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-[#452E5A]/15 bg-white/90 p-6 shadow-[0_16px_40px_-30px_rgba(30,16,78,0.75)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <Phone className="size-5 text-[#d14041]" />
          <h2 className="text-xl font-semibold text-[#1E104E] dark:text-white">
            Phone Numbers
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {phoneNumbers.map((phone) => (
            <a
              key={phone.number}
              href={phone.href}
              className="rounded-xl border border-[#452E5A]/15 bg-[#f8f5ff] px-4 py-3 transition-colors hover:bg-[#f1ebff] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <p className="text-sm font-semibold text-[#1E104E] sm:text-base dark:text-white">
                <span className="mr-2 text-[#452E5A]/75 dark:text-white/70">
                  {phone.country}:
                </span>
                {phone.number}
              </p>
            </a>
          ))}
        </div>
      </section>
    </AboutPageShell>
  );
}
