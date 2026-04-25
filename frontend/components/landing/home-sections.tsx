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
    <div className="border-b bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 text-center text-xs sm:px-6 lg:px-8">
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
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
      <div className="space-y-6">
        <Badge variant="outline" className="rounded-full px-3 py-1">
          The Cars Exporting Expert
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Japanese used cars for global buyers, with transparent pricing.
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Search quality vehicles from Japan and get fast quotation support for
          import, shipping, and documentation.
        </p>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge key={filter.label} variant="secondary" className="h-7 px-3">
              {filter.label}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="#inventory">
              Browse Inventory
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#contact">Get a Quote</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stat.value}</CardTitle>
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <p className="max-w-3xl text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function CategoryGrid({ items }: { items: CategoryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.name}>
          <CardHeader>
            <CardTitle className="text-base">{item.name}</CardTitle>
            <CardDescription>Available listings</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{item.count}</CardContent>
        </Card>
      ))}
    </div>
  );
}

export function VehicleGrid({ vehicles }: { vehicles: VehicleItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.reference} className="border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">
                {vehicle.make} {vehicle.model}
              </CardTitle>
              {vehicle.highlight ? (
                <Badge variant="outline">{vehicle.highlight}</Badge>
              ) : null}
            </div>
            <CardDescription>
              {vehicle.year} • {vehicle.engine}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">{vehicle.price}</p>
            <p className="text-sm text-muted-foreground">Ref #{vehicle.reference}</p>
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button size="sm">Request Quote</Button>
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
    <div className="grid gap-2 rounded-xl border bg-muted/40 p-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 text-primary" />
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
        <Card key={item.name}>
          <CardHeader>
            <CardTitle className="text-base">{item.name}</CardTitle>
            <CardDescription>
              {item.country} • {item.rating}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
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
      <div className="rounded-2xl border bg-primary p-6 text-primary-foreground sm:p-8">
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
            <Button asChild variant="secondary">
              <Link href="https://wa.me/818011724000">
                <MessageCircle className="size-4" />
                WhatsApp
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-primary-foreground/30">
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
