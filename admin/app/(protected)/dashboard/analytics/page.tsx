"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  AdminDataPageHeader,
  AdminDataPanel,
} from "@/components/layout/admin-data-page";

import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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

  function updateDays(value: (typeof DAYS_OPTIONS)[number]) {
    setDays(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-12 pt-8 sm:px-7 sm:pt-10">
      <AdminDataPageHeader
        icon={BarChart3}
        title="Car Engagement"
        description={
          <>
            Which listings buyers are actually viewing and reaching out about —
            detail page views, WhatsApp clicks, and email clicks.
          </>
        }
      />

      <AdminDataPanel
        controls={
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
        }
        emptyDescription="No car views or clicks were recorded in this time range."
        emptyIcon={BarChart3}
        emptyTitle="No activity yet"
        error={error}
        errorMessage={formatErrorMessage}
        errorTitle="Could not load engagement stats"
        isEmpty={rows.length === 0}
        isError={isError}
        isFetching={isFetching}
        isPending={isPending}
        loadingLabel="Loading engagement stats…"
        table={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4 sm:pl-5">Vehicle</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="pr-4 text-right sm:pr-5">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <EngagementRow key={row.carId} row={row} />
              ))}
            </TableBody>
          </Table>
        }
        pagination={{
          isFetching,
          onPageChange: setPage,
          page,
          rowsShown: rows.length,
          totalItems,
          totalPages,
        }}
      />
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
