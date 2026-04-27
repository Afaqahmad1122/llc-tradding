import type { Metadata } from "next";
import { AboutPageShell } from "@/components/landing/about-page-shell";
import {
  BadgeCheck,
  CheckCircle2,
  CircleDot,
  Container,
  Package,
  Ship,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Auto Parts",
  description:
    "Explore Japanese auto parts options with inquiry support for sourcing and export.",
  path: "/auto-parts",
});

export default function AutoPartsPage() {
  const components = [
    "Engine and Gear x1 (without catalytic converter)",
    "Front and Rear Suspension x1",
    "Front Nose Cut x1",
    "Front Fenders x2",
    "Bonnet x1",
    "Side Doors x4",
    "Side Mirrors x2",
    "Back Door or Trunk Lid x1",
    "Rear Bumper x1",
    "Tail Lights x2",
  ];

  const processSteps = [
    "Customer signs agreement with Afridi Trading Japan",
    "Customer transfers security deposit",
    "Afridi Trading Japan gives auction access",
    "Customer places bids and purchases cars",
    "Our team dismantles cars based on request",
    "We load container and ship to destination",
  ];

  const pricingColumns = [
    {
      title: "Expenses for Car",
      color: "from-[#ef4444] to-[#dc2626]",
      items: [
        "Auction car price",
        "Auction fee",
        "Transportation to our yard fee",
        "Recycle fee",
        "Our agent fee",
        "Dismantle cost",
      ],
    },
    {
      title: "Container Expenses",
      color: "from-[#10b981] to-[#059669]",
      items: [
        "Drayage (container transportation)",
        "Customer broker's fee",
        "Export tax",
        "Container scale",
        "Container seal",
        "Origin THC (Terminal Handling Charges)",
      ],
    },
    {
      title: "Freight",
      color: "from-[#3b82f6] to-[#2563eb]",
      items: [
        "Amount paid to shipping company",
        "Freight depends on destination country and port",
      ],
    },
  ];

  return (
    <AboutPageShell
      badge="Professional Dismantling Services"
      title="Auto Parts & Dismantling Services"
      subtitle="Quality Japanese auto parts with professional dismantling and container shipping worldwide."
    >
      <section className="space-y-8">
        <div className="rounded-3xl border border-[#1e2a78]/10 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf2ff] px-4 py-1 text-xs font-semibold text-[#3b82f6]">
            <BadgeCheck className="size-4" />
            Quality Assurance
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-[#111827] sm:text-5xl">
            Looking for quality parts for your automotive needs?
          </h2>
          <p className="mt-4 text-xl font-semibold text-[#dc2626] sm:text-3xl">
            Afridi Trading Japan Is Your One Stop for Quality Scrap Cars and
            Parts
          </p>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-[#374151] sm:text-lg">
            We offer a large range of scrap cars from which you can purchase
            spare parts or complete engine sets. Along with dismantling, we can
            also load used parts into containers and arrange shipment so you
            don&apos;t have to worry about logistics.
          </p>
        </div>

        <div className="rounded-3xl border border-[#1e2a78]/10 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
          <h2 className="text-center text-3xl font-bold text-[#dc2626] sm:text-5xl">
            Components for Dismantling
          </h2>
          <p className="mt-2 text-center text-sm text-[#4b5563] sm:text-lg">
            Professional dismantling of quality auto parts with modern equipment
            and expert handling
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {components.map((item) => (
              <article
                key={item}
                className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-5"
              >
                <div className="inline-flex rounded-xl bg-[#ffecef] p-3 text-[#dc2626]">
                  <Wrench className="size-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-[#111827] sm:text-base">
                  {item}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#1e2a78]/10 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
          <h2 className="text-center text-3xl font-bold text-[#dc2626] sm:text-5xl">
            Our Process
          </h2>
          <p className="mt-2 text-center text-sm text-[#4b5563] sm:text-lg">
            Step-by-step professional dismantling and shipping process
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => (
              <article
                key={step}
                className="rounded-2xl border border-[#dbe2ff] bg-[#f5f8ff] p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#1d4ed8]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm text-[#1f2937]">{step}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#1e2a78]/10 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
          <h2 className="text-center text-3xl font-bold text-[#dc2626] sm:text-5xl">
            Quotation Requirements
          </h2>
          <p className="mt-2 text-center text-sm text-[#4b5563] sm:text-lg">
            Information required from customer to provide quotation
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[#f1f5f9] bg-[#fff7f7] p-6 text-center">
              <Container className="mx-auto size-8 text-[#dc2626]" />
              <p className="mt-4 text-lg font-semibold text-[#111827]">
                Container type (20F/40F)
              </p>
            </article>
            <article className="rounded-2xl border border-[#f1f5f9] bg-[#fff7f7] p-6 text-center">
              <Ship className="mx-auto size-8 text-[#dc2626]" />
              <p className="mt-4 text-lg font-semibold text-[#111827]">
                Country and destination port
              </p>
            </article>
            <article className="rounded-2xl border border-[#f1f5f9] bg-[#fff7f7] p-6 text-center">
              <ShoppingCart className="mx-auto size-8 text-[#dc2626]" />
              <p className="mt-4 text-lg font-semibold text-[#111827]">
                Freight payment terms (collect or prepaid)
              </p>
            </article>
          </div>
        </div>

        <div className="rounded-3xl border border-[#fecaca] bg-[#fff1f2] p-6 text-[#991b1b] sm:p-8">
          <h3 className="text-2xl font-bold">Exclusions</h3>
          <p className="mt-2 text-sm sm:text-base">
            The parts set does not include car interior parts, catalytic
            converters, tires, or other miscellaneous parts.
          </p>
        </div>

        <div className="rounded-3xl border border-[#1e2a78]/10 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
          <h2 className="text-center text-3xl font-bold text-[#dc2626] sm:text-5xl">
            Cost Calculation
          </h2>
          <p className="mt-2 text-center text-sm text-[#4b5563] sm:text-lg">
            C&amp;F to your destination country includes
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricingColumns.map((column) => (
              <article
                key={column.title}
                className="overflow-hidden rounded-2xl border border-[#e5e7eb]"
              >
                <div
                  className={`bg-linear-to-r ${column.color} px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white`}
                >
                  {column.title}
                </div>
                <div className="space-y-2 bg-white p-4">
                  {column.items.map((item) => (
                    <p
                      key={item}
                      className="rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-[#1f2937]"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#fde68a] bg-[#fffbeb] p-6 text-[#78350f] sm:p-8">
          <h3 className="text-2xl font-bold">Parts Packaging Fee</h3>
          <p className="mt-2 text-sm leading-7 sm:text-base">
            We do not charge labor for packaging, but material fee applies.
            Packaging material can be selected by customer. Average packaging
            fee is <strong>50,000 JPY per container</strong>.
          </p>
        </div>

        <div className="rounded-3xl border border-[#1e2a78]/10 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)] sm:p-8">
          <h2 className="text-center text-3xl font-bold text-[#dc2626] sm:text-5xl">
            Container Capacity
          </h2>
          <p className="mt-2 text-center text-sm text-[#4b5563] sm:text-lg">
            Number of cars that can be loaded per container type
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#dbe2ff]">
            <div className="grid grid-cols-3 bg-[#1e2a78] text-sm font-semibold text-white">
              <p className="p-3">Type</p>
              <p className="p-3 text-center">40F Container</p>
              <p className="p-3 text-center">20F Container</p>
            </div>
            <div className="grid grid-cols-3 border-t border-[#e5e7eb] bg-white">
              <p className="p-3 font-semibold text-[#dc2626]">Full Car Dismantle</p>
              <p className="p-3 text-center font-semibold text-[#111827]">25-32 Cars</p>
              <p className="p-3 text-center font-semibold text-[#111827]">15 Cars</p>
            </div>
            <div className="grid grid-cols-3 border-t border-[#e5e7eb] bg-white">
              <p className="p-3 font-semibold text-[#dc2626]">Half Cut</p>
              <p className="p-3 text-center font-semibold text-[#111827]">18 Cars</p>
              <p className="p-3 text-center font-semibold text-[#111827]">9 Cars</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1e2a78]/10 bg-linear-to-r from-[#1e3a8a] to-[#1f2937] p-6 text-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.75)] sm:p-8">
          <h2 className="text-3xl font-bold sm:text-4xl">Shipping Information</h2>
          <div className="mt-6 space-y-3">
            {[
              "We only ship in bulk, requiring either a 20F or 40F container.",
              "We do not sell parts locally; all are for export purposes only.",
              "Shipping of airbags and batteries is prohibited by Japanese law.",
              "Customers receive 30-40 photos of container packing.",
              "Shipping line is selected based on customer preferences.",
              "After shipment, we send photos link, container number, tracking link, original bill of lading, and shipping invoice.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3"
              >
                <CircleDot className="mt-0.5 size-4 shrink-0 text-[#f43f5e]" />
                <p className="text-sm text-white/95 sm:text-base">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-3xl border border-[#1e2a78]/15 bg-linear-to-r from-[#0f172a] via-[#1e293b] to-[#334155] p-6 text-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Need a Quote for Auto Parts?
              </h2>
              <p className="mt-2 text-sm text-slate-200 sm:text-base">
                Share your required parts list and destination details for a
                fast shipping and dismantling quotation.
              </p>
            </div>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#34d399] bg-[#16a34a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15803d] sm:text-base"
            >
              <Package className="size-4" />
              Get Quote on WhatsApp
              <CheckCircle2 className="size-4" />
            </a>
          </div>
        </section>
      </section>
    </AboutPageShell>
  );
}
