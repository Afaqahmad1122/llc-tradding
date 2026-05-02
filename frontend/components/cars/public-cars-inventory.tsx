"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CarFront, ChevronLeft, ChevronRight, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useReducer } from "react";

import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import {
  fetchCarsMeta,
  fetchPublicCars,
  type PublicCar,
} from "@/lib/api/cars";

const PAGE_SIZE = 12;

type ListState = {
  page: number;
  searchInput: string;
  debouncedSearch: string;
  brand: string;
  sort: "latest" | "oldest" | "priceAsc" | "priceDesc";
};

type ListAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "DEBOUNCE_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_BRAND"; payload: string }
  | {
      type: "SET_SORT";
      payload: "latest" | "oldest" | "priceAsc" | "priceDesc";
    };

const initialState: ListState = {
  page: 1,
  searchInput: "",
  debouncedSearch: "",
  brand: "",
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
      return { ...state, brand: action.payload, page: 1 };
    case "SET_SORT":
      return { ...state, sort: action.payload, page: 1 };
    default:
      return state;
  }
}

function formatUsd(price: string | null): string {
  const n = price == null ? NaN : Number(price);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function inventoryTitle(car: PublicCar): string {
  return car.title?.trim()
    ? car.title.trim()
    : `${car.model.brand} ${car.model.name}`;
}

export function PublicCarsInventory() {
  const [list, dispatch] = useReducer(listReducer, initialState);

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
      list.sort,
    ],
    queryFn: () =>
      fetchPublicCars({
        page: list.page,
        pageSize: PAGE_SIZE,
        ...(list.debouncedSearch ? { search: list.debouncedSearch } : {}),
        ...(list.brand ? { brand: list.brand } : {}),
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

  const brands = metaQuery.data?.brands ?? [];
  const isLoading =
    (carsQuery.isPending && rows.length === 0) ||
    metaQuery.isPending ||
    metaQuery.isLoading;

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
      </div>

      <div className="relative min-h-[12rem]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Spinner className="text-primary size-10" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/90 py-14 dark:bg-card/80">
            <Empty>
              <EmptyTitle>No vehicles listed yet</EmptyTitle>
              <EmptyDescription>
                Check back soon — new export-ready listings appear here once
                they are published in admin.
              </EmptyDescription>
            </Empty>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((car) => {
              const src =
                car.images.find((i) => i.isPrimary)?.url ??
                car.images[0]?.url ??
                null;
              return (
                <li key={car.id}>
                  <article className="group text-card-foreground flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-foreground/5 ring-1 ring-border/50 transition hover:border-primary/30 hover:shadow-xl hover:shadow-foreground/10 dark:shadow-black/35 dark:ring-border/80 dark:hover:border-primary/40 dark:hover:shadow-black/45">
                    <div className="bg-muted relative aspect-[16/11] overflow-hidden border-b border-border">
                      {src ? (
                        <Image
                          src={src}
                          alt={car.referenceNo}
                          fill
                          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.02]"
                          unoptimized
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
                          <CarFront className="size-12" aria-hidden />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            No photo yet
                          </span>
                        </div>
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur-sm">
                        {car.referenceNo}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 px-5 py-5">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-foreground">
                          {inventoryTitle(car)}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {car.model.brand} {car.model.name} ·{" "}
                          <span className="tabular-nums">{car.year}</span>
                          {car.mileage != null ? (
                            <>
                              {" "}
                              · {car.mileage.toLocaleString()}{" "}
                              {car.mileageUnit}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <p className="mt-auto text-xl font-semibold tabular-nums text-foreground">
                        {formatUsd(car.priceUsd)}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
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
