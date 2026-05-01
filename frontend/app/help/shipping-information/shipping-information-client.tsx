"use client";

import { MoveHorizontal } from "lucide-react";
import { useState } from "react";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import {
  Table,
  TableBody,
  TableCaption,
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

/** Header uses shadcn `TableHead` default `text-foreground`; force readable light text on dark bg. */
const tableHeaderTextFix =
  "[&_thead_th]:!text-white [&_thead_th]:font-semibold [&_thead_th]:tracking-wide";

const headerGroupRow =
  "border-0 bg-[#1E104E] hover:bg-[#1E104E] text-white [&_th]:align-middle";
const headerColRow =
  "border-0 bg-[#252052] hover:bg-[#252052] text-white [&_th]:align-middle";

const headerStickyBase =
  "z-30 border-r border-white/20 bg-[#252052] shadow-[2px_0_12px_-4px_rgba(0,0,0,0.35)]";
const stickyCompany = cn(headerStickyBase, "sticky left-0 min-w-[8rem]");
const stickyShip = cn(headerStickyBase, "sticky left-[8rem] min-w-[10rem]");
const stickyVoyage = cn(headerStickyBase, "sticky left-[18rem] min-w-[5rem]");

function bodyStickyClasses(
  variant: "company" | "ship" | "voyage",
  rowIndex: number,
) {
  const isEven = rowIndex % 2 === 0;
  const rowBg = isEven
    ? "bg-white dark:bg-slate-950/35"
    : "bg-slate-50/95 dark:bg-slate-900/45";
  const base =
    "z-20 border-r border-slate-200/90 shadow-[2px_0_8px_-4px_rgba(15,23,42,0.06)] dark:border-white/10";
  const pos =
    variant === "company"
      ? "sticky left-0 min-w-[8rem]"
      : variant === "ship"
        ? "sticky left-[8rem] min-w-[10rem]"
        : "sticky left-[18rem] min-w-[5rem]";
  return cn(base, pos, rowBg);
}

function ScheduleCell({ value }: { value: string | undefined }) {
  const raw = value?.trim() ?? "";
  const isPlaceholder =
    raw === "" || raw === "-" || raw === "–" || raw === "—";

  if (isPlaceholder) {
    return (
      <span className="text-slate-400 tabular-nums dark:text-slate-500">—</span>
    );
  }
  return (
    <span className="text-slate-800 tabular-nums dark:text-slate-100">
      {raw}
    </span>
  );
}

export function ShippingInformationClient() {
  const [selectedRegionSlug, setSelectedRegionSlug] = useState<string | null>(
    null,
  );
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

  const depCount = table?.departurePorts.length ?? 0;
  const arrCount = table?.arrivalPorts.length ?? 0;

  return (
    <LandingPageShell mainClassName="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-[#452E5A]/12 bg-white/90 p-5 shadow-[0_12px_40px_-24px_rgba(30,16,78,0.55)] dark:border-white/10 dark:bg-slate-950/40 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] dark:text-white sm:text-4xl">
          Shipping Information
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#452E5A]/80 dark:text-white/75 sm:text-base">
          View dynamic shipping schedules by destination region—tabs match the
          regions you configure in admin.
        </p>

        <div className="mt-6">
          {isRegionsLoading ? (
            <p className="text-sm text-[#452E5A]/80 dark:text-white/70">
              Loading shipping regions...
            </p>
          ) : null}
          {isRegionsError ? (
            <p className="text-sm text-[#b42318] dark:text-[#ff9b99]">
              {regionsError.message || "Unable to load shipping regions."}
            </p>
          ) : null}
        </div>

        {!isRegionsLoading && !isRegionsError && regions.length > 0 ? (
          <div
            className="mt-6 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Shipping regions"
          >
            {regions.map((region) => (
              <button
                key={region.id}
                type="button"
                role="tab"
                aria-selected={activeRegionSlug === region.slug}
                onClick={() => setSelectedRegionSlug(region.slug)}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  activeRegionSlug === region.slug
                    ? "border-[#1E104E] bg-[#1E104E] text-white shadow-md shadow-[#1E104E]/25"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-[#1E104E]/35 hover:bg-slate-50 dark:border-white/15 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-800/60",
                )}
              >
                {region.name}
              </button>
            ))}
          </div>
        ) : null}

        {!isRegionsLoading && !isRegionsError && regions.length === 0 ? (
          <p className="mt-5 rounded-xl border border-[#452E5A]/12 bg-slate-50/80 px-4 py-4 text-sm text-[#452E5A]/80 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
            No shipping regions are available right now.
          </p>
        ) : null}

        {activeRegionSlug ? (
          <div className="mt-8 space-y-4">
            {isSchedulesLoading ? (
              <p className="text-sm text-[#452E5A]/80 dark:text-white/70">
                Loading schedules...
              </p>
            ) : null}
            {isSchedulesError ? (
              <p className="text-sm text-[#b42318] dark:text-[#ff9b99]">
                {schedulesError.message || "Unable to load shipping schedules."}
              </p>
            ) : null}

            {!isSchedulesLoading && !isSchedulesError && table ? (
              <>
                <div
                  className="flex gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 text-slate-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300"
                  aria-live="polite"
                >
                  <MoveHorizontal
                    className="mt-0.5 size-4 shrink-0 text-[#1E104E] opacity-80 dark:text-violet-300"
                    aria-hidden
                  />
                  <p className="text-xs leading-relaxed sm:text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      Wide tables:
                    </span>{" "}
                    scroll horizontally to see every departure and arrival port
                    column.
                  </p>
                </div>

                <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950/30">
                  <Table
                    className={cn(
                      "min-w-max text-xs tabular-nums sm:text-sm",
                      tableHeaderTextFix,
                      "[&_th]:px-3.5 [&_th]:py-3.5 [&_td]:px-3.5 [&_td]:py-3.5",
                      "[&_tbody_tr]:transition-colors",
                    )}
                  >
                    <TableCaption className="sr-only">
                      Shipping schedule
                      {schedulesData?.region?.name
                        ? ` for ${schedulesData.region.name}`
                        : ""}
                      : vessel rows with departure port dates, then arrival port
                      dates. Scroll horizontally when needed.
                    </TableCaption>
                    <TableHeader>
                      <TableRow className={headerGroupRow}>
                        <TableHead
                          colSpan={3}
                          scope="colgroup"
                          className="h-11 border-b border-white/15 text-center text-[10px] font-semibold uppercase tracking-wider sm:text-xs"
                        >
                          Vessel
                        </TableHead>
                        <TableHead
                          colSpan={depCount > 0 ? depCount : 1}
                          scope="colgroup"
                          className="h-11 border-b border-l border-white/15 text-center text-[10px] font-semibold uppercase tracking-wider sm:text-xs"
                        >
                          Departure ports
                        </TableHead>
                        <TableHead
                          colSpan={1}
                          scope="colgroup"
                          className="h-11 w-11 min-w-11 max-w-11 border-b border-l border-white/15 px-1 text-center text-sm"
                          aria-label="Then arrival ports"
                        >
                          →
                        </TableHead>
                        <TableHead
                          colSpan={arrCount > 0 ? arrCount : 1}
                          scope="colgroup"
                          className="h-11 border-b border-l border-white/15 text-center text-[10px] font-semibold uppercase tracking-wider sm:text-xs"
                        >
                          Arrival ports
                        </TableHead>
                      </TableRow>
                      <TableRow className={headerColRow}>
                        <TableHead scope="col" className={stickyCompany}>
                          Company
                        </TableHead>
                        <TableHead scope="col" className={stickyShip}>
                          Ship name
                        </TableHead>
                        <TableHead scope="col" className={stickyVoyage}>
                          Voyage
                        </TableHead>
                        {table.departurePorts.length > 0 ? (
                          table.departurePorts.map((port) => (
                            <TableHead
                              key={`dep-${port}`}
                              scope="col"
                              className="max-w-40 border-l border-white/15 text-left text-xs font-semibold normal-case tracking-normal sm:text-sm"
                            >
                              {port}
                            </TableHead>
                          ))
                        ) : (
                          <TableHead
                            scope="col"
                            className="border-l border-white/15 text-center text-xs font-normal text-white/90 italic"
                          >
                            No departure ports yet
                          </TableHead>
                        )}
                        <TableHead
                          scope="col"
                          className="w-11 min-w-11 max-w-11 border-l border-white/15 px-1 text-center"
                          aria-hidden
                        >
                          →
                        </TableHead>
                        {table.arrivalPorts.length > 0 ? (
                          table.arrivalPorts.map((port) => (
                            <TableHead
                              key={`arr-${port}`}
                              scope="col"
                              className="max-w-40 border-l border-white/15 text-left text-xs font-semibold normal-case tracking-normal sm:text-sm"
                            >
                              {port}
                            </TableHead>
                          ))
                        ) : (
                          <TableHead
                            scope="col"
                            className="border-l border-white/15 text-center text-xs font-normal text-white/90 italic"
                          >
                            No arrival ports yet
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.rows.length === 0 ? (
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell
                            colSpan={
                              3 +
                              (depCount > 0 ? depCount : 1) +
                              1 +
                              (arrCount > 0 ? arrCount : 1)
                            }
                            className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                          >
                            No sailing rows for this region yet. Add schedules
                            in the admin dashboard.
                          </TableCell>
                        </TableRow>
                      ) : (
                        table.rows.map((row, rowIndex) => (
                          <TableRow
                            key={row.id}
                            className={cn(
                              "border-slate-200/90 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-800/45",
                              rowIndex % 2 === 0
                                ? "bg-white dark:bg-slate-950/35"
                                : "bg-slate-50/95 dark:bg-slate-900/45",
                            )}
                          >
                            <TableCell
                              className={cn(
                                "font-semibold text-[#1E104E] dark:text-white",
                                bodyStickyClasses("company", rowIndex),
                              )}
                            >
                              {row.company}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-slate-800 dark:text-slate-100",
                                bodyStickyClasses("ship", rowIndex),
                              )}
                            >
                              {row.shipName}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "font-mono text-sm text-slate-800 dark:text-slate-100",
                                bodyStickyClasses("voyage", rowIndex),
                              )}
                            >
                              {row.voyage}
                            </TableCell>
                            {table.departurePorts.length > 0 ? (
                              table.departurePorts.map((port) => (
                                <TableCell
                                  key={`${row.id}-dep-${port}`}
                                  className="border-l border-slate-100 text-left dark:border-white/10"
                                >
                                  <ScheduleCell
                                    value={row.departures[port] ?? "-"}
                                  />
                                </TableCell>
                              ))
                            ) : (
                              <TableCell className="text-center text-xs italic text-slate-400 dark:text-slate-500">
                                —
                              </TableCell>
                            )}
                            <TableCell
                              className="w-11 min-w-11 max-w-11 border-l border-slate-100 bg-slate-50/80 px-1 text-center text-slate-400 dark:border-white/10 dark:bg-slate-900/30"
                              aria-hidden
                            >
                              →
                            </TableCell>
                            {table.arrivalPorts.length > 0 ? (
                              table.arrivalPorts.map((port) => (
                                <TableCell
                                  key={`${row.id}-arr-${port}`}
                                  className="border-l border-slate-100 text-left dark:border-white/10"
                                >
                                  <ScheduleCell
                                    value={row.arrivals[port] ?? "-"}
                                  />
                                </TableCell>
                              ))
                            ) : (
                              <TableCell className="border-l border-slate-100 text-center text-xs italic text-slate-400 dark:border-white/10 dark:text-slate-500">
                                —
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    </LandingPageShell>
  );
}
