"use client";

import type { Dispatch } from "react";

import type { UseMutationResult } from "@tanstack/react-query";
import { CarFront, ChevronLeftIcon, ChevronRightIcon, Pencil, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import type { AdminCar } from "@/lib/api/cars";

import {
  formatCurrency,
  formatErrorMessage,
  formatUsd,
} from "../_lib/draft-utils";
import type { ListAction, ListState } from "../_lib/list-state";
import { CarCardThumb } from "./car-card-thumb";
import { MetaItem } from "./meta-item";
import { PublishedBadge } from "./published-badge";

type CarsListContentProps = {
  list: ListState;
  dispatch: Dispatch<ListAction>;
  isError: boolean;
  error: unknown;
  isPending: boolean;
  isFetching: boolean;
  hasStaleData: boolean;
  rows: AdminCar[];
  totalPages: number;
  totalItems: number;
  onEdit: (car: AdminCar) => void;
  onDeleteRequest: (car: AdminCar) => void;
  deleteMutation: UseMutationResult<void, unknown, string>;
};

export function CarsListContent({
  list,
  dispatch,
  isError,
  error,
  isPending,
  isFetching,
  hasStaleData,
  rows,
  totalPages,
  totalItems,
  onEdit,
  onDeleteRequest,
  deleteMutation,
}: CarsListContentProps) {
  const canPrev = list.page > 1;
  const canNext = totalPages > 0 && list.page < totalPages;

  const rangeFrom =
    rows.length > 0 ? (list.page - 1) * list.pageSize + 1 : 0;
  const rangeTo =
    rows.length > 0 ? rangeFrom + rows.length - 1 : 0;
  const rangeLabel =
    totalItems > 0 && rows.length > 0
      ? `Showing ${rangeFrom.toLocaleString()}–${rangeTo.toLocaleString()} of ${totalItems.toLocaleString()}`
      : null;

  return (
    <>
      <div className="relative min-h-56">
        {isError ? (
          <div className="p-6 sm:p-8">
            <Alert variant="destructive">
              <AlertTitle>Could not load inventory</AlertTitle>
              <AlertDescription>{formatErrorMessage(error)}</AlertDescription>
            </Alert>
          </div>
        ) : isPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Spinner className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">Loading listings…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-14 sm:px-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CarFront
                    className="text-muted-foreground size-12"
                    aria-hidden
                  />
                </EmptyMedia>
                <EmptyTitle>No cars match</EmptyTitle>
                <EmptyDescription>
                  Adjust search or filters, or add a new listing to get
                  started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <ul className="space-y-3 p-4 sm:p-5">
            {rows.map((car) => {
              const subtitle = car.title ?? car.referenceNo;
              return (
                <li key={car.id}>
                  <article className="border-border/70 bg-background hover:border-border hover:bg-muted/25 flex flex-col gap-5 rounded-xl border p-4 shadow-sm transition-[border-color,box-shadow,background-color] md:flex-row md:gap-8 md:p-5">
                    <CarCardThumb car={car} />
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 space-y-1.5">
                          <h2 className="text-foreground text-lg font-semibold tracking-tight">
                            <span className="font-mono text-base tabular-nums">
                              {car.referenceNo}
                            </span>
                          </h2>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            <span className="text-foreground font-medium">
                              {car.model.brand} {car.model.name}
                            </span>
                            <span className="text-border mx-1.5">·</span>
                            {subtitle}
                            {car.chassisNo ? (
                              <>
                                <span className="text-border mx-1.5">·</span>
                                <span className="text-muted-foreground">
                                  Chassis{" "}
                                  <span className="font-mono tabular-nums text-foreground">
                                    {car.chassisNo}
                                  </span>
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                        <div
                          className="flex flex-wrap items-center gap-2 sm:justify-end"
                          role="group"
                          aria-label={`Actions for ${car.referenceNo}`}
                        >
                          <PublishedBadge isPublished={car.isPublished} />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shadow-xs"
                            onClick={() => onEdit(car)}
                          >
                            <Pencil className="size-3.5 shrink-0" aria-hidden />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={deleteMutation.isPending}
                            className="text-destructive border-destructive/35 hover:bg-destructive/10 hover:text-destructive shadow-xs"
                            onClick={() => onDeleteRequest(car)}
                          >
                            <Trash2 className="size-3.5 shrink-0" aria-hidden />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                        <MetaItem label="Year">{car.year}</MetaItem>
                        <MetaItem label="Price (USD)">
                          {formatUsd(car.priceUsd)}
                        </MetaItem>
                        <MetaItem label="Price (PKR)">
                          {formatCurrency(car.pricePkr, "PKR")}
                        </MetaItem>
                        <MetaItem label="Price (JPY)">
                          {formatCurrency(car.priceJpy, "JPY")}
                        </MetaItem>
                        <MetaItem label="Mileage">
                          {car.mileage != null
                            ? `${car.mileage.toLocaleString()} ${car.mileageUnit}`
                            : "—"}
                        </MetaItem>
                        <MetaItem label="Listed">
                          {car.createdAt
                            ? new Date(car.createdAt).toLocaleDateString()
                            : "—"}
                        </MetaItem>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
        {isFetching && hasStaleData ? (
          <div className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-16 sm:pt-20">
            <Spinner className="text-muted-foreground size-6" />
          </div>
        ) : null}
      </div>

      {totalPages > 0 ? (
        <div className="border-border/70 bg-muted/20 flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="text-muted-foreground flex flex-col gap-0.5 text-center text-sm sm:text-left">
            {rangeLabel ? (
              <p className="text-foreground font-medium">{rangeLabel}</p>
            ) : null}
            <p>
              Page{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {list.page}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {totalPages}
              </span>
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-0 flex-1 sm:flex-initial"
              disabled={!canPrev || isFetching}
              onClick={() =>
                dispatch({
                  type: "SET_PAGE",
                  payload: Math.max(1, list.page - 1),
                })
              }
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-0 flex-1 sm:flex-initial"
              disabled={!canNext || isFetching}
              onClick={() =>
                dispatch({ type: "SET_PAGE", payload: list.page + 1 })}
            >
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
