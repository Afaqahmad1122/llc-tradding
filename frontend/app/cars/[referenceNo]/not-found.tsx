import Link from "next/link";

import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Button } from "@/components/ui/button";

export default function CarDetailNotFound() {
  return (
    <LandingPageShell mainClassName="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Listing not found
      </h1>
      <p className="text-muted-foreground mt-3 text-sm">
        This vehicle may have been sold or unpublished. Try the inventory page
        for current stock.
      </p>
      <Button asChild className="mt-8">
        <Link href="/cars">Back to cars</Link>
      </Button>
    </LandingPageShell>
  );
}
