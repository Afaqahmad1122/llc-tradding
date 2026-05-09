"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { usePendingReviewEligibilityQuery } from "@/hooks/use-pending-review-eligibility-query";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type WriteReviewLinkProps = {
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

export function WriteReviewLink({
  className,
  variant = "outline",
  size,
}: WriteReviewLinkProps) {
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);
  const user = useAuthStore((state) => state.user);
  const { data, isSuccess } = usePendingReviewEligibilityQuery();

  if (!hasBootstrapped || !user) {
    return null;
  }

  if (!isSuccess || !data?.data?.length) {
    return null;
  }

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(
        "shrink-0 border-[#452E5A]/25 bg-white/80 dark:border-white/15 dark:bg-white/5",
        className,
      )}
    >
      <Link href="/reviews/submit">Write a review</Link>
    </Button>
  );
}
