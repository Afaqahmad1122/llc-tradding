import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Mail } from "lucide-react";

import {
  CategoryItem,
  FilterItem,
  TestimonialItem,
  VehicleItem,
} from "@/components/landing/home-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NoticeBar({ text }: { text: string }) {
  return (
    <div className="brand-gradient-main border-b border-white/10 text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 text-center text-xs font-medium sm:px-6 lg:px-8">
        {text}
      </div>
    </div>
  );
}

export function HeroSection({
  filters,
  stats,
}: {
  filters: FilterItem[];
  stats: { label: string; value: string }[];
}) {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/25 brand-gradient-main p-7 text-white shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -right-12 -top-8 h-40 w-40 rounded-full bg-[#FF653F]/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-8 h-40 w-40 rounded-full bg-[#FFC85C]/40 blur-2xl" />
        <div className="relative space-y-6">
          <Badge className="rounded-full border-white/35 bg-white/10 px-3 py-1 text-white">
          The Cars Exporting Expert
        </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            Japanese used cars with
            <span className="brand-text-gradient ml-2">premium clarity</span>
          </h1>
          <p className="max-w-2xl text-base text-white/80 sm:text-lg">
            Same export-focused business model, but with a cleaner design
            language: bold gradients, high contrast cards, and fast scanning for buyers.
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Badge
                key={filter.label}
                className="h-7 rounded-full border-white/30 bg-white/10 px-3 text-white"
              >
                {filter.label}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] shadow-lg hover:opacity-90"
            >
              <Link href="#inventory">
                Explore Inventory
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/45 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="#contact">Get a Quote</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="grid gap-3 self-end">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="brand-glass overflow-hidden border-white/50 shadow-xl"
          >
            <CardHeader>
              <CardDescription className="text-[#452E5A]/90">{stat.label}</CardDescription>
              <CardTitle className="text-2xl text-[#1E104E] sm:text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function SectionBlock({
  title,
  description,
  id,
  children,
}: {
  title: string;
  description: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[#1E104E] sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-3xl text-[#452E5A]/85">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function CategoryGrid({ items }: { items: CategoryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.name}
          className="border-[#452E5A]/15 bg-white/95 shadow-[0_10px_35px_-18px_rgba(30,16,78,0.4)]"
        >
          <CardHeader>
            <CardTitle className="text-base text-[#1E104E]">{item.name}</CardTitle>
            <CardDescription className="text-[#452E5A]/75">
              Available listings
            </CardDescription>
          </CardHeader>
          <CardContent className="brand-text-gradient text-2xl font-semibold">
            {item.count}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function VehicleGrid({ vehicles }: { vehicles: VehicleItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.reference}
          className="overflow-hidden border-[#452E5A]/15 bg-white/95 shadow-[0_12px_40px_-24px_rgba(30,16,78,0.7)] transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="h-1.5 w-full brand-gradient-warm" />
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base text-[#1E104E]">
                {vehicle.make} {vehicle.model}
              </CardTitle>
              {vehicle.highlight ? (
                <Badge className="border-0 bg-[#452E5A]/10 text-[#452E5A]">
                  {vehicle.highlight}
                </Badge>
              ) : null}
            </div>
            <CardDescription className="text-[#452E5A]/75">
              {vehicle.year} • {vehicle.engine}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold text-[#1E104E]">{vehicle.price}</p>
            <p className="text-sm text-[#452E5A]/70">Ref #{vehicle.reference}</p>
          </CardContent>
          <CardFooter className="justify-between gap-2 border-t border-[#452E5A]/10 bg-[#F8F5FF]/70">
            <Button
              variant="outline"
              size="sm"
              className="border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8"
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
            >
              Request Quote
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function TrustFeatures() {
  const items = [
    "Verified export documentation and inspection",
    "Dedicated advisor for each order",
    "Fast WhatsApp and email support",
    "Transparent timeline from payment to shipment",
  ];

  return (
    <div className="grid gap-2 rounded-2xl border border-[#452E5A]/15 bg-white/80 p-5 shadow-[0_12px_32px_-18px_rgba(30,16,78,0.45)] sm:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm text-[#452E5A]">
          <CheckCircle2 className="mt-0.5 size-4 text-[#FF653F]" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export function TestimonialGrid({ items }: { items: TestimonialItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card
          key={item.name}
          className="border-[#452E5A]/15 bg-white/95 shadow-[0_12px_40px_-24px_rgba(30,16,78,0.7)]"
        >
          <CardHeader>
            <CardTitle className="text-base text-[#1E104E]">{item.name}</CardTitle>
            <CardDescription className="text-[#452E5A]/75">
              {item.country} • {item.rating}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-[#452E5A]/90">
            &quot;{item.quote}&quot;
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ContactCta() {
  return (
    <section id="contact" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
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
