import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const contactDetails = [
  {
    label: "WhatsApp",
    value: "+81 70-6436-2003",
    href: "https://wa.me/817064362003",
    icon: MessageCircle,
  },
  {
    label: "Phone",
    value: "+81 70-6436-2003",
    href: "tel:+817064362003",
    icon: Phone,
  },
  {
    label: "Email",
    value: "icctradingjp@gmail.com",
    href: "mailto:icctradingjp@gmail.com",
    icon: Mail,
  },
];

export function ContactCta() {
  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8"
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 brand-gradient-main p-6 text-white shadow-2xl sm:p-8 dark:border-white/15">
          <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[#FF653F]/45 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-8 h-36 w-36 rounded-full bg-[#FFC85C]/40 blur-2xl" />
          <div className="relative space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Send us your query now
              </h3>
              <p className="max-w-2xl text-sm text-white/85 sm:text-base">
                Tell us your required model, market and target budget. We will
                share shortlist options with shipping guidance.
              </p>
            </div>

            <form className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Full name*"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <Input
                  type="email"
                  placeholder="Email*"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Phone*"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <Select>
                  <SelectTrigger className="h-10 w-full border-white/25 bg-white/12 text-white data-placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10">
                    <SelectValue placeholder="Vehicle requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  placeholder="Country"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <Input
                  placeholder="City"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <Input
                  placeholder="Company"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
              </div>
              <Textarea
                placeholder="Message*"
                className="min-h-28 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
              />
              <Button className="h-11 rounded-xl border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] px-5 font-semibold text-[#1E104E] hover:opacity-90">
                <Send className="size-4" />
                Send Message
              </Button>
            </form>
          </div>
        </div>

        <div className="rounded-3xl border border-[#452E5A]/15 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EA3B58]">
              Contact Information
            </p>
            <h4 className="mt-1 text-xl font-semibold text-[#1E104E] dark:text-white">
              Multiple ways to reach our team
            </h4>
          </div>
          <div className="space-y-3">
            {contactDetails.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-2xl border border-[#452E5A]/10 bg-white/90 p-3 transition-colors hover:border-[#EA3B58]/35 hover:bg-[#fff5f7] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EA3B58]/12 text-[#EA3B58]">
                    <Icon className="size-4" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#EA3B58]">
                      {item.label}
                    </p>
                    <p className="text-sm text-[#2F2142]/85 dark:text-white/80">
                      {item.value}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              asChild
              className="border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
            >
              <Link href="https://wa.me/817064362003">
                <MessageCircle className="size-4" />
                WhatsApp
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#452E5A]/20 bg-white/90 text-[#2F2142] hover:bg-[#fff5f7] hover:text-[#2F2142] dark:border-white/20 dark:bg-white/8 dark:text-white dark:hover:bg-white/15 dark:hover:text-white"
            >
              <Link href="mailto:icctradingjp@gmail.com">
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
