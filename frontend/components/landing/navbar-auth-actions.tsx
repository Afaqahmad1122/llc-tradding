"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/hooks/use-logout-mutation";
import { useAuthStore } from "@/stores/auth-store";

export function NavbarAuthActions({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/");
      router.refresh();
    } catch {
      return;
    }
  };

  if (!user) {
    if (mobile) {
      return (
        <>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
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
          className="border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
        >
          <Link href="/signup">Register</Link>
        </Button>
      </>
    );
  }

  if (mobile) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
        >
          {user.name}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex-1 border-0 bg-linear-to-r from-[#1E104E] to-[#452E5A] text-white hover:opacity-90"
        >
          {logoutMutation.isPending ? "..." : "Logout"}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
      >
        {user.name}
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="border-0 bg-linear-to-r from-[#1E104E] to-[#452E5A] text-white hover:opacity-90"
      >
        {logoutMutation.isPending ? "..." : "Logout"}
      </Button>
    </>
  );
}
