import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_MAILTO,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL_URL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  UGANDA_CONTACT_PHONE,
  UGANDA_CONTACT_PHONE_TEL_URL,
  UGANDA_OFFICE_ADDRESS,
  WHATSAPP_URL,
} from "@/lib/contact-info";

const quickLinks = [
  { label: "Cars", href: "#inventory" },
  { label: "Company Profile", href: "#about" },
  { label: "Why Choose Us", href: "#about" },
  { label: "How To Buy", href: "#featured" },
  { label: "FAQs", href: "#reviews" },
  { label: "Payment Information", href: "#contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#FF653F]/35 brand-gradient-main text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-2xl bg-white shadow">
                <Image
                  src="/logo.png"
                  alt="ICC Trading Japan logo"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-3 text-center text-xl font-bold tracking-tight">
                Icc Trading Japan
              </p>
              <p className="mt-0.5 text-center text-xs text-white/75">Car Import &amp; Export</p>
              <p className="mt-2 text-center text-sm text-white/75">
                Trusted Japanese vehicle exporter with transparent process.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="font-semibold text-white">Business Hours</p>
              <div className="mt-2 flex items-start gap-2 text-white/80">
                <Clock3 className="mt-0.5 size-4 shrink-0" />
                <p>
                  Mon - Fri: 9:00 AM - 6:00 PM PKT
                  <br />
                  Sat: 9:00 AM - 4:00 PM PKT
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-lg font-semibold">Contact Us</p>
            <div className="space-y-2 text-sm">
              <Link
                href={WHATSAPP_URL}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <WhatsAppIcon className="size-4 text-[#FFC85C]" />
                {CONTACT_PHONE}
              </Link>
              <Link
                href={CONTACT_PHONE_TEL_URL}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <Phone className="size-4 text-[#FFC85C]" />
                {CONTACT_PHONE}
              </Link>
              <Link
                href={UGANDA_CONTACT_PHONE_TEL_URL}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <Phone className="size-4 text-[#FFC85C]" />
                {UGANDA_CONTACT_PHONE}
              </Link>
              <Link
                href="/contact/global-offices"
                className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#FFC85C]" />
                <span>{UGANDA_OFFICE_ADDRESS}</span>
              </Link>
              <Link
                href={CONTACT_EMAIL_MAILTO}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <Mail className="size-4 text-[#FFC85C]" />
                {CONTACT_EMAIL}
              </Link>
              <Link
                href={INSTAGRAM_URL}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <InstagramIcon className="size-4 text-[#FFC85C]" />
                {INSTAGRAM_HANDLE}
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-lg font-semibold">Quick Links</p>
            <div className="space-y-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/85 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="size-4 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#FFC85C]" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-lg font-semibold">Why Choose Us</p>
            <div className="space-y-2 text-sm text-white/85">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <ShieldCheck className="size-4 text-[#FFC85C]" />
                Quality Guaranteed
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Globe2 className="size-4 text-[#FFC85C]" />
                Global Shipping Network
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Star className="size-4 text-[#FFC85C]" />
                4.9/5 Customer Rating
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#120A2F]/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Icc Trading. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-white">
              Terms and Conditions
            </Link>
            <Link href="#" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
