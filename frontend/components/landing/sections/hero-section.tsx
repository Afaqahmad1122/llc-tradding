import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FilterItem } from "@/components/landing/home-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
            language: bold gradients, high contrast cards, and fast scanning for
            buyers.
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
            className="brand-glass overflow-hidden border-white/50 shadow-xl dark:border-white/10"
          >
            <CardHeader>
              <CardDescription className="text-[#452E5A]/90 dark:text-white/70">
                {stat.label}
              </CardDescription>
              <CardTitle className="text-2xl text-[#1E104E] sm:text-3xl dark:text-white">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
