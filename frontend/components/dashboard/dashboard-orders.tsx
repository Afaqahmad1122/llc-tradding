import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CreditCard, MapPin, ReceiptText, Ship } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  dashboardOrders,
  orderStatusStyles,
} from "@/components/dashboard/user-dashboard-data";
import { cn } from "@/lib/utils";

export function DashboardOrders() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1E104E] dark:text-white">
            {dashboardOrders.length} orders linked to your account
          </p>
          <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
            Track export status, payment stage, route, and ETA.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["All", "Active", "In transit"].map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="h-8 shrink-0 rounded-[6px] border-[#452E5A]/15 px-3 text-[#4e3a68] dark:border-white/10 dark:text-white/70"
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>

      {dashboardOrders.map((order) => (
        <article
          key={order.id}
          className="rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:p-5"
        >
          <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)_190px]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-[#eee8f7]">
              <Image
                src={order.image}
                alt={order.carName}
                fill
                sizes="(min-width: 1024px) 190px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6798] dark:text-white/50">
                    {order.orderNumber}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[#1E104E] dark:text-white">
                    {order.carName}
                  </h2>
                  <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
                    Reference {order.referenceNo}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("h-6 rounded-full border px-2.5", orderStatusStyles[order.status])}
                >
                  {order.status}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <OrderMeta icon={ReceiptText} label="Order date" value={order.orderedAt} />
                <OrderMeta icon={CreditCard} label="Payment" value={order.paymentStatus} />
                <OrderMeta icon={CalendarDays} label="ETA" value={order.eta} />
                <OrderMeta icon={MapPin} label="Destination" value={order.portTo} />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1E104E] dark:text-white">
                    Order progress
                  </span>
                  <span className="text-[#6a5a84] dark:text-white/60">{order.progress}%</span>
                </div>
                <Progress value={order.progress} className="h-2 bg-[#eee8f7] [&>div]:bg-[#FF653F]" />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-[6px] bg-[#fbf9ff] p-4 dark:bg-white/5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#7a6798] dark:text-white/50">
                  Total amount
                </p>
                <p className="mt-2 text-lg font-semibold text-[#1E104E] dark:text-white">
                  {order.totalAmount}
                </p>
                <p className="mt-3 text-sm leading-5 text-[#6a5a84] dark:text-white/60">
                  Route: {order.portFrom} to {order.portTo}
                </p>
              </div>
              <div className="grid gap-2">
                <Button asChild className="h-10 rounded-[6px] bg-[#452E5A] text-white hover:bg-[#38244a]">
                  <Link href="/dashboard/shipments">
                    <Ship className="size-4" />
                    Track shipment
                  </Link>
                </Button>
                <Button variant="outline" className="h-10 rounded-[6px]">
                  View details
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

type OrderMetaProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
};

function OrderMeta({ icon: Icon, label, value }: OrderMetaProps) {
  return (
    <div className="rounded-[6px] border border-[#452E5A]/10 bg-[#fbf9ff] p-3 dark:border-white/10 dark:bg-white/5">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#7a6798] dark:text-white/50">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#1E104E] dark:text-white">{value}</p>
    </div>
  );
}
