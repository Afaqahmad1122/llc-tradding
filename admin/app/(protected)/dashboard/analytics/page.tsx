"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BarChart3, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { PermissionGuard } from "@/components/auth/permission-guard";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import {
  fetchCarEngagementStats,
  type CarEngagementRow,
} from "@/lib/api/analytics";

const PAGE_SIZE = 15;
const DAYS_OPTIONS = [7, 30, 90] as const;

function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Try again.";
}

function AnalyticsPageContent() {
  const [page, setPage] = useState(1);
  const [days, setDays] = useState<(typeof DAYS_OPTIONS)[number]>(30);

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["admin-car-engagement", page, days],
    queryFn: () => fetchCarEngagementStats({ page, pageSize: PAGE_SIZE, days }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalItems = data?.pagination.total ?? 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  function updateDays(value: (typeof DAYS_OPTIONS)[number]) {
    setDays(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-12 pt-8 sm:px-7 sm:pt-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div
            className="bg-primary/12 text-primary ring-primary/15 flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1"
            aria-hidden
          >
            <BarChart3 className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Car Engagement
            </h1>
            <p className="text-muted-foreground max-w-xl text-pretty text-sm leading-relaxed">
              Which listings buyers are actually viewing and reaching out
              about — detail page views, WhatsApp clicks, and email clicks.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm ring-1 ring-border/60">
        <div className="bg-muted/25">
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-48">
              <Label
                htmlFor="analytics-days"
                className="text-muted-foreground text-xs font-medium"
              >
                Time range
              </Label>
              <NativeSelect
                id="analytics-days"
                value={String(days)}
                onChange={(e) =>
                  updateDays(
                    Number.parseInt(
                      e.target.value,
                      10,
                    ) as (typeof DAYS_OPTIONS)[number],
                  )
                }
                className="bg-background min-w-0 border-border/80"
              >
                {DAYS_OPTIONS.map((n) => (
                  <NativeSelectOption key={n} value={String(n)}>
                    Last {n} days
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        <div className="relative min-h-56">
          {isError ? (
            <div className="p-6 sm:p-8">
              <Alert variant="destructive">
                <AlertTitle>Could not load engagement stats</AlertTitle>
                <AlertDescription>
                  {formatErrorMessage(error)}
                </AlertDescription>
              </Alert>
            </div>
          ) : isPending ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Spinner className="text-muted-foreground size-10" />
              <p className="text-muted-foreground text-sm">
                Loading engagement stats…
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-14 sm:px-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BarChart3
                      className="text-muted-foreground size-12"
                      aria-hidden
                    />
                  </EmptyMedia>
                  <EmptyTitle>No activity yet</EmptyTitle>
                  <EmptyDescription>
                    No car views or clicks were recorded in this time range.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Vehicle</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="pr-4 text-right sm:pr-5">
                    CTR
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <EngagementRow key={row.carId} row={row} />
                ))}
              </TableBody>
            </Table>
          )}
          {isFetching && data ? (
            <div className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-16 sm:pt-20">
              <Spinner className="text-muted-foreground size-6" />
            </div>
          ) : null}
        </div>

        {totalPages > 0 ? (
          <div className="border-border/70 bg-muted/20 flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div className="text-muted-foreground flex flex-col gap-0.5 text-center text-sm sm:text-left">
              <p>
                Showing{" "}
                <span className="text-foreground font-medium">
                  {rows.length}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium">
                  {totalItems.toLocaleString()}
                </span>
              </p>
              <p>
                Page{" "}
                <span className="text-foreground font-semibold tabular-nums">
                  {page}
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EngagementRow({ row }: { row: CarEngagementRow }) {
  return (
    <TableRow>
      <TableCell className="max-w-[220px] pl-4 whitespace-normal sm:pl-5">
        <span className="font-mono text-sm font-medium">
          {row.referenceNo}
        </span>
        <p className="text-muted-foreground mt-0.5 truncate text-xs">
          {row.model}
          {row.title ? ` · ${row.title}` : ""}
        </p>
      </TableCell>
      <TableCell className="text-right tabular-nums">{row.views}</TableCell>
      <TableCell className="text-right tabular-nums">{row.clicks}</TableCell>
      <TableCell className="pr-4 text-right tabular-nums sm:pr-5">
        {(row.clickThroughRate * 100).toFixed(0)}%
      </TableCell>
    </TableRow>
  );
}

export default function AnalyticsPage() {
  return (
    <PermissionGuard permissionKey="carsRead">
      <AnalyticsPageContent />
    </PermissionGuard>
  );
}
