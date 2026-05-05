import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export type SidebarFilterLink = {
  label: string;
  href: string;
};

function LeftSidebar({
  makeLinks,
  priceLinks,
  bodyTypeLinks,
}: {
  makeLinks: SidebarFilterLink[];
  priceLinks: SidebarFilterLink[];
  bodyTypeLinks: SidebarFilterLink[];
}) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <div className="overflow-hidden rounded-sm border border-[#D0D0D0] bg-[#F3F3F3] dark:border-white/10 dark:bg-[#150e2e]">
          <div className="bg-linear-to-r from-[#FF653F] to-[#FFC85C] px-3 py-2 text-sm font-bold text-[#1E104E]">
            Shop By Make
          </div>
          <div className="max-h-[420px] space-y-0.5 overflow-auto p-2">
            {makeLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm font-semibold text-[#4A4A4A] transition-colors hover:bg-white dark:text-white/80 dark:hover:bg-white/10"
              >
                <span>{item.label.toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-sm border border-[#D0D0D0] bg-[#F3F3F3] dark:border-white/10 dark:bg-[#150e2e]">
          <div className="bg-linear-to-r from-[#FF653F] to-[#FFC85C] px-3 py-2 text-sm font-bold text-[#1E104E]">
            Shop by Price
          </div>
          <div className="max-h-[360px] space-y-0.5 overflow-auto p-2">
            {priceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm font-semibold text-[#4A4A4A] transition-colors hover:bg-white dark:text-white/80 dark:hover:bg-white/10"
              >
                <span className="inline-flex size-5 items-center justify-center rounded-full border border-[#888] text-[10px] font-bold dark:border-white/30">
                  $
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-sm border border-[#D0D0D0] bg-[#F3F3F3] dark:border-white/10 dark:bg-[#150e2e]">
          <div className="bg-linear-to-r from-[#FF653F] to-[#FFC85C] px-3 py-2 text-sm font-bold text-[#1E104E]">
            Shop By Body Type
          </div>
          <div className="space-y-0.5 p-2">
            {bodyTypeLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm font-semibold text-[#5A5A5A] transition-colors hover:bg-white dark:text-white/80 dark:hover:bg-white/10"
              >
                {item.label.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function RightSidebar({
  filters,
}: {
  filters: string[];
}) {
  const countries = [
    "Ghana",
    "Zimbabwe",
    "Mauritius",
    "Botswana",
    "Namibia",
    "Lesotho",
    "South Sudan",
    "Rwanda",
    "Thailand",
    "Malaysia",
  ];

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <div className="rounded-2xl border border-[#452E5A]/15 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#150e2e]">
          <div className="space-y-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className="flex w-full items-center justify-between rounded-lg border border-[#452E5A]/15 bg-white px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                {filter}
                <ChevronDown className="size-4" />
              </button>
            ))}
          </div>
          <Button className="mt-3 w-full border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90">
            Search
          </Button>
        </div>

        <div className="rounded-2xl border border-[#452E5A]/15 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#150e2e]">
          <p className="mb-2 text-sm font-semibold text-[#1E104E] dark:text-white">
            Top Markets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {countries.map((country) => (
              <button
                key={country}
                className="rounded-md border border-[#452E5A]/12 bg-[#F8F5FF] px-2 py-2 text-xs font-semibold text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MarketplaceWithSidebars({
  children,
  makeLinks,
  priceLinks,
  filters,
  bodyTypeLinks,
}: {
  children: React.ReactNode;
  makeLinks: SidebarFilterLink[];
  priceLinks: SidebarFilterLink[];
  filters: string[];
  bodyTypeLinks: SidebarFilterLink[];
}) {
  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 pb-4 sm:px-6 lg:px-8">
      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_240px]">
        <LeftSidebar
          makeLinks={makeLinks}
          priceLinks={priceLinks}
          bodyTypeLinks={bodyTypeLinks}
        />

        <div className="min-w-0">
          <div className="mb-5 rounded-3xl border border-[#452E5A]/12 bg-white/85 p-5 shadow-[0_12px_38px_-20px_rgba(30,16,78,0.55)] sm:p-6 dark:border-white/10 dark:bg-[#150e2e]/80">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#452E5A]/15 bg-white p-2 pl-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="truncate text-sm text-[#452E5A]/70 dark:text-white/60">
                Search by keywords or reference #
              </span>
              <button className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] shadow-sm">
                <Search className="size-4" />
              </button>
            </div>
            <h2 className="text-center font-heading text-3xl font-semibold text-[#1E104E] dark:text-white">
              Used Cars Japan - Buy Direct from Auctions
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-center text-[#452E5A]/80 dark:text-white/65">
              Browse thousands of quality Japanese used cars for worldwide
              export. Toyota, Honda, Nissan, Mazda and more at best auction
              prices.
            </p>
          </div>
          {children}
        </div>

        <RightSidebar filters={filters} />
      </div>
    </section>
  );
}
