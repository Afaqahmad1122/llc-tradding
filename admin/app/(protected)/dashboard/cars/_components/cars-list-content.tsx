"use client";

import type { Dispatch } from "react";

import type { UseMutationResult } from "@tanstack/react-query";
import { CarFront, ChevronLeftIcon, ChevronRightIcon, Pencil, Trash2 } from "lucide-react";

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

import { formatErrorMessage, formatUsd } from "../_lib/draft-utils";
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
  onEdit: (car: AdminCar) => void;
  onUnpublishRequest: (car: AdminCar) => void;
  unpublishMutation: UseMutationResult<void, unknown, string>;
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
  onEdit,
  onUnpublishRequest,
  unpublishMutation,
}: CarsListContentProps) {
  const canPrev = list.page > 1;
  const canNext = totalPages > 0 && list.page < totalPages;

  return (
    <>
      <div className="relative min-h-[12rem]">
        {isError ? (
          <div className="p-10 text-center">
            <p className="text-destructive text-sm">
              {formatErrorMessage(error)}
            </p>
          </div>
        ) : isPending ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Spinner className="text-muted-foreground size-10" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-14">
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
                  Try widening search or resetting filters — or create your
                  first listing.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <ul className="divide-border/60 divide-y">
            {rows.map((car) => {
              const subtitle = car.title ?? car.referenceNo;
              return (
                <li key={car.id}>
                  <article className="hover:bg-muted/30 flex flex-col gap-6 p-5 transition-colors md:flex-row md:gap-10">
                    <CarCardThumb car={car} />
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="flex flex-wrap gap-2 md:justify-between md:gap-6">
                        <div className="min-w-0 space-y-1">
                          <h2 className="text-foreground text-lg font-semibold tracking-tight">
                            <span className="font-mono text-base tabular-nums">
                              {car.referenceNo}
                            </span>
                          </h2>
                          <p className="text-muted-foreground text-sm">
                            <span className="text-foreground font-medium">
                              {car.model.brand} {car.model.name}
                            </span>
                            · {subtitle}
                            {car.chassisNo ? (
                              <>
                                {" "}
                                · chassis{" "}
                                <span className="font-mono tabular-nums">
                                  {car.chassisNo}
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                        <PublishedBadge isPublished={car.isPublished} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <MetaItem label="Year">{car.year}</MetaItem>
                        <MetaItem label="USD">
                          {formatUsd(car.priceUsd)}
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
                      <div
                        className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:max-w-[min(100%,14rem)] sm:flex-col sm:items-stretch"
                        role="group"
                        aria-label={`Actions for ${car.referenceNo}`}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(car)}
                        >
                          <Pencil className="size-3.5 shrink-0" aria-hidden />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            unpublishMutation.isPending || !car.isPublished
                          }
                          className="text-destructive border-destructive/35 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onUnpublishRequest(car)}
                        >
                          <Trash2 className="size-3.5 shrink-0" aria-hidden />
                          Unpublish
                        </Button>
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
        <div className="border-border/60 bg-muted/20 flex flex-col gap-4 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
