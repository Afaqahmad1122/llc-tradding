import Link from "next/link";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { WHATSAPP_URL } from "@/lib/contact-info";

export function WhatsAppFloat() {
  return (
    <Link
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.7)] ring-1 ring-white/30 transition-transform duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping" />
      <WhatsAppIcon className="relative size-7 sm:size-8" />
    </Link>
  );
}
