import Link from "next/link";
import {
  Clock3,
  Globe2,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";

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
              <p className="text-xl font-bold tracking-tight">LLC Trading Japan</p>
              <p className="mt-1 text-sm text-white/75">
                Trusted Japanese vehicle exporter with transparent process.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="font-semibold text-white">Business Hours</p>
              <div className="mt-2 flex items-start gap-2 text-white/80">
                <Clock3 className="mt-0.5 size-4 shrink-0" />
                <p>
                  Mon - Fri: 9:00 AM - 6:00 PM JST
                  <br />
                  Sat: 9:00 AM - 4:00 PM JST
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-lg font-semibold">Contact Us</p>
            <div className="space-y-2 text-sm">
              <Link
                href="https://wa.me/817044570584"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <MessageCircle className="size-4 text-[#FFC85C]" />
                +81 7044570584
              </Link>
              <Link
                href="tel:+818051730786"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <Phone className="size-4 text-[#FFC85C]" />
                +81 8051730786
              </Link>
              <Link
                href="mailto:sales@afriditrading.com"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition-colors hover:bg-white/10"
              >
                <Mail className="size-4 text-[#FFC85C]" />
                sales@afriditrading.com
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-lg font-semibold">Quick Links</p>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 transition-colors hover:bg-white/10"
                >
                  {item.label}
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
          <p>© 2026 LLC Trading. All rights reserved.</p>
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
