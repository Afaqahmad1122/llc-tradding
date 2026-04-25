import { CheckCircle2 } from "lucide-react";

export function TrustFeatures() {
  const items = [
    "Verified export documentation and inspection",
    "Dedicated advisor for each order",
    "Fast WhatsApp and email support",
    "Transparent timeline from payment to shipment",
  ];

  return (
    <div className="grid gap-2 rounded-2xl border border-[#452E5A]/15 bg-white/80 p-5 shadow-[0_12px_32px_-18px_rgba(30,16,78,0.45)] sm:grid-cols-2 dark:border-white/10 dark:bg-[#150e2e]/80">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-2 text-sm text-[#452E5A] dark:text-white/80"
        >
          <CheckCircle2 className="mt-0.5 size-4 text-[#FF653F]" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
