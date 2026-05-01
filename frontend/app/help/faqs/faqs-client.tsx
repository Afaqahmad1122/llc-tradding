"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CONTACT_EMAIL_MAILTO,
  CONTACT_PHONE_TEL_URL,
  WHATSAPP_URL,
} from "@/lib/contact-info";

const faqItem =
  "group border-b-0! overflow-hidden rounded-2xl border border-[#452E5A]/12 bg-white shadow-[0_12px_36px_-22px_rgba(30,16,78,0.55)] dark:border-white/10 dark:bg-[#150e2e]/95";

const faqTrigger =
  "px-5 py-4 text-[15px] font-semibold text-[#1E104E] hover:no-underline group-data-[state=open]:bg-[#fff0eb] dark:text-white dark:group-data-[state=open]:bg-accent/15 sm:px-6 sm:text-base [&_svg]:text-[#ff653f]";

const faqContent =
  "border-t border-[#452E5A]/8 px-5 pb-6 pt-4 dark:border-white/10 sm:px-6";

const faqBody =
  "text-sm leading-relaxed text-[#452E5A]/88 dark:text-white/80 sm:text-[15px]";

const faqLink =
  "font-semibold text-[#ff653f] underline-offset-4 hover:underline";

const faqBadge =
  "rounded-lg bg-linear-to-r from-[#c53030] via-[#ff653f] to-[#ff8f57] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm";

function StepFlow({ badge, steps }: { badge: string; steps: string[] }) {
  return (
    <div className="mt-5 space-y-3">
      <div className={`inline-flex ${faqBadge}`}>{badge}</div>
      <div className="rounded-xl border border-[#FF653F]/20 bg-[#fff5f2] px-4 py-5 dark:border-accent/25 dark:bg-accent/10">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-1 sm:gap-y-3">
          {steps.map((label, index) => (
            <div
              key={label}
              className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-2"
            >
              <span className="inline-flex min-h-10 w-full max-w-md items-center justify-center rounded-full border border-[#452E5A]/10 bg-white px-4 py-2 text-center text-sm font-semibold text-[#c53030] shadow-sm dark:border-white/10 dark:bg-[#150e2e] dark:text-accent sm:w-auto sm:max-w-none">
                {label}
              </span>
              {index < steps.length - 1 ? (
                <>
                  <ArrowDown
                    aria-hidden
                    className="size-4 shrink-0 text-[#ff653f] sm:hidden"
                  />
                  <ArrowRight
                    aria-hidden
                    className="hidden size-4 shrink-0 text-[#ff653f] sm:inline"
                  />
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Checklist({
  intro,
  items,
}: {
  intro?: string;
  items: string[];
}) {
  return (
    <div className="mt-4 space-y-3">
      {intro ? (
        <p className={`${faqBadge} text-center sm:text-left`}>{intro}</p>
      ) : null}
      <ul className="space-y-3">
        {items.map((text) => (
          <li key={text} className="flex gap-3 text-[#452E5A]/90 dark:text-white/85">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#ffe8e2] dark:bg-accent/20">
              <Check className="size-3.5 text-[#ff653f]" aria-hidden />
            </span>
            <span className="text-sm leading-relaxed sm:text-[15px]">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FaqsClient() {
  return (
    <Accordion type="single" collapsible className="mt-10 w-full space-y-4">
      <AccordionItem value="import" className={faqItem}>
        <AccordionTrigger className={faqTrigger}>
          How do I import a car from Japan?
        </AccordionTrigger>
        <AccordionContent className={faqContent}>
          <p className={faqBody}>
            Importing with ICC Trading follows a straightforward export workflow:
            you choose a vehicle, we confirm pricing and shipping, you complete
            payment, and we arrange documents and cargo booking. Clearing customs
            and registering the vehicle in your country is handled according to
            your local regulations—we will guide you on paperwork we provide.
          </p>
          <StepFlow
            badge="Typical import timeline"
            steps={[
              "Browse stock & auctions",
              "Inquire & reserve",
              "Invoice & payment",
              "Docs & vessel booking",
              "Shipment & updates",
            ]}
          />
          <p className="mt-5 text-sm text-[#452E5A]/75 dark:text-white/70">
            Visit{" "}
            <Link href="/help/how-to-buy" className={faqLink}>
              How to Buy
            </Link>{" "}
            for a fuller walkthrough of each stage.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="contact" className={faqItem}>
        <AccordionTrigger className={faqTrigger}>
          How can I contact you?
        </AccordionTrigger>
        <AccordionContent className={faqContent}>
          <p className={faqBody}>
            Reach us through whichever channel suits you best. Our team responds
            during business hours listed in the footer and can assist with quotes,
            vehicle checks, and shipping questions.
          </p>
          <ul className="mt-5 space-y-3 text-sm sm:text-[15px]">
            <li>
              <Link href="/contact/connect-with-us" className={faqLink}>
                Connect with us
              </Link>
              <span className="text-[#452E5A]/80 dark:text-white/75">
                {" "}
                — contact form and structured inquiries on our site.
              </span>
            </li>
            <li className="text-[#452E5A]/90 dark:text-white/85">
              <span className="font-medium text-[#1E104E] dark:text-white">
                WhatsApp:
              </span>{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={faqLink}
              >
                Message us on WhatsApp
              </a>
            </li>
            <li className="text-[#452E5A]/90 dark:text-white/85">
              <span className="font-medium text-[#1E104E] dark:text-white">
                Phone:
              </span>{" "}
              <a href={CONTACT_PHONE_TEL_URL} className={faqLink}>
                Call Japan office
              </a>
            </li>
            <li className="text-[#452E5A]/90 dark:text-white/85">
              <span className="font-medium text-[#1E104E] dark:text-white">
                Email:
              </span>{" "}
              <a href={CONTACT_EMAIL_MAILTO} className={faqLink}>
                Email ICC Trading
              </a>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="worldwide" className={faqItem}>
        <AccordionTrigger className={faqTrigger}>
          Can you ship worldwide?
        </AccordionTrigger>
        <AccordionContent className={faqContent}>
          <p className={faqBody}>
            Yes—we regularly export vehicles to many regions via RoRo and
            container services, subject to vessel schedules and destination port
            availability. Final feasibility depends on your country&apos;s import
            rules, restricted models, and documentation—we&apos;ll confirm options
            before you commit.
          </p>
          <p className={`mt-4 ${faqBody}`}>
            For methods, timelines, and responsibilities around freight, see{" "}
            <Link href="/help/shipping-information" className={faqLink}>
              Shipping information
            </Link>
            .
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="choose" className={faqItem}>
        <AccordionTrigger className={faqTrigger}>
          How do I choose the right car?
        </AccordionTrigger>
        <AccordionContent className={faqContent}>
          <p className={faqBody}>
            Start with how you will use the vehicle and what your budget looks
            after purchase, freight, duties, and local compliance. Match engine
            size, drivetrain, and features to road conditions and fuel availability
            in your market, then narrow down by mileage, grade, and inspection
            reports.
          </p>
          <Checklist
            intro="A practical shortlist"
            items={[
              "Define budget including shipping and estimated landed cost.",
              "Prioritize must-have specs (seats, transmission, fuel type, ground clearance).",
              "Compare auction grade / inspection notes vs. ready stock listings.",
              "Ask our team about spare parts and service support for that model in your region.",
              "Confirm age limits, emissions, and steering-side rules for your country before reserving.",
            ]}
          />
          <StepFlow
            badge="Decision flow"
            steps={[
              "Budget & duties",
              "Specs & condition",
              "Compare totals",
              "Verify local rules",
              "Reserve & invoice",
            ]}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
