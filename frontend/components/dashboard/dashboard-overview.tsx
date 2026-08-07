"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ImageIcon, MapPin } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  eventIcons,
  mapLedgerDealsToDashboardOrders,
  orderStatusStyles,
  statIcons,
  type DashboardOrder,
} from "@/components/dashboard/user-dashboard-data";
import { useMyLedgerDealsQuery } from "@/hooks/use-my-ledger-deals-query";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const ledgerQuery = useMyLedgerDealsQuery();
  const orders = useMemo(
    () => mapLedgerDealsToDashboardOrders(ledgerQuery.data?.data ?? []),
    [ledgerQuery.data?.data],
  );
  const activeOrder = orders.find((order) => order.isActive) ?? orders[0] ?? null;
  const stats = useMemo(() => buildStats(orders, activeOrder), [orders, activeOrder]);

  if (ledgerQuery.isLoading) {
    return <DashboardOverviewState message="Loading your dashboard..." />;
  }

  if (ledgerQuery.isError) {
    return <DashboardOverviewState message={ledgerQuery.error.message || "Unable to load dashboard."} />;
  }

  if (!activeOrder) {
    return (
      <Empty className="rounded-[8px] border border-[#452E5A]/12 bg-white py-14 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
        <EmptyTitle>No active orders yet</EmptyTitle>
        <EmptyDescription>
          Once admin links a car order to your account, it will appear here.
        </EmptyDescription>
        <Button asChild className="h-10 rounded-[6px] bg-[#FF653F] text-white hover:bg-[#e85634]">
          <Link href="/cars">Browse cars</Link>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-h-[116px] rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#7a6798] dark:text-white/50">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#1E104E] dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <span className="grid size-9 place-items-center rounded-[6px] bg-[#f4efff] text-[#452E5A] dark:bg-white/10 dark:text-white">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-sm text-[#6a5a84] dark:text-white/60">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-[8px] border border-[#452E5A]/12 bg-white shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="px-4 pt-4 sm:px-5 sm:pt-5">
              <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
                Active order
              </h2>
              <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
                Latest car order and shipping progress.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 mr-4 h-9 rounded-[6px] sm:mr-5">
              <Link href="/dashboard/orders">
                View orders
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-0 p-4 sm:p-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] border border-[#452E5A]/10 bg-[#f6f2fb] md:aspect-[5/4]">
              {activeOrder.image ? (
                <img
                  src={activeOrder.image}
                  alt={activeOrder.carName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#7a6798]">
                  <ImageIcon className="size-8" />
                </div>
              )}
            </div>
            <div className="mt-4 min-w-0 space-y-4 md:mt-0">
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-[8px] bg-[#fbf9ff] p-4 dark:bg-white/5">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#7a6798] dark:text-white/50">
                    {activeOrder.orderNumber}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-[#1E104E] dark:text-white">
                    {activeOrder.carName}
                  </h3>
                  <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
                    Reference {activeOrder.referenceNo}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("h-6 rounded-full border px-2.5", orderStatusStyles[activeOrder.status])}
                >
                  {activeOrder.status}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryBox label="Amount" value={activeOrder.totalAmount} />
                <SummaryBox label="Payment" value={activeOrder.paymentStatus} />
                <SummaryBox label="ETA" value={activeOrder.eta} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1E104E] dark:text-white">Progress</span>
                  <span className="text-[#6a5a84] dark:text-white/60">{activeOrder.progress}%</span>
                </div>
                <Progress value={activeOrder.progress} className="h-2 bg-[#eee8f7] [&>div]:bg-[#FF653F]" />
              </div>

              <div className="grid gap-2 text-sm text-[#6a5a84] dark:text-white/60 sm:grid-cols-2">
                <p className="flex items-center gap-2 rounded-[6px] bg-[#fbf9ff] px-3 py-2 dark:bg-white/5">
                  <MapPin className="size-4 text-[#FF653F]" />
                  {activeOrder.portFrom}
                </p>
                <p className="flex items-center gap-2 rounded-[6px] bg-[#fbf9ff] px-3 py-2 dark:bg-white/5">
                  <CalendarDays className="size-4 text-[#FF653F]" />
                  {activeOrder.portTo}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
                Shipment timeline
              </h2>
              <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
                Current movement status.
              </p>
            </div>
            <Button asChild variant="outline" className="h-9 rounded-[6px]">
              <Link href="/dashboard/shipments">
                Details
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            {activeOrder.timeline.slice(0, 4).map((event) => {
              const Icon = eventIcons[event.state];

              return (
                <div key={`${event.title}-${event.date}`} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid size-8 place-items-center rounded-full border",
                      event.state === "complete" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                      event.state === "current" && "border-[#FF653F]/30 bg-[#fff0eb] text-[#FF653F]",
                      event.state === "upcoming" && "border-[#452E5A]/15 bg-[#f4efff] text-[#6a5a84]",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-[#1E104E] dark:text-white">{event.title}</p>
                      <p className="text-xs text-[#7a6798] dark:text-white/50">{event.date}</p>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-[#6a5a84] dark:text-white/60">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardOverviewState({ message }: { message: string }) {
  return (
    <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-8 text-center text-sm text-[#6a5a84] shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
      <span className="inline-flex items-center gap-2">
        <Spinner className="size-4" />
        {message}
      </span>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-[#452E5A]/10 p-3 dark:border-white/10">
      <p className="text-xs text-[#7a6798] dark:text-white/50">{label}</p>
      <p className="mt-1 font-semibold text-[#1E104E] dark:text-white">{value}</p>
    </div>
  );
}

function buildStats(orders: DashboardOrder[], activeOrder: DashboardOrder | null) {
  const activeOrders = orders.filter((order) => order.isActive);
  const inTransitCount = orders.filter((order) => order.isInTransit).length;
  const docsReady = orders.reduce((sum, order) => sum + order.documentsReady, 0);

  return [
    {
      label: "Active orders",
      value: String(activeOrders.length),
      detail: `${inTransitCount} currently in transit`,
      icon: statIcons.activeOrders,
    },
    {
      label: "Shipment ETA",
      value: activeOrder?.eta ?? "Awaiting",
      detail: activeOrder ? `${activeOrder.portFrom} to ${activeOrder.portTo}` : "No active shipment",
      icon: statIcons.eta,
    },
    {
      label: "Documents ready",
      value: String(docsReady),
      detail: "Customer-visible files uploaded by admin",
      icon: statIcons.documents,
    },
    {
      label: "Next action",
      value: activeOrder?.remainingBalanceAmount ? "Balance" : "Track",
      detail: activeOrder ? `${activeOrder.balance} remaining on active order` : "No action needed",
      icon: statIcons.nextAction,
    },
  ];
}
