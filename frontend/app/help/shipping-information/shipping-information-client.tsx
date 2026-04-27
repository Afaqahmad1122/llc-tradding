"use client";

import { useState } from "react";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useShippingRegionsQuery,
  useShippingSchedulesByRegionQuery,
} from "@/hooks/use-shipping-query";
import { cn } from "@/lib/utils";

export function ShippingInformationClient() {
  const [selectedRegionSlug, setSelectedRegionSlug] = useState<string | null>(null);
  const {
    data: regionsData,
    isLoading: isRegionsLoading,
    isError: isRegionsError,
    error: regionsError,
  } = useShippingRegionsQuery();

  const regions = regionsData?.data ?? [];
  const activeRegionSlug = selectedRegionSlug ?? regions[0]?.slug ?? null;

  const {
    data: schedulesData,
    isLoading: isSchedulesLoading,
    isError: isSchedulesError,
    error: schedulesError,
  } = useShippingSchedulesByRegionQuery(activeRegionSlug);

  const table = schedulesData?.table;

  return (
    <LandingPageShell mainClassName="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-[#452E5A]/15 bg-white/85 p-5 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-white/5 sm:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] dark:text-white sm:text-4xl">
          Shipping Information
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-[#452E5A]/85 dark:text-white/75 sm:text-base">
          View dynamic shipping schedules by destination region.
        </p>

        <div className="mt-6">
          {isRegionsLoading ? (
            <p className="text-sm text-[#452E5A]/80 dark:text-white/70">Loading shipping regions...</p>
          ) : null}
          {isRegionsError ? (
            <p className="text-sm text-[#b42318] dark:text-[#ff9b99]">
              {regionsError.message || "Unable to load shipping regions."}
            </p>
          ) : null}
        </div>

        {!isRegionsLoading && !isRegionsError && regions.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {regions.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegionSlug(region.slug)}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
                  activeRegionSlug === region.slug
                    ? "border-[#ef4444] bg-[#ef4444] text-white"
                    : "border-[#ef4444]/35 bg-white text-[#9f1239] hover:bg-[#fff1f2]",
                )}
              >
                {region.name}
              </button>
            ))}
          </div>
        ) : null}

        {!isRegionsLoading && !isRegionsError && regions.length === 0 ? (
          <p className="mt-5 rounded-xl border border-[#452E5A]/15 bg-white/80 px-4 py-4 text-sm text-[#452E5A]/80 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
            No shipping regions are available right now.
          </p>
        ) : null}

        {activeRegionSlug ? (
          <div className="mt-6">
            {isSchedulesLoading ? (
              <p className="text-sm text-[#452E5A]/80 dark:text-white/70">Loading schedules...</p>
            ) : null}
            {isSchedulesError ? (
              <p className="text-sm text-[#b42318] dark:text-[#ff9b99]">
                {schedulesError.message || "Unable to load shipping schedules."}
              </p>
            ) : null}

            {!isSchedulesLoading && !isSchedulesError && table ? (
              <div className="overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white/90 dark:border-white/10 dark:bg-white/5">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1f2937] hover:bg-[#1f2937]">
                      <TableHead className="text-white">Company</TableHead>
                      <TableHead className="text-white">Ship Name</TableHead>
                      <TableHead className="text-white">Voyage</TableHead>
                      {table.departurePorts.map((port) => (
                        <TableHead key={`dep-${port}`} className="text-white">
                          {port}
                        </TableHead>
                      ))}
                      {table.arrivalPorts.map((port) => (
                        <TableHead key={`arr-${port}`} className="text-white">
                          {port}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.company}</TableCell>
                        <TableCell>{row.shipName}</TableCell>
                        <TableCell>{row.voyage}</TableCell>
                        {table.departurePorts.map((port) => (
                          <TableCell key={`${row.id}-dep-${port}`}>
                            {row.departures[port] ?? "-"}
                          </TableCell>
                        ))}
                        {table.arrivalPorts.map((port) => (
                          <TableCell key={`${row.id}-arr-${port}`}>
                            {row.arrivals[port] ?? "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </LandingPageShell>
  );
}
