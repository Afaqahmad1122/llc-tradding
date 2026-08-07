"use client";

import Link from "next/link";
import { CalendarDays, CreditCard, Download, FileText, ImageIcon, MapPin, ReceiptText, Ship } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  mapLedgerDealsToDashboardOrders,
  orderStatusStyles,
  type DashboardOrder,
  type DashboardOrderDocument,
  type DashboardOrderImage,
} from "@/components/dashboard/user-dashboard-data";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useMyLedgerDealsQuery } from "@/hooks/use-my-ledger-deals-query";
import { getMyLedgerCarImageDownload, getMyLedgerDocumentDownload } from "@/lib/api/ledger";
import { cn } from "@/lib/utils";

function triggerFileDownload(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function triggerBatchDownloads(files: Array<{ url: string; fileName: string }>) {
  files.forEach((file, index) => {
    window.setTimeout(() => {
      triggerFileDownload(file.url, file.fileName);
    }, index * 150);
  });
}

type OrderFilter = "All" | "Active" | "In transit";

const filters: OrderFilter[] = ["All", "Active", "In transit"];

export function DashboardOrders() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("All");
  const ledgerQuery = useMyLedgerDealsQuery();
  const orders = useMemo(
    () => mapLedgerDealsToDashboardOrders(ledgerQuery.data?.data ?? []),
    [ledgerQuery.data?.data],
  );
  const filteredOrders = useMemo(() => {
    if (activeFilter === "Active") return orders.filter((order) => order.isActive);
    if (activeFilter === "In transit") return orders.filter((order) => order.isInTransit);
    return orders;
  }, [activeFilter, orders]);

  if (ledgerQuery.isLoading) {
    return <DashboardOrdersState message="Loading your orders..." />;
  }

  if (ledgerQuery.isError) {
    return <DashboardOrdersState message={ledgerQuery.error.message || "Unable to load orders."} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1E104E] dark:text-white">
            {orders.length} orders linked to your account
          </p>
          <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
            Track export status, payment stage, documents, and ETA.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveFilter(item)}
              className={cn(
                "h-8 shrink-0 rounded-[6px] border border-[#452E5A]/15 px-3 text-sm font-medium text-[#4e3a68] transition hover:bg-[#f7f2ff] dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10",
                activeFilter === item &&
                  "border-[#452E5A] bg-[#452E5A] text-white hover:bg-[#452E5A] dark:border-white dark:bg-white dark:text-[#1E104E]",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Empty className="rounded-[8px] border border-[#452E5A]/12 bg-white py-12 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
          <EmptyTitle>No orders found</EmptyTitle>
          <EmptyDescription>
            {orders.length === 0
              ? "No car order has been linked to your account yet."
              : "No order matches the selected filter."}
          </EmptyDescription>
        </Empty>
      ) : (
        filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
}

function DashboardOrdersState({ message }: { message: string }) {
  return (
    <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-8 text-center text-sm text-[#6a5a84] shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
      <span className="inline-flex items-center gap-2">
        <Spinner className="size-4" />
        {message}
      </span>
    </div>
  );
}

function OrderCard({ order }: { order: DashboardOrder }) {
  return (
    <article className="rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)_210px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-[#eee8f7]">
          {order.image ? (
            <img
              src={order.image}
              alt={order.carName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#7a6798]">
              <ImageIcon className="size-8" />
            </div>
          )}
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
                Reference {order.referenceNo} · {order.chassisNo}
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
              <span className="font-medium text-[#1E104E] dark:text-white">Order progress</span>
              <span className="text-[#6a5a84] dark:text-white/60">{order.progress}%</span>
            </div>
            <Progress value={order.progress} className="h-2 bg-[#eee8f7] [&>div]:bg-[#FF653F]" />
          </div>

          {order.images.length > 0 ? (
            <CarPhotosSection orderId={order.id} carName={order.carName} images={order.images} />
          ) : null}

          {order.documents.length > 0 ? (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-[#1E104E] dark:text-white">Documents</p>
              <div className="space-y-2">
                {order.documents.map((document) => (
                  <DocumentRow key={document.id} orderId={order.id} document={document} />
                ))}
              </div>
            </div>
          ) : null}
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
              Balance: {order.balance}
            </p>
            <p className="mt-1 text-sm leading-5 text-[#6a5a84] dark:text-white/60">
              Documents ready: {order.documentsReady}
            </p>
          </div>
          <div className="grid gap-2">
            <Button asChild className="h-10 rounded-[6px] bg-[#452E5A] text-white hover:bg-[#38244a]">
              <Link href="/dashboard/shipments">
                <Ship className="size-4" />
                Track shipment
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CarPhotosSection({
  orderId,
  carName,
  images,
}: {
  orderId: string;
  carName: string;
  images: DashboardOrderImage[];
}) {
  const downloadAllMutation = useApiMutation({
    mutationFn: async () => {
      const downloads = await Promise.all(
        images.map((image) => getMyLedgerCarImageDownload(orderId, image.id)),
      );
      triggerBatchDownloads(
        downloads.map((download) => ({ url: download.downloadUrl, fileName: download.fileName })),
      );
      return downloads.length;
    },
    successToast: (count) => `Started ${count} photo download${count === 1 ? "" : "s"}.`,
    errorToast: "Unable to download all photos. Please try again.",
  });

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#1E104E] dark:text-white">Car photos</p>
        {images.length > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-[6px]"
            disabled={downloadAllMutation.isPending}
            onClick={() => downloadAllMutation.mutate(undefined)}
          >
            <Download className="size-3.5" />
            {downloadAllMutation.isPending ? "Preparing..." : "Download all"}
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <CarImageThumb key={image.id} orderId={orderId} image={image} index={index} carName={carName} />
        ))}
      </div>
    </div>
  );
}

function CarImageThumb({
  orderId,
  image,
  index,
  carName,
}: {
  orderId: string;
  image: DashboardOrderImage;
  index: number;
  carName: string;
}) {
  const downloadMutation = useApiMutation({
    mutationFn: () => getMyLedgerCarImageDownload(orderId, image.id),
    onSuccess: (data) => {
      triggerFileDownload(data.downloadUrl, data.fileName);
    },
    errorToast: "Unable to download this photo. Please try again.",
  });

  return (
    <div className="group relative aspect-square overflow-hidden rounded-[6px] border border-[#452E5A]/10 bg-[#eee8f7] dark:border-white/10">
      <img
        src={image.url}
        alt={image.altText ?? `${carName} photo ${index + 1}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <button
        type="button"
        disabled={downloadMutation.isPending}
        onClick={() => downloadMutation.mutate(undefined)}
        className="absolute right-1.5 bottom-1.5 grid size-8 place-items-center rounded-full bg-white/90 text-[#452E5A] shadow-sm transition hover:bg-white disabled:cursor-wait dark:bg-[#150e2e]/90 dark:text-white"
        aria-label={`Download photo ${index + 1}`}
      >
        <Download className="size-4" />
      </button>
    </div>
  );
}

function DocumentRow({
  orderId,
  document,
}: {
  orderId: string;
  document: DashboardOrderDocument;
}) {
  const downloadMutation = useApiMutation({
    mutationFn: () => getMyLedgerDocumentDownload(orderId, document.id),
    onSuccess: (data) => {
      triggerFileDownload(data.downloadUrl, document.fileName);
    },
    errorToast: "Unable to download this document. Please try again.",
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#452E5A]/10 bg-[#fbf9ff] p-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-white text-[#452E5A] dark:bg-white/10 dark:text-white">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#1E104E] dark:text-white">
            {document.title}
          </p>
          <p className="truncate text-xs text-[#7a6798] dark:text-white/50">{document.createdAt}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-8 shrink-0 rounded-[6px]"
        disabled={downloadMutation.isPending}
        onClick={() => downloadMutation.mutate(undefined)}
      >
        <Download className="size-3.5" />
        {downloadMutation.isPending ? "Preparing..." : "Download"}
      </Button>
    </div>
  );
}

type OrderMetaProps = {
  icon: LucideIcon;
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
