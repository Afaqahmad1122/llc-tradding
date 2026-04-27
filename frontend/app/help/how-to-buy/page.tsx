import type { Metadata } from "next";
import { AboutPageShell } from "@/components/landing/about-page-shell";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  CircleDollarSign,
  Handshake,
  LocateFixed,
  PackageCheck,
  ShipWheel,
  Smile,
} from "lucide-react";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "How to Buy",
  description:
    "Follow a clear and modern step-by-step vehicle buying workflow from selection to delivery.",
  path: "/help/how-to-buy",
});

const buyingOptions = [
  {
    title: "Purchase From Live Stock",
    description:
      "Choose directly from our ready inventory with transparent pricing and complete inspection details.",
    icon: LocateFixed,
    accent: "from-[#5B6CFF] to-[#4A54D2]",
  },
  {
    title: "Buy Pre-Shipped Vehicles",
    description:
      "Secure vehicles already shipped from Japan for faster handover at selected destination ports.",
    icon: ShipWheel,
    accent: "from-[#14B8A6] to-[#0D9488]",
  },
] as const;

const steps = [
  {
    title: "Browse & Select",
    description:
      "Explore available vehicles and shortlist the best match based on specs, condition, and budget.",
    icon: CarFront,
    tone: "text-[#4A54D2]",
    border: "from-[#5B6CFF] to-[#8E97FF]",
    bg: "bg-[#eef0ff]",
  },
  {
    title: "Negotiate & Discuss",
    description:
      "Finalize price, shipment preferences, and any custom requirements with our sales specialists.",
    icon: Handshake,
    tone: "text-[#0D9488]",
    border: "from-[#14B8A6] to-[#58D5CA]",
    bg: "bg-[#e8fbf8]",
  },
  {
    title: "Secure Payment",
    description:
      "Receive your proforma invoice and complete payment through approved, secure transfer channels.",
    icon: CircleDollarSign,
    tone: "text-[#2563EB]",
    border: "from-[#3B82F6] to-[#93C5FD]",
    bg: "bg-[#eaf3ff]",
  },
  {
    title: "Professional Shipping",
    description:
      "Our logistics team handles booking, documentation, and shipment updates until vessel departure.",
    icon: PackageCheck,
    tone: "text-[#7C3AED]",
    border: "from-[#8B5CF6] to-[#C4B5FD]",
    bg: "bg-[#f4eeff]",
  },
  {
    title: "Relax & Receive",
    description:
      "Track arrival milestones and receive your vehicle with post-shipment support from our team.",
    icon: Smile,
    tone: "text-[#0F766E]",
    border: "from-[#0D9488] to-[#5EEAD4]",
    bg: "bg-[#e8fcfa]",
  },
] as const;

export default function HowToBuyPage() {
  return (
    <AboutPageShell
      badge="Smart Buyer Flow"
      title="How To Buy Your Dream Car"
      subtitle="A refined and guided purchase experience designed to keep every stage clear, predictable, and customer-friendly."
    >
      <section className="rounded-3xl border border-[#2d3a80]/10 bg-white/90 p-5 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#1E2A78] sm:text-4xl">
          Choose Your Buying Option
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {buyingOptions.map((option) => (
            <article
              key={option.title}
              className="group rounded-2xl border border-[#2d3a80]/10 bg-[#f8faff] p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_-24px_rgba(37,99,235,0.55)]"
            >
              <div
                className={`inline-flex rounded-xl bg-linear-to-br ${option.accent} p-3 text-white shadow-lg`}
              >
                <option.icon className="size-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#152057]">
                {option.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#33407a]/85 sm:text-base">
                {option.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-[#2d3a80]/10 bg-white/90 p-5 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#1E2A78] sm:text-4xl">
          Simple 5-Step Process
        </h2>
        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-[#2d3a80]/10 bg-white p-4 shadow-[0_16px_30px_-26px_rgba(37,99,235,0.65)] sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-r ${step.border} text-sm font-bold text-white shadow-md`}
                  >
                    {index + 1}
                  </div>
                  <div
                    className={`inline-flex rounded-xl p-3 ${step.bg} ${step.tone}`}
                  >
                    <step.icon className="size-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold ${step.tone}`}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#33407a]/85 sm:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-[#2d3a80]/15 bg-linear-to-r from-[#233084] via-[#2d3f9a] to-[#3c4fc3] px-6 py-12 text-white shadow-[0_22px_50px_-25px_rgba(37,99,235,0.75)] sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <BadgeCheck className="mx-auto size-7 text-[#77ffe8]" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Experience a Seamless Buying Process
          </h2>
          <p className="mt-3 text-base text-white/90 sm:text-lg">
            From first inquiry to final delivery, our improved workflow keeps
            every step smooth, transparent, and professionally managed.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-[#2d3a80]/15 bg-linear-to-r from-[#0f172a] via-[#1e293b] to-[#334155] p-6 text-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.9)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-2 text-sm text-slate-200 sm:text-base">
              Share your requirements with our team and get a guided purchase
              plan tailored to your destination and budget.
            </p>
          </div>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#60A5FA] bg-[#1D4ED8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] sm:text-base"
          >
            Contact Sales Team
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>
    </AboutPageShell>
  );
}
