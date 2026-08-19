"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";

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

type AdminDataPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
};

type AdminDataPanelProps = {
  controls?: ReactNode;
  error: unknown;
  errorMessage: (error: unknown) => string;
  errorTitle: string;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  isEmpty: boolean;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  loadingLabel: string;
  pagination: AdminPaginationFooterProps;
  table: ReactNode;
};

type AdminPaginationFooterProps = {
  isFetching: boolean;
  onPageChange: (updater: (page: number) => number) => void;
  page: number;
  rowsShown: number;
  totalItems: number;
  totalPages: number;
};

export function AdminDataPageHeader({
  icon: Icon,
  title,
  description,
}: AdminDataPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <div
          className="bg-primary/12 text-primary ring-primary/15 flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1"
          aria-hidden
        >
          <Icon className="size-6" />
        </div>
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground max-w-xl text-pretty text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}

export function AdminDataPanel({
  controls,
  emptyDescription,
  emptyIcon: EmptyIcon,
  emptyTitle,
  error,
  errorMessage,
  errorTitle,
  isEmpty,
  isError,
  isFetching,
  isPending,
  loadingLabel,
  pagination,
  table,
}: AdminDataPanelProps) {
  return (
    <div className="bg-card min-w-0 overflow-hidden rounded-2xl border shadow-sm ring-1 ring-border/60">
      {controls ? (
        <div className="bg-muted/25">
          <div className="flex flex-col gap-4 p-4 sm:p-5">{controls}</div>
        </div>
      ) : null}

      <div className="relative min-h-56">
        {isError ? (
          <div className="p-6 sm:p-8">
            <Alert variant="destructive">
              <AlertTitle>{errorTitle}</AlertTitle>
              <AlertDescription>{errorMessage(error)}</AlertDescription>
            </Alert>
          </div>
        ) : isPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Spinner className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">{loadingLabel}</p>
          </div>
        ) : isEmpty ? (
          <div className="px-4 py-14 sm:px-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <EmptyIcon
                    className="text-muted-foreground size-12"
                    aria-hidden
                  />
                </EmptyMedia>
                <EmptyTitle>{emptyTitle}</EmptyTitle>
                <EmptyDescription>{emptyDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          table
        )}
        {isFetching && !isPending ? (
          <div className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-16 sm:pt-20">
            <Spinner className="text-muted-foreground size-6" />
          </div>
        ) : null}
      </div>

      <AdminPaginationFooter {...pagination} />
    </div>
  );
}

export function AdminPaginationFooter({
  isFetching,
  onPageChange,
  page,
  rowsShown,
  totalItems,
  totalPages,
}: AdminPaginationFooterProps) {
  if (totalPages <= 0) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="border-border/70 bg-muted/20 flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      <div className="text-muted-foreground flex flex-col gap-0.5 text-center text-sm sm:text-left">
        <p>
          Showing <span className="text-foreground font-medium">{rowsShown}</span>{" "}
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
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
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
          onClick={() => onPageChange((p) => p + 1)}
        >
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
