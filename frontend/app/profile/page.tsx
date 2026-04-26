"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    if (!user) {
      router.replace("/login");
    }
  }, [hasBootstrapped, router, user]);

  if (!hasBootstrapped || !user) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0c0720] dark:via-[#120932] dark:to-[#1a0e3d]">
      <SiteNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center px-4 py-14 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl border-[#452E5A]/15 bg-white/90 dark:bg-[#150e2e]/85">
          <CardHeader>
            <CardTitle className="text-3xl">My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm sm:text-base">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone ?? "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{user.country ?? "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">City</p>
                <p className="font-medium">{user.city ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
