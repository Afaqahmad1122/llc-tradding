"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer } from "react";

import { PublicCarListCard } from "@/components/cars/public-car-list-card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import { formatUsd } from "@/lib/car-display";
import { fetchCarsMeta, fetchPublicCars } from "@/lib/api/cars";

const PAGE_SIZE = 12;

function parseQueryInt(s: string | null): number | undefined {
  if (s == null || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

type ListState = {
  page: number;
  searchInput: string;
  debouncedSearch: string;
  brand: string;
  bodyType: string;
  priceMin: number | undefined;
  priceMax: number | undefined;
  modelId: string;
  modelCode: string;
  steering: string;
  yearMin: number | undefined;
  yearMax: number | undefined;
  fuel: string;
  transmission: string;
  sort: "latest" | "oldest" | "priceAsc" | "priceDesc";
};

type UrlSyncPayload = {
  search: string;
  brand: string;
  bodyType: string;
  priceMin: number | undefined;
  priceMax: number | undefined;
  modelId: string;
  modelCode: string;
  steering: string;
  yearMin: number | undefined;
  yearMax: number | undefined;
  fuel: string;
  transmission: string;
};

type ListAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "DEBOUNCE_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_BRAND"; payload: string }
  | { type: "SET_BODY_TYPE"; payload: string }
  | {
      type: "SET_SORT";
      payload: "latest" | "oldest" | "priceAsc" | "priceDesc";
    }
  | { type: "SYNC_FROM_URL"; payload: UrlSyncPayload };

const initialState: ListState = {
  page: 1,
  searchInput: "",
  debouncedSearch: "",
  brand: "",
  bodyType: "",
  priceMin: undefined,
  priceMax: undefined,
  modelId: "",
  modelCode: "",
  steering: "",
  yearMin: undefined,
  yearMax: undefined,
  fuel: "",
  transmission: "",
  sort: "latest",
};

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchInput: action.payload };
    case "DEBOUNCE_SEARCH":
      if (state.debouncedSearch === action.payload) return state;
      return { ...state, debouncedSearch: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_BRAND":
      return {
        ...state,
        brand: action.payload,
        modelId: "",
        page: 1,
      };
    case "SET_BODY_TYPE":
      return { ...state, bodyType: action.payload, page: 1 };
    case "SET_SORT":
      return { ...state, sort: action.payload, page: 1 };
    case "SYNC_FROM_URL": {
      const p = action.payload;
      const search = p.search.trim();
      return {
        ...state,
        brand: p.brand,
        bodyType: p.bodyType,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        searchInput: search,
        debouncedSearch: search,
        modelId: p.modelId,
        modelCode: p.modelCode,
        steering: p.steering,
        yearMin: p.yearMin,
        yearMax: p.yearMax,
        fuel: p.fuel,
        transmission: p.transmission,
        page: 1,
      };
    }
    default:
      return state;
  }
}

function trimOrEmpty(s: string | null): string {
  return typeof s === "string" ? s.trim() : "";
}

export function PublicCarsInventory({
  initialBrand = "",
  initialBodyType = "",
  initialSearch = "",
  initialPriceMin,
  initialPriceMax,
  initialModelId = "",
  initialModelCode = "",
  initialSteering = "",
  initialYearMin,
  initialYearMax,
  initialFuel = "",
  initialTransmission = "",
}: {
  initialBrand?: string;
  initialBodyType?: string;
  initialSearch?: string;
  initialPriceMin?: number;
  initialPriceMax?: number;
  initialModelId?: string;
  initialModelCode?: string;
  initialSteering?: string;
  initialYearMin?: number;
  initialYearMax?: number;
  initialFuel?: string;
  initialTransmission?: string;
}) {
  const searchParams = useSearchParams();

  const searchInitial = initialSearch.trim();

  const [list, dispatch] = useReducer(listReducer, {
    ...initialState,
    brand: initialBrand,
    bodyType: initialBodyType,
    priceMin: initialPriceMin,
    priceMax: initialPriceMax,
    searchInput: searchInitial,
    debouncedSearch: searchInitial,
    modelId: initialModelId,
    modelCode: initialModelCode,
    steering: initialSteering,
    yearMin: initialYearMin,
    yearMax: initialYearMax,
    fuel: initialFuel,
    transmission: initialTransmission,
  });

  useEffect(() => {
    const brand =
      trimOrEmpty(searchParams.get("brand")) ||
      trimOrEmpty(searchParams.get("make"));
    const bodyType = trimOrEmpty(searchParams.get("bodyType"));
    const priceMin = parseQueryInt(searchParams.get("priceMin"));
    const priceMax = parseQueryInt(searchParams.get("priceMax"));
    const search = trimOrEmpty(searchParams.get("search"));
    const modelId = trimOrEmpty(searchParams.get("modelId"));
    const modelCode = trimOrEmpty(searchParams.get("modelCode"));
    const steering = trimOrEmpty(searchParams.get("steering"));
    const yearMin = parseQueryInt(searchParams.get("yearMin"));
    const yearMax = parseQueryInt(searchParams.get("yearMax"));
    const fuel = trimOrEmpty(searchParams.get("fuel"));
    const transmission = trimOrEmpty(searchParams.get("transmission"));
    dispatch({
      type: "SYNC_FROM_URL",
      payload: {
        search,
        brand,
        bodyType,
        priceMin,
        priceMax,
        modelId,
        modelCode,
        steering,
        yearMin,
        yearMax,
        fuel,
        transmission,
      },
    });
  }, [searchParams]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      dispatch({ type: "DEBOUNCE_SEARCH", payload: list.searchInput.trim() });
    }, 360);
    return () => window.clearTimeout(t);
  }, [list.searchInput]);

  const metaQuery = useQuery({
    queryKey: ["public-cars-meta"],
    queryFn: () => fetchCarsMeta(),
    staleTime: 5 * 60_000,
  });

  const carsQuery = useQuery({
    queryKey: [
      "public-cars",
      list.page,
      list.debouncedSearch,
      list.brand,
      list.bodyType,
      list.priceMin,
      list.priceMax,
      list.modelId,
      list.modelCode,
      list.steering,
      list.yearMin,
      list.yearMax,
      list.fuel,
      list.transmission,
      list.sort,
    ],
    queryFn: () =>
      fetchPublicCars({
        page: list.page,
        pageSize: PAGE_SIZE,
        ...(list.debouncedSearch ? { search: list.debouncedSearch } : {}),
        ...(list.brand ? { brand: list.brand } : {}),
        ...(list.bodyType ? { bodyType: list.bodyType } : {}),
        ...(list.priceMin != null ? { priceMin: list.priceMin } : {}),
        ...(list.priceMax != null ? { priceMax: list.priceMax } : {}),
        ...(list.modelId ? { modelId: list.modelId } : {}),
        ...(list.modelCode.trim()
          ? { modelCode: list.modelCode.trim() }
          : {}),
        ...(list.steering ? { steering: list.steering } : {}),
        ...(list.yearMin != null ? { yearMin: list.yearMin } : {}),
        ...(list.yearMax != null ? { yearMax: list.yearMax } : {}),
        ...(list.fuel ? { fuel: list.fuel } : {}),
        ...(list.transmission ? { transmission: list.transmission } : {}),
        ...(list.sort !== "latest" ? { sort: list.sort } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const mergedError = carsQuery.error ?? metaQuery.error;
  const errorBanner =
    mergedError instanceof ApiError
      ? mergedError.message
      : mergedError instanceof Error
        ? mergedError.message
        : null;

  const rows = carsQuery.data?.data ?? [];
  const totalPages = carsQuery.data?.pagination.totalPages ?? 0;
  const totalVehicles = carsQuery.data?.pagination.total;

  const brands = metaQuery.data?.brands ?? [];
  const bodyTypes = useMemo(() => {
    const set = new Set<string>();
    for (const m of metaQuery.data?.models ?? []) {
      const bt = m.bodyType?.trim();
      if (bt) set.add(bt);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [metaQuery.data?.models]);

  const isLoading =
    (carsQuery.isPending && rows.length === 0) ||
    metaQuery.isPending ||
    metaQuery.isLoading;

  const hasFilters =
    Boolean(list.debouncedSearch) ||
    Boolean(list.brand) ||
    Boolean(list.bodyType) ||
    list.priceMin != null ||
    list.priceMax != null ||
    Boolean(list.modelId) ||
    Boolean(list.modelCode.trim()) ||
    Boolean(list.steering) ||
    list.yearMin != null ||
    list.yearMax != null ||
    Boolean(list.fuel) ||
    Boolean(list.transmission);

  const priceFilterLabel =
    list.priceMin != null && list.priceMax != null
      ? `${formatUsd(String(list.priceMin))} – ${formatUsd(String(list.priceMax))}`
      : null;

  return (
    <div className="space-y-10">
      {errorBanner ? (
        <div
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/15"
          role="alert"
        >
          {errorBanner}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/90 p-5 shadow-inner backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-end dark:bg-card/80">
        <div className="min-w-[14rem] flex-1 space-y-2">
          <label
            htmlFor="inventory-search"
            className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            Search
          </label>
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-75" />
            <Input
              id="inventory-search"
              className="pl-9"
              placeholder="Brand, reference, chassis…"
              value={list.searchInput}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH", payload: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex min-w-[10rem] flex-1 flex-col gap-2 sm:max-w-[14rem]">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
            Brand
          </span>
          <NativeSelect
            className="w-full min-w-0"
            aria-label="Filter by brand"
            value={list.brand}
            onChange={(e) =>
              dispatch({ type: "SET_BRAND", payload: e.target.value })
            }
          >
            <NativeSelectOption value="">All brands</NativeSelectOption>
            {brands.map((b) => (
              <NativeSelectOption key={b} value={b}>
                {b}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex min-w-[10rem] flex-1 flex-col gap-2 sm:max-w-[14rem]">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
            Body type
          </span>
          <NativeSelect
            className="w-full min-w-0"
            aria-label="Filter by body type"
            value={list.bodyType}
            onChange={(e) =>
              dispatch({ type: "SET_BODY_TYPE", payload: e.target.value })
            }
          >
            <NativeSelectOption value="">All body types</NativeSelectOption>
            {bodyTypes.map((bt) => (
              <NativeSelectOption key={bt} value={bt}>
                {bt}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex min-w-[10rem] flex-1 flex-col gap-2 sm:max-w-[14rem]">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
            Sort
          </span>
          <NativeSelect
            className="w-full min-w-0"
            aria-label="Sort inventory"
            value={list.sort}
            onChange={(e) =>
              dispatch({
                type: "SET_SORT",
                payload: e.target.value as ListState["sort"],
              })
            }
          >
            <NativeSelectOption value="latest">
              Latest arrivals
            </NativeSelectOption>
            <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
            <NativeSelectOption value="priceAsc">
              Price: low → high
            </NativeSelectOption>
            <NativeSelectOption value="priceDesc">
              Price: high → low
            </NativeSelectOption>
          </NativeSelect>
        </div>
        {hasFilters ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
              Active filters
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {priceFilterLabel ? (
                <span className="text-muted-foreground text-xs tabular-nums">
                  {priceFilterLabel}
                </span>
              ) : null}
              <Link
                href="/cars"
                className="text-primary text-sm font-semibold underline underline-offset-2"
              >
                Clear filters
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative min-h-[12rem]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Spinner className="text-primary size-10" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/90 py-14 dark:bg-card/80">
            <Empty>
              <EmptyTitle>
                {hasFilters ? "No matching vehicles" : "No vehicles listed yet"}
              </EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try widening your filters or clear them to see all stock."
                  : "Check back soon — new export-ready listings appear here once they are published in admin."}
              </EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="space-y-6">
            {totalVehicles != null ? (
              <div className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                  Stock list
                </h2>
                <p className="text-muted-foreground text-sm tabular-nums">
                  {totalVehicles.toLocaleString()} vehicles
                </p>
              </div>
            ) : null}
            <ul className="flex flex-col gap-6">
              {rows.map((car) => (
                <li key={car.id}>
                  <PublicCarListCard car={car} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {carsQuery.isFetching && rows.length > 0 ? (
          <div className="bg-background/65 pointer-events-none absolute inset-0 flex items-start justify-center pt-20 backdrop-blur-[1px]">
            <Spinner className="text-primary size-8" />
          </div>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-center text-sm sm:text-left">
            Page{" "}
            <span className="text-foreground font-semibold tabular-nums">
              {list.page}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-semibold tabular-nums">
              {totalPages}
            </span>
          </p>
          <div className="flex justify-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={list.page <= 1 || carsQuery.isFetching}
              onClick={() =>
                dispatch({
                  type: "SET_PAGE",
                  payload: Math.max(1, list.page - 1),
                })
              }
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={list.page >= totalPages || carsQuery.isFetching}
              onClick={() =>
                dispatch({ type: "SET_PAGE", payload: list.page + 1 })
              }
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
