"use client";

import Link from "next/link";
import { type ComponentType, type FormEvent, type SVGProps, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
} from "lucide-react";

import { InstagramIcon } from "@/components/icons/instagram-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContactMessageMutation } from "@/hooks/use-contact-message-mutation";
import { ApiError } from "@/lib/api/client";
import {
  contactLinks,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  JAPAN_OFFICE_ADDRESS_LINES,
} from "@/lib/contact-info";
import { useContactSettings } from "@/hooks/use-site-settings-query";

const NAME_MIN_LENGTH = 2;
const PHONE_MIN_LENGTH = 6;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 2000;
const fieldClassName =
  "h-12 rounded-lg border-[#d9d2e3] bg-white px-3 text-base text-[#2F2142] shadow-xs placeholder:text-[#766b84] focus-visible:border-[#FF653F] focus-visible:ring-[#FF653F]/20 dark:border-white/15 dark:bg-white/8 dark:text-white dark:placeholder:text-white/45 dark:focus-visible:border-[#FF8A6D] dark:focus-visible:ring-[#FF653F]/25";
const labelClassName =
  "text-sm font-semibold text-[#2F2142] dark:text-white/90";
const contactDetailClassName =
  "group flex items-start gap-3 rounded-2xl border border-[#452E5A]/10 bg-white/90 p-3 transition-colors hover:border-[#EA3B58]/35 hover:bg-[#fff5f7] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10";

type ContactDetail = {
  label: string;
  value: string;
  valueLines?: string[];
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  useNativeAnchor?: boolean;
};

export function ContactCta() {
  const contactMutation = useContactMessageMutation();
  const { settings } = useContactSettings();
  const links = contactLinks(settings);
  const [messageLength, setMessageLength] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitError(null);
    setSubmitSuccess(null);

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim() || undefined,
      city: String(formData.get("city") ?? "").trim() || undefined,
      company: String(formData.get("company") ?? "").trim() || undefined,
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
      form.reset();
      setMessageLength(0);
      setSubmitSuccess("Thank you. Your message has been sent successfully.");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError(
        "Unable to send your message right now. Please try again.",
      );
    }
  };

  const contactDetails: ContactDetail[] = [
    {
      label: "WhatsApp",
      value: links.whatsappNumber,
      href: links.whatsappUrl,
      icon: WhatsAppIcon,
    },
    {
      label: "Phone",
      value: links.contactPhone,
      href: links.contactPhoneTelUrl,
      icon: Phone,
    },
    {
      label: "Japan Office",
      value: JAPAN_OFFICE_ADDRESS_LINES.join(", "),
      valueLines: JAPAN_OFFICE_ADDRESS_LINES,
      href: "/contact/global-offices",
      icon: MapPin,
    },
    {
      label: "Email",
      value: links.contactEmail,
      href: links.contactEmailGmailUrl,
      icon: Mail,
      useNativeAnchor: true,
    },
    {
      label: "Instagram",
      value: INSTAGRAM_HANDLE,
      href: INSTAGRAM_URL,
      icon: InstagramIcon,
    },
  ];

  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8"
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white shadow-[0_18px_50px_-32px_rgba(30,16,78,0.55)] dark:border-white/10 dark:bg-[#150e2e]">
          <div className="border-b border-[#452E5A]/10 bg-[#fbf9ff] px-5 py-5 dark:border-white/10 dark:bg-white/4 sm:px-7 sm:py-6">
            <div className="flex items-start gap-3.5">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#FF653F] text-[#1E104E] shadow-sm">
                <MessageSquareText className="size-5" />
              </span>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[#1E104E] sm:text-2xl dark:text-white">
                  Send us your query
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-[#5F5270] sm:text-base dark:text-white/65">
                  Share your vehicle, market and budget requirements. Our team
                  will respond with suitable options and shipping guidance.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-5 p-5 sm:p-7" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="contact-name" className={labelClassName}>
                  Full name <span className="text-[#D93655]">*</span>
                </label>
                <Input
                  id="contact-name"
                  name="name"
                  required
                  minLength={NAME_MIN_LENGTH}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="e.g. Ahmed Khan"
                  className={fieldClassName}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-email" className={labelClassName}>
                  Email address <span className="text-[#D93655]">*</span>
                </label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={fieldClassName}
                />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label htmlFor="contact-phone" className={labelClassName}>
                  Phone number <span className="text-[#D93655]">*</span>
                </label>
                <Input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  required
                  minLength={PHONE_MIN_LENGTH}
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="+81 70 1234 5678"
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="contact-country" className={labelClassName}>
                  Country{" "}
                  <span className="font-normal text-[#766b84] dark:text-white/45">
                    (optional)
                  </span>
                </label>
                <Input
                  id="contact-country"
                  name="country"
                  maxLength={120}
                  autoComplete="country-name"
                  placeholder="e.g. Pakistan"
                  className={fieldClassName}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-city" className={labelClassName}>
                  City{" "}
                  <span className="font-normal text-[#766b84] dark:text-white/45">
                    (optional)
                  </span>
                </label>
                <Input
                  id="contact-city"
                  name="city"
                  maxLength={120}
                  autoComplete="address-level2"
                  placeholder="e.g. Karachi"
                  className={fieldClassName}
                />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label htmlFor="contact-company" className={labelClassName}>
                  Company{" "}
                  <span className="font-normal text-[#766b84] dark:text-white/45">
                    (optional)
                  </span>
                </label>
                <Input
                  id="contact-company"
                  name="company"
                  maxLength={120}
                  autoComplete="organization"
                  placeholder="Company name"
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="contact-message" className={labelClassName}>
                  Message <span className="text-[#D93655]">*</span>
                </label>
                <span
                  id="contact-message-count"
                  className="text-xs tabular-nums text-[#766b84] dark:text-white/45"
                >
                  {messageLength}/{MESSAGE_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="contact-message"
                name="message"
                required
                minLength={MESSAGE_MIN_LENGTH}
                maxLength={MESSAGE_MAX_LENGTH}
                aria-describedby="contact-message-count"
                placeholder="Tell us the model, year, budget, destination port and any other requirements."
                onChange={(event) => setMessageLength(event.currentTarget.value.length)}
                className={`${fieldClassName} min-h-40 resize-y py-3 leading-6`}
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-[#452E5A]/10 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
              <div className="min-h-10 sm:flex-1" aria-live="polite">
                {submitError ? (
                  <p
                    role="alert"
                    className="inline-flex items-start gap-2 rounded-lg bg-[#fff1f2] px-3 py-2 text-sm font-medium text-[#a51d35] dark:bg-[#a51d35]/20 dark:text-[#ffb8c5]"
                  >
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    {submitError}
                  </p>
                ) : null}
              {submitSuccess ? (
                  <p className="inline-flex items-start gap-2 rounded-lg bg-[#edf9f1] px-3 py-2 text-sm font-medium text-[#176b3a] dark:bg-[#176b3a]/25 dark:text-[#a8efc0]">
                    <CircleCheck className="mt-0.5 size-4 shrink-0" />
                    {submitSuccess}
                  </p>
              ) : null}
              </div>
              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="h-12 w-full rounded-lg border-0 bg-[#1E104E] px-6 font-semibold text-white shadow-sm hover:bg-[#352060] hover:text-white sm:w-auto dark:bg-[#FF7958] dark:text-[#1E104E] dark:hover:bg-[#FF8A6D]"
              >
                <Send className="size-4" />
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
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
              const content = (
                <>
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EA3B58]/12 text-[#EA3B58]">
                    <Icon className="size-4" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#EA3B58]">
                      {item.label}
                    </p>
                    {item.valueLines ? (
                      <div className="space-y-0.5 text-sm text-[#2F2142]/85 dark:text-white/80">
                        {item.valueLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#2F2142]/85 dark:text-white/80">
                        {item.value}
                      </p>
                    )}
                  </div>
                </>
              );

              if (item.useNativeAnchor) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={contactDetailClassName}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={contactDetailClassName}
                >
                  {content}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              asChild
              className="border-0 bg-[#25D366] text-white shadow-sm hover:bg-[#1EBE5D] hover:text-white"
            >
              <Link href={links.whatsappUrl}>
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#452E5A]/20 bg-white/90 text-[#2F2142] hover:bg-[#fff5f7] hover:text-[#2F2142] dark:border-white/20 dark:bg-white/8 dark:text-white dark:hover:bg-white/15 dark:hover:text-white"
            >
              <a
                href={links.contactEmailGmailUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Mail className="size-4" />
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
