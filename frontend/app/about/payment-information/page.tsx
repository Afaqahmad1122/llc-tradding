import type { Metadata } from "next";
import { AboutPageShell } from "@/components/landing/about-page-shell";
import { buildPageMetadata } from "@/app/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment Information",
  description:
    "Review accepted payment methods and secure transaction workflow for international vehicle purchases.",
  path: "/about/payment-information",
});

const beneficiaryBankDetails = [
  ["Beneficiary Bank Name", "RAKUTEN BANK, LTD"],
  ["Beneficiary Account Name", "ICC TRADING"],
  ["Account Number", "7776537"],
  ["Branch Code", "254"],
  ["Swift Code", "RAKTJPJT"],
  ["11-digit Swift Code", "RAKTJPJTXXX"],
  ["Account Type", "FUTSU"],
  ["Branch", "HEAD OFFICE"],
  ["Bank Address", "2-16-5 Konan, Minato-ku, Tokyo, Japan."],
];

const intermediaryBankDetails = [
  [
    "Intermediary Bank Name",
    "SUMITOMO MITSUI BANKING CORPORATION (SMBC) TOKYO, JAPAN",
  ],
  ["Swift / BIC Code", "SMBCJPJT"],
  ["Bank Address", "Tokyo, Japan"],
];

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

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="bg-[#111B49] px-5 py-4 text-sm font-bold uppercase tracking-wide text-white">
          Banking Details
        </h2>
        <div className="grid gap-8 p-5 md:grid-cols-[1fr_0.95fr] md:p-8">
          <dl className="space-y-3">
            {beneficiaryBankDetails.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 text-sm sm:grid-cols-[190px_1fr] sm:gap-5"
              >
                <dt className="font-bold uppercase text-[#6B7280] dark:text-white/55">
                  {label}
                </dt>
                <dd className="text-[#1E104E] dark:text-white/85">{value}</dd>
              </div>
            ))}
          </dl>

          <dl className="space-y-3">
            {intermediaryBankDetails.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 text-sm sm:grid-cols-[190px_1fr] sm:gap-5"
              >
                <dt className="font-bold uppercase text-[#6B7280] dark:text-white/55">
                  {label}
                </dt>
                <dd className="text-[#1E104E] dark:text-white/85">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </AboutPageShell>
  );
}
