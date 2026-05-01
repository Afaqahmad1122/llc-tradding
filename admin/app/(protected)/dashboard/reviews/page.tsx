"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Star,
  StarIcon,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import { fetchAdminReviews } from "@/lib/api/reviews";
import type { AdminReview } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function reviewerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-px"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5 shrink-0 sm:size-4",
            i < rating
              ? "fill-amber-500 text-amber-500"
              : "fill-transparent text-muted-foreground/30",
          )}
          aria-hidden
        />
      ))}
      <span className="text-muted-foreground ml-1.5 text-xs font-medium tabular-nums">
        {rating}/5
      </span>
    </div>
  );
}

function ReviewCard({ review }: { review: AdminReview }) {
  const created = new Date(review.createdAt);

  return (
    <article className="min-w-0 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <Avatar className="ring-border hidden sm:flex ring-2" size="default">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
            {reviewerInitials(review.user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <Avatar className="ring-border shrink-0 ring-2 sm:hidden" size="sm">
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-medium">
                  {reviewerInitials(review.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-semibold tracking-tight">
                  {review.user.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {review.user.email}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              <Badge variant={review.isPublished ? "default" : "outline"}>
                {review.isPublished ? "Published" : "Hidden"}
              </Badge>
              <time
                className="text-muted-foreground text-xs tabular-nums"
                dateTime={review.createdAt}
              >
                {format(created, "MMM d, yyyy · HH:mm")}
              </time>
            </div>
          </div>

          <RatingStars rating={review.rating} />

          {review.title ? (
            <h2 className="text-foreground text-sm font-medium leading-snug">
              {review.title}
            </h2>
          ) : null}

          <p className="text-foreground/90 text-sm leading-relaxed wrap-break-word text-pretty">
            {review.comment}
          </p>

          <dl className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <div className="flex min-w-0 max-w-full items-baseline gap-1.5">
              <dt className="shrink-0 font-medium text-foreground/70">
                Invoice
              </dt>
              <dd className="font-mono break-all">{review.invoiceReference}</dd>
            </div>
            {review.country ? (
              <div className="flex min-w-0 max-w-full items-baseline gap-1.5">
                <dt className="shrink-0 font-medium text-foreground/70">
                  Country
                </dt>
                <dd className="wrap-break-word">{review.country}</dd>
              </div>
            ) : null}
            {review.carId ? (
              <div className="flex min-w-0 max-w-full items-baseline gap-1.5">
                <dt className="shrink-0 font-medium text-foreground/70">
                  Car
                </dt>
                <dd className="font-mono break-all text-[11px] sm:text-xs">
                  {review.carId}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </article>
  );
}

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
    <div className="flex min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground text-sm">
          Customer reviews, including items not visible on the site.
        </p>
      </div>

      <div className="bg-card text-card-foreground flex min-w-0 flex-col overflow-hidden rounded-lg border shadow-xs ring-1 ring-foreground/10">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:p-6">
          <p className="text-muted-foreground text-sm">
            {pagination != null ? (
              <>
                <span className="text-foreground font-medium tabular-nums">
                  {pagination.total === 0
                    ? 0
                    : (pagination.page - 1) * pagination.pageSize + 1}
                  –{Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </span>
                <span className="text-muted-foreground"> of </span>
                <span className="text-foreground font-medium tabular-nums">
                  {pagination.total}
                </span>
                <span className="text-muted-foreground"> reviews</span>
              </>
            ) : (
              "\u00a0"
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

        <Separator />

        {isError ? (
          <div className="p-4 sm:p-6">
            <Alert variant="destructive" role="alert">
              <AlertTitle>Could not load reviews</AlertTitle>
              <AlertDescription>
                {error instanceof ApiError
                  ? error.message
                  : "Something went wrong. Try again."}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="relative min-h-48 min-w-0">
          {isPending && !data ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="size-6" />
            </div>
          ) : data?.data.length === 0 ? (
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <StarIcon />
                </EmptyMedia>
                <EmptyTitle>No reviews yet</EmptyTitle>
                <EmptyDescription>
                  When customers submit reviews, they will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-border/80 bg-muted/25 divide-y">
              {data?.data.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {isFetching && data ? (
            <div
              className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-16 sm:pt-20"
              aria-busy
              aria-label="Loading"
            >
              <Spinner className="text-muted-foreground size-6" />
            </div>
          ) : null}
        </div>

        {totalPages > 0 ? (
          <>
            <Separator />
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-muted-foreground text-center text-sm sm:text-left">
                Page{" "}
                <span className="text-foreground font-medium tabular-nums">
                  {page}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium tabular-nums">
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
          </>
        ) : null}
      </div>
    </div>
  );
}
