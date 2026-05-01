"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { fetchAdminReviews } from "@/lib/api/reviews";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["admin-reviews", page, pageSize],
    queryFn: () => fetchAdminReviews({ page, pageSize }),
    placeholderData: keepPreviousData,
  });

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground text-sm">
          All reviews including unpublished. Paginated from the admin API.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-xs ring-1 ring-foreground/10 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {pagination != null ? (
              <>
                Showing{" "}
                <span className="text-foreground font-medium">
                  {pagination.total === 0
                    ? 0
                    : (pagination.page - 1) * pagination.pageSize + 1}
                  –
                  {Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.total,
                  )}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium">
                  {pagination.total}
                </span>
              </>
            ) : (
              " "
            )}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">
              Per page
            </span>
            <NativeSelect
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(
                  Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number],
                );
                setPage(1);
              }}
              className="w-18"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <NativeSelectOption key={n} value={String(n)}>
                  {n}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        </div>

        {isError ? (
          <p className="text-destructive text-sm" role="alert">
            {error instanceof ApiError
              ? error.message
              : "Failed to load reviews."}
          </p>
        ) : null}

        <div className="relative min-h-[200px]">
          {isPending && !data ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="size-6" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="min-w-48">Comment</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground text-center py-10"
                    >
                      No reviews yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(row.createdAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.user.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {row.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{row.rating}</TableCell>
                      <TableCell className="max-w-40 truncate">
                        {row.title ?? "—"}
                      </TableCell>
                      <TableCell
                        className="max-w-[16rem] truncate"
                        title={row.comment}
                      >
                        {row.comment}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.invoiceReference}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={row.isPublished ? "default" : "outline"}
                        >
                          {row.isPublished ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {isFetching ? (
            <div
              className="bg-background/60 pointer-events-none absolute inset-0 flex items-start justify-end pt-2 pr-2"
              aria-hidden
            >
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : null}
        </div>

        {totalPages > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Page <span className="text-foreground font-medium">{page}</span>{" "}
              of{" "}
              <span className="text-foreground font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
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
    </>
  );
}
