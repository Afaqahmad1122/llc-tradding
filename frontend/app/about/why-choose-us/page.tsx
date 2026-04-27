import type { Metadata } from "next";
import { AboutPageShell } from "@/components/landing/about-page-shell";
import { BadgeCheck, Clock3, Globe2, Handshake, Shield, Users } from "lucide-react";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Why Choose Us",
  description:
    "See why buyers choose ICC Trading Co Ltd for dependable process, transparent communication, and quality sourcing.",
  path: "/about/why-choose-us",
});

const highlights = [
  {
    icon: Clock3,
    title: "Experience You Can Trust",
    description:
      "Established in 2002, we bring long-term consistency and market knowledge to every transaction.",
  },
  {
    icon: Handshake,
    title: "Clear Communication",
    description:
      "Our team keeps buyers informed at each step from quotation to shipment documentation.",
  },
  {
    icon: Globe2,
    title: "Global Reach",
    description:
      "With multiple office locations, we support customers across regions with practical assistance.",
  },
  {
    icon: Shield,
    title: "Quality-Oriented Selection",
    description:
      "We focus on reliable vehicle sourcing and transparent details to help clients make confident decisions.",
  },
];

export default function WhyChooseUsPage() {
  return (
    <AboutPageShell
      badge="Customer First"
      title="Why Choose Us"
      subtitle="A dependable global vehicle partner focused on quality, clarity, and long-term customer relationships."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/90 p-5 shadow-[0_16px_40px_-28px_rgba(30,16,78,0.9)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <Users className="size-5 text-[#1e47b8]" />
          <p className="mt-2 text-sm text-[#452E5A]/75 dark:text-white/65">
            Customer-Centric
          </p>
          <p className="mt-1 text-xl font-bold text-[#1E104E] dark:text-white">
            Dedicated Support
          </p>
        </article>
        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/90 p-5 shadow-[0_16px_40px_-28px_rgba(30,16,78,0.9)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <BadgeCheck className="size-5 text-[#d14041]" />
          <p className="mt-2 text-sm text-[#452E5A]/75 dark:text-white/65">
            Reliable Process
          </p>
          <p className="mt-1 text-xl font-bold text-[#1E104E] dark:text-white">
            Verified Workflow
          </p>
        </article>
        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/90 p-5 shadow-[0_16px_40px_-28px_rgba(30,16,78,0.9)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <Globe2 className="size-5 text-[#0f8a66]" />
          <p className="mt-2 text-sm text-[#452E5A]/75 dark:text-white/65">
            Market Coverage
          </p>
          <p className="mt-1 text-xl font-bold text-[#1E104E] dark:text-white">
            Global Presence
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[#452E5A]/15 bg-white/90 p-6 shadow-[0_16px_40px_-30px_rgba(30,16,78,0.75)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
          >
            <item.icon className="size-5 text-[#d14041]" />
            <h2 className="text-xl font-semibold text-[#1E104E] dark:text-white">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-[#452E5A]/90 sm:text-base dark:text-white/80">
              {item.description}
            </p>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-[#452E5A]/15 bg-linear-to-r from-white to-[#f7f1ff] p-6 shadow-[0_16px_40px_-30px_rgba(30,16,78,0.75)] dark:border-white/10 dark:from-white/5 dark:to-white/10">
        <h2 className="text-2xl font-bold tracking-tight text-[#1E104E] dark:text-white">
          Commitment That Drives Confidence
        </h2>
        <p className="mt-3 text-sm text-[#452E5A]/90 sm:text-base dark:text-white/80">
          We do more than supply vehicles. We guide customers with consistent
          updates, clear documentation, and a practical end-to-end process that
          reduces uncertainty and improves buying confidence.
        </p>
      </section>
    </AboutPageShell>
  );
}
