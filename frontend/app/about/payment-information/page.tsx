import type { Metadata } from "next";
import { AboutPageShell } from "@/components/landing/about-page-shell";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment Information",
  description:
    "Review accepted payment methods and secure transaction workflow for international vehicle purchases.",
  path: "/about/payment-information",
});

export default function PaymentInformationPage() {
  return (
    <AboutPageShell
      badge="Secure Transactions"
      title="Payment Information"
      subtitle="Transparent, secure, and structured payment workflow designed for international vehicle trading."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
            Accepted Methods
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#452E5A]/90 dark:text-white/80">
            <li>Bank Telegraphic Transfer (T/T)</li>
            <li>Wire transfer from approved accounts</li>
            <li>Institution-backed international remittance</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
            Standard Process
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-[#452E5A]/90 dark:text-white/80">
            <li>1. Confirm vehicle and final quotation</li>
            <li>2. Receive proforma invoice from our team</li>
            <li>3. Complete payment and share transfer copy</li>
            <li>4. Shipment processing starts after clearance</li>
          </ol>
        </article>

        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
            Important Notes
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#452E5A]/90 dark:text-white/80">
            <li>Use only official company payment instructions.</li>
            <li>Payment details must match invoice references.</li>
            <li>For support, contact our team before transferring.</li>
          </ul>
        </article>
      </div>
    </AboutPageShell>
  );
}
