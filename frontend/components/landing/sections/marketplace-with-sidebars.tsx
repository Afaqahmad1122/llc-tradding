"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildCarsInventoryUrl } from "@/lib/inventory-search-url";

export type SidebarFilterLink = {
  label: string;
  href: string;
};

export type RightSidebarMeta = {
  brands: string[];
  models: Array<{ id: string; name: string; brand: string }>;
  yearRange: { min: number | null; max: number | null };
};

// ---------------------------------------------------------------------------
// Left Sidebar
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Styled select wrapper — matches the current button/chevron design exactly
// ---------------------------------------------------------------------------

function FilterSelect({
  value,
  onChange,
  placeholder,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full cursor-pointer appearance-none rounded-lg border border-[#452E5A]/15 bg-white py-2 pl-3 pr-8 text-sm font-medium text-[#452E5A] outline-none transition-colors hover:bg-[#452E5A]/5 focus-visible:ring-2 focus-visible:ring-[#452E5A]/25 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#452E5A]/50 dark:text-white/40"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right Sidebar — fully interactive filter widget
// ---------------------------------------------------------------------------

const TOP_MARKETS = [
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
] as const;

const STEERING_OPTIONS = [
  { value: "RHD", label: "Right Hand Drive (RHD)" },
  { value: "LHD", label: "Left Hand Drive (LHD)" },
  { value: "OTHER", label: "Other" },
] as const;

function RightSidebar({ meta }: { meta: RightSidebarMeta }) {
  const router = useRouter();

  const [make, setMake] = useState("");
  const [modelId, setModelId] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [steering, setSteering] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  // Models are filtered client-side when a make is selected
  const availableModels = useMemo(() => {
    if (!make) return meta.models;
    return meta.models.filter(
      (m) => m.brand.toLowerCase() === make.toLowerCase(),
    );
  }, [make, meta.models]);

  // Build descending year list from meta yearRange
  const years = useMemo(() => {
    const min = meta.yearRange.min ?? 1990;
    const max = meta.yearRange.max ?? new Date().getFullYear();
    const result: number[] = [];
    for (let y = max; y >= min; y--) result.push(y);
    return result;
  }, [meta.yearRange]);

  const handleMakeChange = useCallback((value: string) => {
    setMake(value);
    setModelId(""); // reset dependent model when make changes
  }, []);

  const handleSearch = useCallback(() => {
    const url = buildCarsInventoryUrl({
      brand: make || undefined,
      modelId: modelId || undefined,
      modelCode: modelCode.trim() || undefined,
      steering: steering || undefined,
      yearMin: yearFrom ? Number(yearFrom) : undefined,
      yearMax: yearTo ? Number(yearTo) : undefined,
    });
    router.push(url);
  }, [make, modelId, modelCode, steering, yearFrom, yearTo, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        {/* Filter panel */}
        <div className="rounded-2xl border border-[#452E5A]/15 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#150e2e]">
          <div className="space-y-2">
            {/* Make */}
            <FilterSelect
              value={make}
              onChange={handleMakeChange}
              placeholder="Make"
            >
              {meta.brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </FilterSelect>

            {/* Model — options narrow once a make is chosen */}
            <FilterSelect
              value={modelId}
              onChange={setModelId}
              placeholder="Model"
              disabled={availableModels.length === 0}
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </FilterSelect>

            {/* Model Code — free-text; model codes are per-unit strings */}
            <div className="relative">
              <input
                type="text"
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Model Code"
                className="w-full rounded-lg border border-[#452E5A]/15 bg-white py-2 pl-3 pr-3 text-sm font-medium text-[#452E5A] outline-none transition-colors placeholder:font-medium placeholder:text-[#452E5A]/40 focus-visible:ring-2 focus-visible:ring-[#452E5A]/25 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/35"
              />
            </div>

            {/* Steering */}
            <FilterSelect
              value={steering}
              onChange={setSteering}
              placeholder="Steering"
            >
              {STEERING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>

            {/* Year From */}
            <FilterSelect
              value={yearFrom}
              onChange={setYearFrom}
              placeholder="Year From"
            >
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </FilterSelect>

            {/* Year To */}
            <FilterSelect
              value={yearTo}
              onChange={setYearTo}
              placeholder="Year To"
            >
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </FilterSelect>
          </div>

          <Button
            onClick={handleSearch}
            className="mt-3 w-full border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
          >
            <Search className="mr-1.5 size-4" />
            Search
          </Button>
        </div>

        {/* Top Markets */}
        <div className="rounded-2xl border border-[#452E5A]/15 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#150e2e]">
          <p className="mb-2 text-sm font-semibold text-[#1E104E] dark:text-white">
            Top Markets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TOP_MARKETS.map((country) => (
              <Link
                key={country}
                href={`/cars?search=${encodeURIComponent(country)}`}
                className="rounded-md border border-[#452E5A]/12 bg-[#F8F5FF] px-2 py-2 text-center text-xs font-semibold text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                {country}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Layout shell
// ---------------------------------------------------------------------------

export function MarketplaceWithSidebars({
  children,
  makeLinks,
  priceLinks,
  bodyTypeLinks,
  sidebarMeta,
}: {
  children: React.ReactNode;
  makeLinks: SidebarFilterLink[];
  priceLinks: SidebarFilterLink[];
  bodyTypeLinks: SidebarFilterLink[];
  sidebarMeta: RightSidebarMeta;
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

        <RightSidebar meta={sidebarMeta} />
      </div>
    </section>
  );
}
