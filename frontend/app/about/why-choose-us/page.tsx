import { AboutPageShell } from "@/components/landing/about-page-shell";

const highlights = [
  {
    title: "Experience You Can Trust",
    description:
      "Established in 2002, we bring long-term consistency and market knowledge to every transaction.",
  },
  {
    title: "Clear Communication",
    description:
      "Our team keeps buyers informed at each step from quotation to shipment documentation.",
  },
  {
    title: "Global Reach",
    description:
      "With multiple office locations, we support customers across regions with practical assistance.",
  },
  {
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
      subtitle="A reliable partner for international vehicle trading with strong service standards and long-term trust."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
          >
            <h2 className="text-xl font-semibold text-[#1E104E] dark:text-white">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-[#452E5A]/90 sm:text-base dark:text-white/80">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </AboutPageShell>
  );
}
