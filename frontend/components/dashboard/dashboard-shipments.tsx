"use client";

import { CalendarClock, MapPin, Navigation, Ship } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import {
  eventIcons,
  mapLedgerDealsToDashboardOrders,
  orderStatusStyles,
  type DashboardOrder,
} from "@/components/dashboard/user-dashboard-data";
import { useMyLedgerDealsQuery } from "@/hooks/use-my-ledger-deals-query";
import { cn } from "@/lib/utils";

export function DashboardShipments() {
  const ledgerQuery = useMyLedgerDealsQuery();
  const orders = useMemo(
    () => mapLedgerDealsToDashboardOrders(ledgerQuery.data?.data ?? []),
    [ledgerQuery.data?.data],
  );
  const activeOrder =
    orders.find((order) => order.isInTransit) ??
    orders.find((order) => order.isActive) ??
    orders[0] ??
    null;

  if (ledgerQuery.isLoading) {
    return <DashboardLoadingState message="Loading shipment details..." />;
  }

  if (ledgerQuery.isError) {
    return <DashboardLoadingState message={ledgerQuery.error.message || "Unable to load shipments."} />;
  }

  if (!activeOrder) {
    return (
      <Empty className="rounded-[8px] border border-[#452E5A]/12 bg-white py-14 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
        <EmptyTitle>No shipments yet</EmptyTitle>
        <EmptyDescription>
          Shipment movement will appear once a car order is linked to your account.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
        <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-5 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6798] dark:text-white/50">
                {activeOrder.orderNumber}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#1E104E] dark:text-white">
                {activeOrder.carName}
              </h2>
              <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
                {activeOrder.portFrom} to {activeOrder.portTo}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("h-6 rounded-full border px-2.5", orderStatusStyles[activeOrder.status])}
            >
              {activeOrder.status}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ShipmentMetric icon={Ship} label="Shipping line" value={activeOrder.shippingLine} />
            <ShipmentMetric icon={Ship} label="Vessel" value={activeOrder.vesselName} />
            <ShipmentMetric icon={Navigation} label="Current location" value={activeOrder.currentLocation} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ShipmentMetric
              icon={CalendarClock}
              label="Estimated departure"
              value={activeOrder.estimatedDeparture}
            />
            <ShipmentMetric
              icon={CalendarClock}
              label="Estimated arrival"
              value={activeOrder.estimatedArrival}
            />
          </div>
          <p className="mt-4 rounded-[6px] bg-[#fbf9ff] p-3 text-sm leading-6 text-[#6a5a84] dark:bg-white/5 dark:text-white/60">
            {activeOrder.shipmentNote}
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-[#1E104E] dark:text-white">Shipment progress</span>
              <span className="text-[#6a5a84] dark:text-white/60">{activeOrder.progress}%</span>
            </div>
            <Progress value={activeOrder.progress} className="h-2 bg-[#eee8f7] [&>div]:bg-[#FF653F]" />
          </div>
        </div>

        <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-5 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
            Tracking timeline
          </h2>
          <div className="mt-5 space-y-5">
            {activeOrder.timeline.map((event, index) => {
              const Icon = eventIcons[event.state];
              const showLine = index < activeOrder.timeline.length - 1;

              return (
                <div key={`${event.title}-${event.date}-${index}`} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                  <div className="relative flex justify-center">
                    <span
                      className={cn(
                        "z-10 grid size-9 place-items-center rounded-full border bg-white dark:bg-[#150e2e]",
                        event.state === "complete" && "border-emerald-200 text-emerald-700",
                        event.state === "current" && "border-[#FF653F]/40 text-[#FF653F]",
                        event.state === "upcoming" && "border-[#452E5A]/15 text-[#7a6798]",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    {showLine ? (
                      <span className="absolute top-9 bottom-[-20px] w-px bg-[#e3d9f1] dark:bg-white/10" />
                    ) : null}
                  </div>
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-[#1E104E] dark:text-white">{event.title}</p>
                      <p className="text-xs text-[#7a6798] dark:text-white/50">{event.date}</p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[#6a5a84] dark:text-white/60">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-5 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
            Shipment details
          </h2>
          <div className="mt-4 divide-y divide-[#eee8f7] dark:divide-white/10">
            {buildShipmentMeta(activeOrder).map(([label, value]) => (
              <div key={label} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-3 text-sm">
                <span className="text-[#7a6798] dark:text-white/50">{label}</span>
                <span className="font-medium text-[#1E104E] dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-5 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">Route</h2>
          <div className="mt-4 space-y-4 text-sm">
            <p className="flex items-start gap-3 rounded-[6px] bg-[#fbf9ff] p-3 dark:bg-white/5">
              <MapPin className="mt-0.5 size-4 text-[#FF653F]" />
              <span>
                <span className="block font-semibold text-[#1E104E] dark:text-white">Origin</span>
                <span className="text-[#6a5a84] dark:text-white/60">{activeOrder.portFrom}</span>
              </span>
            </p>
            <p className="flex items-start gap-3 rounded-[6px] bg-[#fbf9ff] p-3 dark:bg-white/5">
              <Navigation className="mt-0.5 size-4 text-[#FF653F]" />
              <span>
                <span className="block font-semibold text-[#1E104E] dark:text-white">Destination</span>
                <span className="text-[#6a5a84] dark:text-white/60">{activeOrder.portTo}</span>
              </span>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function buildShipmentMeta(order: DashboardOrder): Array<[string, string]> {
  return [
    ["Order No.", order.orderNumber],
    ["Reference", order.referenceNo],
    ["Chassis", order.chassisNo],
    ["Shipping line", order.shippingLine],
    ["Vessel", order.vesselName],
    ["Estimated departure", order.estimatedDeparture],
    ["Estimated arrival", order.estimatedArrival],
    ["Booking No.", order.bookingNo],
    ["BL No.", order.billOfLadingNo],
    ["Payment", order.paymentStatus],
    ["Paid", order.paidAmount],
    ["Balance", order.balance],
  ];
}

type ShipmentMetricProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function ShipmentMetric({ icon: Icon, label, value }: ShipmentMetricProps) {
  return (
    <div className="rounded-[6px] border border-[#452E5A]/10 bg-[#fbf9ff] p-4 dark:border-white/10 dark:bg-white/5">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#7a6798] dark:text-white/50">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-2 font-semibold text-[#1E104E] dark:text-white">{value}</p>
    </div>
  );
}
