"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMyLedgerDeals } from "@/lib/api/ledger";
import { useAuthStore } from "@/stores/auth-store";

export const myLedgerDealsQueryKey = ["ledger", "me"] as const;

export function useMyLedgerDealsQuery() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: myLedgerDealsQueryKey,
    queryFn: fetchMyLedgerDeals,
    enabled: user?.role === "USER",
  });
}
