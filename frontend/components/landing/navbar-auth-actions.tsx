"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/hooks/use-logout-mutation";
import { usePendingReviewEligibilityQuery } from "@/hooks/use-pending-review-eligibility-query";
import { useAuthStore } from "@/stores/auth-store";

export function NavbarAuthActions({ mobile = false }: { mobile?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const { data: eligibilityData, isSuccess: eligibilityLoaded } =
    usePendingReviewEligibilityQuery();
  const showWriteReview =
    Boolean(user?.id) &&
    eligibilityLoaded &&
    (eligibilityData?.data?.length ?? 0) > 0;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined);
    } catch {
      return;
    }
  };

  if (!user) {
    if (mobile) {
      return (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-10 flex-1 rounded-[4px] border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-sm font-semibold text-[#1E104E] shadow-sm transition-shadow hover:opacity-90 hover:shadow-md"
          >
            <Link href="/signup">Register</Link>
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 rounded-[4px] border-[#452E5A]/25 px-5 text-sm font-semibold text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="h-10 rounded-[4px] border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] px-5 text-sm font-semibold text-[#1E104E] shadow-sm transition-shadow hover:opacity-90 hover:shadow-md"
        >
          <Link href="/signup">Register</Link>
        </Button>
      </>
    );
  }

  if (mobile) {
    return (
      <div className="flex w-full flex-col gap-2">
        <Button asChild variant="outline" size="sm" className="justify-start">
          <Link href="/dashboard">My Account</Link>
        </Button>
        {showWriteReview ? (
          <Button asChild variant="outline" size="sm" className="justify-start">
            <Link href="/reviews/submit">Write a review</Link>
          </Button>
        ) : null}
        {user.role === "ADMIN" ? (
          <Button asChild variant="outline" size="sm" className="justify-start">
            <Link href="/admin/contact-messages">Admin Messages</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-10 rounded-[4px] border-[#452E5A]/25 px-5 text-sm font-semibold text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
      >
        <Link href="/dashboard">My Account</Link>
      </Button>
      {showWriteReview ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 rounded-[4px] border-[#452E5A]/25 px-5 text-sm font-semibold text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
        >
          <Link href="/reviews/submit">Write a review</Link>
        </Button>
      ) : null}
      {user.role === "ADMIN" ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 rounded-[4px] border-[#452E5A]/25 px-5 text-sm font-semibold text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
        >
          <Link href="/admin/contact-messages">Admin Messages</Link>
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 rounded-[4px] border-red-200 px-5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </Button>
    </>
  );
}
