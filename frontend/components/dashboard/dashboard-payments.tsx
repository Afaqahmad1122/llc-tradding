"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  orderStatusStyles,
  paymentTypeStyles,
  mapLedgerDealsToDashboardOrders,
  type DashboardOrder,
  type DashboardPayment,
} from "@/components/dashboard/user-dashboard-data";
import { useMyLedgerDealsQuery } from "@/hooks/use-my-ledger-deals-query";
import { cn } from "@/lib/utils";

export function DashboardPayments() {
  const ledgerQuery = useMyLedgerDealsQuery();
  const orders = useMemo(
    () => mapLedgerDealsToDashboardOrders(ledgerQuery.data?.data ?? []),
    [ledgerQuery.data?.data],
  );

  if (ledgerQuery.isLoading) {
    return <DashboardPaymentsState message="Loading your payments..." />;
  }

  if (ledgerQuery.isError) {
    return <DashboardPaymentsState message={ledgerQuery.error.message || "Unable to load payments."} />;
  }

  if (orders.length === 0) {
    return (
      <Empty className="rounded-[8px] border border-[#452E5A]/12 bg-white py-14 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
        <EmptyTitle>No payment records yet</EmptyTitle>
        <EmptyDescription>
          Once admin links a car order to your account, payments will appear here.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      {orders.map((order) => (
        <OrderPaymentsCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function DashboardPaymentsState({ message }: { message: string }) {
  return (
    <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-8 text-center text-sm text-[#6a5a84] shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
      <span className="inline-flex items-center gap-2">
        <Spinner className="size-4" />
        {message}
      </span>
    </div>
  );
}

function OrderPaymentsCard({ order }: { order: DashboardOrder }) {
  return (
    <article className="rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6798] dark:text-white/50">
            {order.orderNumber}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#1E104E] dark:text-white">{order.carName}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("h-6 rounded-full border px-2.5", orderStatusStyles[order.status])}
          >
            {order.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "h-6 rounded-full border px-2.5",
              order.isOverdue
                ? "border-red-200 bg-red-50 text-red-700"
                : order.remainingBalanceAmount <= 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-[#FF653F]/25 bg-[#fff6f3] text-[#c94a2c]",
            )}
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <PaymentSummaryBox label="Total amount" value={order.totalAmount} />
        <PaymentSummaryBox label="Paid so far" value={order.paidAmount} tone="success" />
        <PaymentSummaryBox
          label="Balance remaining"
          value={order.balance}
          tone={order.remainingBalanceAmount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-[#1E104E] dark:text-white">Payment progress</span>
          <span className="text-[#6a5a84] dark:text-white/60">{order.paymentProgress}%</span>
        </div>
        <Progress value={order.paymentProgress} className="h-2 bg-[#eee8f7] [&>div]:bg-[#FF653F]" />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-[#1E104E] dark:text-white">Payment history</p>
        {order.payments.length === 0 ? (
          <p className="rounded-[6px] bg-[#fbf9ff] p-3 text-sm text-[#6a5a84] dark:bg-white/5 dark:text-white/60">
            No payments recorded yet for this order.
          </p>
        ) : (
          <div className="space-y-2">
            {order.payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function PaymentRow({ payment }: { payment: DashboardPayment }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#452E5A]/10 bg-[#fbf9ff] p-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn("h-6 shrink-0 rounded-full border px-2.5", paymentTypeStyles[payment.type])}
        >
          {payment.typeLabel}
        </Badge>
        <div className="min-w-0">
          <p className="text-sm text-[#1E104E] dark:text-white">
            {payment.method} · {payment.paidAt}
          </p>
          {payment.referenceNo ? (
            <p className="truncate text-xs text-[#7a6798] dark:text-white/50">
              Ref: {payment.referenceNo}
            </p>
          ) : null}
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold text-[#1E104E] dark:text-white">{payment.amount}</p>
    </div>
  );
}

type PaymentSummaryTone = "default" | "success" | "warning";

const summaryToneStyles: Record<PaymentSummaryTone, string> = {
  default: "border-[#452E5A]/10 dark:border-white/10",
  success: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/10",
  warning: "border-[#FF653F]/25 bg-[#fff6f3] dark:border-[#FF653F]/25 dark:bg-[#FF653F]/10",
};

const summaryToneText: Record<PaymentSummaryTone, string> = {
  default: "text-[#1E104E] dark:text-white",
  success: "text-emerald-700 dark:text-emerald-400",
  warning: "text-[#c94a2c] dark:text-[#ff9a7d]",
};

function PaymentSummaryBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: PaymentSummaryTone;
}) {
  return (
    <div className={cn("rounded-[6px] border p-3", summaryToneStyles[tone])}>
      <p className="text-xs text-[#7a6798] dark:text-white/50">{label}</p>
      <p className={cn("mt-1 font-semibold", summaryToneText[tone])}>{value}</p>
    </div>
  );
}
