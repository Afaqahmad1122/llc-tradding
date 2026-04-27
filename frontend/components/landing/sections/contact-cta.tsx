"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
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
import { useContactMessageMutation } from "@/hooks/use-contact-message-mutation";
import { ApiError } from "@/lib/api/client";

const NAME_MIN_LENGTH = 2;
const PHONE_MIN_LENGTH = 6;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 2000;

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
  const contactMutation = useContactMessageMutation();
  const [vehicleRequirement, setVehicleRequirement] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim() || undefined,
      city: String(formData.get("city") ?? "").trim() || undefined,
      company: String(formData.get("company") ?? "").trim() || undefined,
      vehicleRequirement: String(formData.get("vehicleRequirement") ?? "").trim() || undefined,
      message: String(formData.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.message) {
      setSubmitError("Please fill name, email, phone and message.");
      return;
    }
    if (payload.name.length < NAME_MIN_LENGTH) {
      setSubmitError("Name must be at least 2 characters.");
      return;
    }
    if (payload.phone.length < PHONE_MIN_LENGTH) {
      setSubmitError("Phone must be at least 6 characters.");
      return;
    }
    if (payload.message.length < MESSAGE_MIN_LENGTH) {
      setSubmitError("Message must be at least 10 characters.");
      return;
    }
    if (payload.message.length > MESSAGE_MAX_LENGTH) {
      setSubmitError("Message cannot exceed 2000 characters.");
      return;
    }

    try {
      await contactMutation.mutateAsync(payload);
      event.currentTarget.reset();
      setVehicleRequirement("");
      setSubmitSuccess("Thank you. Your message has been sent successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Unable to send your message right now. Please try again.");
    }
  };

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

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  name="name"
                  required
                  minLength={NAME_MIN_LENGTH}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Full name*"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <Input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="Email*"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  name="phone"
                  required
                  minLength={PHONE_MIN_LENGTH}
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="Phone*"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <input
                  type="hidden"
                  name="vehicleRequirement"
                  value={vehicleRequirement}
                />
                <Select value={vehicleRequirement} onValueChange={setVehicleRequirement}>
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
                  name="country"
                  maxLength={120}
                  autoComplete="country-name"
                  placeholder="Country"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <Input
                  name="city"
                  maxLength={120}
                  autoComplete="address-level2"
                  placeholder="City"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
                <Input
                  name="company"
                  maxLength={120}
                  autoComplete="organization"
                  placeholder="Company"
                  className="h-10 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
                />
              </div>
              <Textarea
                name="message"
                required
                minLength={MESSAGE_MIN_LENGTH}
                maxLength={MESSAGE_MAX_LENGTH}
                placeholder="Message*"
                className="min-h-28 border-white/25 bg-white/12 text-white placeholder:text-white/70 focus-visible:border-white/45 focus-visible:ring-white/25 dark:bg-white/10"
              />
              {submitError ? (
                <p className="text-sm font-medium text-[#ffd6d6]">{submitError}</p>
              ) : null}
              {submitSuccess ? (
                <p className="text-sm font-medium text-[#cfffd6]">{submitSuccess}</p>
              ) : null}
              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="h-11 rounded-xl border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] px-5 font-semibold text-[#1E104E] hover:opacity-90"
              >
                <Send className="size-4" />
                {contactMutation.isPending ? "Sending..." : "Send Message"}
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
