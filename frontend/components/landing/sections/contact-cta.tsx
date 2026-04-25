import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ContactCta() {
  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/20 brand-gradient-main p-6 text-primary-foreground shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[#FF653F]/45 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-8 h-36 w-36 rounded-full bg-[#FFC85C]/40 blur-2xl" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight">
              Ready to import your next vehicle?
            </h3>
            <p className="max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
              Share your budget and preferred model. Our team will send options,
              pricing, and shipment guidance tailored to your destination.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
            >
              <Link href="https://wa.me/818011724000">
                <MessageCircle className="size-4" />
                WhatsApp
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/45 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="mailto:sales@afriditrading.com">
                <Mail className="size-4" />
                Email Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
