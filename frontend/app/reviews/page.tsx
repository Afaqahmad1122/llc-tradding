"use client";

import { noticeText } from "@/components/landing/home-data";
import { NoticeBar } from "@/components/landing/sections/notice-bar";
import { TestimonialGrid } from "@/components/landing/sections/testimonial-grid";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { getPublicReviews } from "@/lib/api/reviews";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const queryKey = useMemo(
    () => ["public-reviews-page", { page, pageSize: PAGE_SIZE, sort: "latest" }],
    [page],
  );

  const { data, isLoading, isError, error, isFetching } = useApiQuery({
    queryKey,
    queryFn: () => getPublicReviews({ page, pageSize: PAGE_SIZE, sort: "latest" }),
  });

  const reviews = data?.data ?? [];
  const pagination = data?.pagination;
  const hasPrevious = page > 1;
  const hasNext = pagination ? page < pagination.totalPages : false;

  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0c0720] dark:via-[#120932] dark:to-[#1a0e3d]">
      <NoticeBar text={noticeText} />
      <SiteNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#452E5A]/15 bg-white/85 p-8 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-white/5">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] dark:text-white sm:text-4xl">
            Reviews
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[#452E5A]/85 dark:text-white/75 sm:text-lg">
            Public feedback from buyers who completed their purchase process.
          </p>

          <div className="mt-6">
            {isLoading ? (
              <p className="text-sm text-[#452E5A]/80 dark:text-white/70">Loading reviews...</p>
            ) : null}

            {isError ? (
              <p className="text-sm text-[#b42318] dark:text-[#ff9b99]">
                {error.message || "Failed to load reviews"}
              </p>
            ) : null}

            {!isLoading && !isError && reviews.length === 0 ? (
              <p className="rounded-2xl border border-[#452E5A]/15 bg-white/80 px-4 py-5 text-sm text-[#452E5A]/80 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
                No public reviews available yet.
              </p>
            ) : null}

            {!isLoading && !isError && reviews.length > 0 ? (
              <>
                <TestimonialGrid items={reviews} />
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[#452E5A]/80 dark:text-white/70">
                    Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1}
                    {isFetching ? " • Updating..." : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={!hasPrevious || isFetching}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={!hasNext || isFetching}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
