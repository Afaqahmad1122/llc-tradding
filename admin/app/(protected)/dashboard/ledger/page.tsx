"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Banknote,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Download,
  FileUp,
  ImageIcon,
  Pencil,
  Plus,
  ReceiptText,
  SearchIcon,
  Ship,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  Suspense,
  type FormEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { ForbiddenPage } from "@/components/auth/permission-guard";
import {
  AdminDataPageHeader,
  AdminDataPanel,
} from "@/components/layout/admin-data-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAdminAuthStore } from "@/stores/auth-store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api/client";
import {
  createAdminCar,
  fetchAdminCars,
  fetchAdminModels,
  updateAdminCar,
  uploadCarImage,
  type AdminCar,
  type CarImageInput,
} from "@/lib/api/cars";
import {
  createAdminCustomer,
  fetchAdminCustomers,
  type AdminCustomer,
} from "@/lib/api/users";
import { cn } from "@/lib/utils";
import {
  addLedgerPayment,
  createLedgerDeal,
  createLedgerNote,
  deleteLedgerDeal,
  fetchLedgerDeal,
  fetchLedgerDeals,
  getLedgerCarImageDownload,
  getLedgerDocumentDownload,
  type CreateLedgerDealBody,
  type LedgerCurrency,
  type LedgerDeal,
  type LedgerDealStatus,
  type LedgerDealType,
  type LedgerDocument,
  type LedgerDocumentType,
  type LedgerPaymentMethod,
  type LedgerPaymentType,
  type LedgerSummary,
  updateLedgerDeal,
  uploadLedgerDocumentFile,
} from "@/lib/api/ledger";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 400;

const currencies: LedgerCurrency[] = ["JPY", "USD", "PKR", "AED"];
const dealTypes: LedgerDealType[] = ["FOB", "CNF", "CIF"];
const DEAL_TYPE_BADGE_CLASS =
  "border-amber-300 bg-amber-100 text-amber-900 shadow-none dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-200";
const dealStatuses: LedgerDealStatus[] = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "IN_TRANSIT",
  "ARRIVED",
  "PAYMENT_COMPLETED",
  "DOCUMENTS_DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];
const paymentTypes: LedgerPaymentType[] = [
  "DOWN_PAYMENT",
  "INSTALLMENT",
  "FINAL_PAYMENT",
  "REFUND",
  "ADJUSTMENT",
];
const paymentMethods: LedgerPaymentMethod[] = [
  "BANK_TRANSFER",
  "CASH",
  "CARD",
  "ONLINE",
  "OTHER",
];
const documentTypes: LedgerDocumentType[] = [
  "INVOICE",
  "PURCHASE_RECEIPT",
  "INSPECTION_SHEET",
  "EXPORT_CERTIFICATE",
  "BILL_OF_LADING",
  "SHIPPING_INVOICE",
  "PAYMENT_RECEIPT",
  "OTHER",
];
type CreateDealDocumentDraft = {
  id: string;
  title: string;
  type: LedgerDocumentType;
  file: File | null;
};

type LedgerCarImageDraft = {
  id: string;
  url: string;
  key: string;
  fileName: string;
  isPrimary: boolean;
};

function createDocumentDraft(type: LedgerDocumentType = "OTHER"): CreateDealDocumentDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: type === "OTHER" ? "" : label(type),
    type,
    file: null,
  };
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Try again.";
}

function label(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function dealTypeLabel(value: LedgerDealType) {
  return value === "CNF" ? "C&F" : value;
}

function formatMoney(amount: number | null | undefined, currency: string) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${currency} ${amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function dateInputValue(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function SearchablePickerContent({
  children,
  footer,
  listClassName = "max-h-72",
  onSearchChange,
  placeholder,
  searchValue,
}: {
  children: ReactNode;
  footer?: ReactNode;
  listClassName?: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  searchValue: string;
}) {
  return (
    <PopoverContent
      align="start"
      className="max-h-[min(var(--radix-popover-content-available-height),24rem)] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0"
    >
      <div className="border-b p-3">
        <div className="relative">
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            autoFocus
            placeholder={placeholder}
            className="pl-9"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      <div className={cn("overflow-y-auto overscroll-contain p-2", listClassName)}>
        {children}
      </div>
      {footer}
    </PopoverContent>
  );
}

function paymentBalanceLabel(deal: LedgerDeal) {
  if (deal.paymentSummary.isOverdue) return "Overdue";
  if (deal.paymentSummary.remainingBalance <= 0) return "Fully Paid";
  if (deal.paymentSummary.paidAmount > 0) return "Balance Pending";
  return "No Payment";
}

function paymentBalanceVariant(deal: LedgerDeal): "default" | "secondary" | "destructive" | "outline" {
  if (deal.paymentSummary.isOverdue) return "destructive";
  if (deal.paymentSummary.remainingBalance <= 0) return "default";
  if (deal.paymentSummary.paidAmount > 0) return "secondary";
  return "outline";
}

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

function getPasswordError(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/\d/.test(password)) return "Password must include a number.";
  return null;
}

function getFileMeta(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (
    file.type === "application/pdf" &&
    ext === "pdf"
  ) {
    return { contentType: "application/pdf" as const, ext: "pdf" as const };
  }
  if (file.type === "image/jpeg" && (ext === "jpg" || ext === "jpeg")) {
    return { contentType: "image/jpeg" as const, ext: ext as "jpg" | "jpeg" };
  }
  if (file.type === "image/png" && ext === "png") {
    return { contentType: "image/png" as const, ext: "png" as const };
  }
  if (file.type === "image/webp" && ext === "webp") {
    return { contentType: "image/webp" as const, ext: "webp" as const };
  }
  return null;
}

async function uploadLedgerDocumentDraft(dealId: string, document: CreateDealDocumentDraft) {
  if (!document.file) return null;
  const meta = getFileMeta(document.file);
  if (!meta) throw new ApiError("Only PDF, JPG, PNG, or WEBP files are supported.");
  return uploadLedgerDocumentFile(dealId, {
    type: document.type,
    title: document.type === "OTHER" ? document.file.name : label(document.type),
    file: document.file,
  });
}

function LedgerSummaryCards({
  isLoading,
  summary,
}: {
  isLoading: boolean;
  summary: LedgerSummary | undefined;
}) {
  const buckets = (summary?.byCurrency ?? []).slice().sort((a, b) => {
    const aIndex = currencies.indexOf(a.currency);
    const bIndex = currencies.indexOf(b.currency);
    return aIndex - bIndex;
  });

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Overall ledger
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {isLoading && !summary ? "..." : (summary?.customerCount ?? 0)}
            </p>
          </div>
          <div className="bg-primary/10 text-primary rounded-md p-2">
            <ReceiptText className="size-5" />
          </div>
        </div>
        <div className="text-muted-foreground mt-3 flex items-center justify-between gap-3 text-sm">
          <span>Users</span>
          <span className="tabular-nums">{summary?.dealCount ?? 0} deals</span>
        </div>
      </article>

      {buckets.length > 0 ? (
        buckets.map((bucket) => (
          <article key={bucket.currency} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {bucket.currency} total ledger
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatMoney(bucket.totalAmount, bucket.currency)}
                </p>
              </div>
              <div className="bg-primary/10 text-primary rounded-md p-2">
                <Banknote className="size-5" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Paid</p>
                <p className="font-medium tabular-nums">
                  {formatMoney(bucket.paidAmount, bucket.currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance</p>
                <p className="font-medium tabular-nums">
                  {formatMoney(bucket.remainingBalance, bucket.currency)}
                </p>
              </div>
            </div>
          </article>
        ))
      ) : (
        <article className="rounded-lg border bg-card p-4 shadow-sm md:col-span-1 xl:col-span-3">
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Loading ledger totals..." : "No ledger totals for the selected filters."}
          </p>
        </article>
      )}
    </section>
  );
}

function LedgerPageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const hasPermission = useAdminAuthStore((state) => state.hasPermission);
  const canCreateLedger = hasPermission("ledgerCreate");
  const canUpdateLedger = hasPermission("ledgerUpdate");
  const canDeleteLedger = hasPermission("ledgerDelete");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LedgerDealStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "OVERDUE" | "FULLY_PAID" | "BALANCE_PENDING"
  >("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedDealMode, setSelectedDealMode] = useState<"view" | "edit">("view");
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const selectedUserId = searchParams.get("userId")?.trim() ?? "";
  const selectedUserName = searchParams.get("userName")?.trim() ?? "";

  const dealsQuery = useQuery({
    queryKey: [
      "admin-ledger-deals",
      page,
      debouncedSearch,
      statusFilter,
      paymentFilter,
      selectedUserId,
    ],
    queryFn: () =>
      fetchLedgerDeals({
        page,
        pageSize: PAGE_SIZE,
        ...(selectedUserId ? { userId: selectedUserId } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(paymentFilter !== "all" ? { paymentStatus: paymentFilter } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const rows = dealsQuery.data?.data ?? [];
  const totalItems = dealsQuery.data?.pagination.total ?? 0;
  const totalPages = dealsQuery.data?.pagination.totalPages ?? 0;
  const ledgerSummary = dealsQuery.data?.summary;

  const refreshDeals = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-ledger-deals"] });
  const deleteMutation = useApiMutation({
    mutationFn: (id: string) => deleteLedgerDeal(id),
    successToast: "Ledger deal deleted.",
    onSuccess: () => {
      void refreshDeals();
    },
  });

  return (
    <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-8 px-5 pb-12 pt-8 sm:px-7 sm:pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminDataPageHeader
          icon={ReceiptText}
          title="Ledger"
          description="Track every customer car deal, down payment, balance, documents, and admin notes."
        />
        {canCreateLedger ? (
          <Button className="h-10 rounded-md" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New deal
          </Button>
        ) : null}
      </div>

      <LedgerSummaryCards
        isLoading={dealsQuery.isPending}
        summary={ledgerSummary}
      />

      {selectedUserId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              Showing ledger for {selectedUserName || "selected user"}
            </p>
            <p className="text-muted-foreground break-all text-xs">
              User ID: {selectedUserId}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/ledger">Show all users</Link>
          </Button>
        </div>
      ) : null}

      <AdminDataPanel
        controls={
          <>
            <div className="space-y-2">
              <Label htmlFor="ledger-search" className="text-muted-foreground text-xs font-medium">
                Search ledger
              </Label>
              <div className="relative">
                <SearchIcon
                  className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  id="ledger-search"
                  className="bg-background min-h-10 border-border/80 pl-9 shadow-sm"
                  placeholder="Customer, email, order no, car ref, chassis…"
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-4">
              <div className="flex min-w-44 flex-1 flex-col gap-1.5 sm:max-w-56">
                <Label htmlFor="ledger-status" className="text-muted-foreground text-xs font-medium">
                  Order status
                </Label>
                <NativeSelect
                  id="ledger-status"
                  className="bg-background border-border/80"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as "all" | LedgerDealStatus);
                    setPage(1);
                  }}
                >
                  <NativeSelectOption value="all">All statuses</NativeSelectOption>
                  {dealStatuses.map((status) => (
                    <NativeSelectOption key={status} value={status}>
                      {label(status)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex min-w-44 flex-1 flex-col gap-1.5 sm:max-w-56">
                <Label htmlFor="ledger-payment" className="text-muted-foreground text-xs font-medium">
                  Payment status
                </Label>
                <NativeSelect
                  id="ledger-payment"
                  className="bg-background border-border/80"
                  value={paymentFilter}
                  onChange={(event) => {
                    setPaymentFilter(event.target.value as typeof paymentFilter);
                    setPage(1);
                  }}
                >
                  <NativeSelectOption value="all">All payments</NativeSelectOption>
                  <NativeSelectOption value="BALANCE_PENDING">Balance pending</NativeSelectOption>
                  <NativeSelectOption value="FULLY_PAID">Fully paid</NativeSelectOption>
                  <NativeSelectOption value="OVERDUE">Overdue</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          </>
        }
        emptyDescription="Create a deal or adjust filters to see more ledger records."
        emptyIcon={ReceiptText}
        emptyTitle="No ledger records"
        error={dealsQuery.error}
        errorMessage={formatErrorMessage}
        errorTitle="Could not load ledger"
        isEmpty={rows.length === 0}
        isError={dealsQuery.isError}
        isFetching={dealsQuery.isFetching}
        isPending={dealsQuery.isPending}
        loadingLabel="Loading ledger…"
        table={
          <LedgerTable
            deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
            canDelete={canDeleteLedger}
            canUpdate={canUpdateLedger}
            rows={rows}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(id) => {
              setSelectedDealMode("edit");
              setSelectedDealId(id);
            }}
            onSelect={(id) => {
              setSelectedDealMode("view");
              setSelectedDealId(id);
            }}
          />
        }
        pagination={{
          isFetching: dealsQuery.isFetching,
          onPageChange: setPage,
          page,
          rowsShown: rows.length,
          totalItems,
          totalPages,
        }}
      />

      <CreateDealDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false);
          void refreshDeals();
        }}
      />
      <DealDetailDialog
        dealId={selectedDealId}
        mode={selectedDealMode}
        canUpdate={canUpdateLedger}
        onOpenChange={(open) => {
          if (!open) setSelectedDealId(null);
        }}
        onChanged={() => void refreshDeals()}
      />
    </div>
  );
}

function LedgerTable({
  canDelete,
  canUpdate,
  deletingId,
  onDelete,
  onEdit,
  rows,
  onSelect,
}: {
  canDelete: boolean;
  canUpdate: boolean;
  deletingId: string | null | undefined;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  rows: LedgerDeal[];
  onSelect: (id: string) => void;
}) {
  return (
    <Table className="min-w-[78rem]">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-60 pl-4 sm:pl-5">Customer</TableHead>
          <TableHead className="min-w-64">Car</TableHead>
          <TableHead className="hidden min-w-44 lg:table-cell">Total</TableHead>
          <TableHead className="min-w-44">Down payment</TableHead>
          <TableHead className="min-w-52">Balance</TableHead>
          <TableHead className="hidden min-w-56 md:table-cell">Status</TableHead>
          <TableHead className="min-w-48 pr-4 text-right sm:pr-5">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((deal) => (
          <TableRow key={deal.id} className="align-top hover:bg-muted/30">
            <TableCell className="min-w-0 whitespace-normal pl-4 sm:pl-5">
              <p className="truncate font-medium">{deal.user.name}</p>
              <p className="text-muted-foreground mt-0.5 break-all text-xs">{deal.user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-normal">
                  {deal.orderNumber}
                </Badge>
                <Badge variant="outline" className={cn("font-normal", DEAL_TYPE_BADGE_CLASS)}>
                  {dealTypeLabel(deal.dealType)}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="min-w-0 whitespace-normal">
              <p className="truncate font-medium">{deal.car.model.brand} {deal.car.model.name}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{deal.car.referenceNo}</p>
              <p className="text-muted-foreground mt-0.5 break-all text-xs">
                {deal.car.chassisNo ?? "No chassis"}
              </p>
            </TableCell>
            <TableCell className="hidden whitespace-normal tabular-nums lg:table-cell">
              {formatMoney(deal.totalAmount, deal.currency)}
              <p className="text-muted-foreground mt-1 text-xs">
                Paid {formatMoney(deal.paymentSummary.paidAmount, deal.currency)}
              </p>
            </TableCell>
            <TableCell className="whitespace-normal tabular-nums">
              <p className="font-semibold">
                {formatMoney(deal.downPaymentRequired, deal.currency)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Required</p>
            </TableCell>
            <TableCell className="whitespace-normal">
              <p className="font-semibold tabular-nums">
                {formatMoney(deal.paymentSummary.remainingBalance, deal.currency)}
              </p>
              <Progress
                value={deal.paymentSummary.paidPercent}
                className="mt-2 h-1.5"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {deal.paymentSummary.paidPercent}% paid
              </p>
            </TableCell>
            <TableCell className="hidden whitespace-normal md:table-cell">
              <div className="flex flex-col items-start gap-1.5">
                <Badge variant={deal.status === "CANCELLED" ? "destructive" : "outline"}>
                  {label(deal.status)}
                </Badge>
                <Badge variant={paymentBalanceVariant(deal)}>
                  {paymentBalanceLabel(deal)}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="pr-4 text-right sm:pr-5">
              <div className="flex justify-end gap-2 whitespace-nowrap">
                <Button variant="outline" size="sm" onClick={() => onSelect(deal.id)}>
                  Open
                </Button>
                {canUpdate ? (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Edit ${deal.orderNumber}`}
                    onClick={() => onEdit(deal.id)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                ) : null}
                {canDelete ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        aria-label={`Delete ${deal.orderNumber}`}
                        disabled={deletingId === deal.id}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete ledger deal?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {deal.orderNumber} from the ledger list. Existing
                          customer and car records will stay unchanged.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => onDelete(deal.id)}
                        >
                          {deletingId === deal.id ? "Deleting..." : "Delete deal"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CreateDealDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [carSearch, setCarSearch] = useState("");
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [carPickerOpen, setCarPickerOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<AdminCustomer | null>(null);
  const [createdCar, setCreatedCar] = useState<AdminCar | null>(null);
  const [customerCreateOpen, setCustomerCreateOpen] = useState(false);
  const [carCreateOpen, setCarCreateOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    city: "",
  });
  const [newCar, setNewCar] = useState({
    referenceNo: "",
    title: "",
    modelId: "",
    year: String(new Date().getFullYear()),
    chassisNo: "",
    priceUsd: "",
    priceJpy: "",
    pricePkr: "",
    isPublished: false,
  });
  const [newCarImages, setNewCarImages] = useState<LedgerCarImageDraft[]>([]);
  const [carImageUploadBusy, setCarImageUploadBusy] = useState(false);
  const carImageInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    userId: "",
    carId: "",
    totalAmount: "",
    currency: "JPY" as LedgerCurrency,
    dealType: "FOB" as LedgerDealType,
    downPaymentRequired: "",
    dueDate: "",
    status: "CONFIRMED" as LedgerDealStatus,
    note: "",
  });
  const [documents, setDocuments] = useState<CreateDealDocumentDraft[]>(
    () => [createDocumentDraft()],
  );
  const debouncedCustomerSearch = useDebouncedValue(customerSearch, SEARCH_DEBOUNCE_MS);
  const debouncedCarSearch = useDebouncedValue(carSearch, SEARCH_DEBOUNCE_MS);

  const customersQuery = useQuery({
    queryKey: ["ledger-customers", debouncedCustomerSearch],
    queryFn: () =>
      fetchAdminCustomers({
        page: 1,
        pageSize: 50,
        ...(debouncedCustomerSearch ? { q: debouncedCustomerSearch } : {}),
      }),
    enabled: open,
  });
  const carsQuery = useQuery({
    queryKey: ["ledger-cars", debouncedCarSearch],
    queryFn: () =>
      fetchAdminCars({
        page: 1,
        pageSize: 100,
        ...(debouncedCarSearch ? { search: debouncedCarSearch } : {}),
      }),
    enabled: open,
  });
  const modelsQuery = useQuery({
    queryKey: ["ledger-car-models"],
    queryFn: fetchAdminModels,
    enabled: open || carCreateOpen,
  });

  const createMutation = useApiMutation({
    mutationFn: async (body: CreateLedgerDealBody) => {
      const response = await createLedgerDeal(body);
      const documentsToUpload = documents.filter((document) => document.file);
      let failedDocumentUploads = 0;
      for (const document of documentsToUpload) {
        try {
          await uploadLedgerDocumentDraft(response.deal.id, document);
        } catch (error) {
          failedDocumentUploads += 1;
          console.error("Ledger document upload failed", error);
        }
      }
      return {
        ...response,
        documentUploadCount: documentsToUpload.length,
        failedDocumentUploads,
      };
    },
    successToast: (data) => {
      const uploadedCount = data.documentUploadCount - data.failedDocumentUploads;
      return data.documentUploadCount > 0
        ? `Ledger deal created with ${uploadedCount} document${uploadedCount === 1 ? "" : "s"} uploaded.`
        : "Ledger deal created.";
    },
    onSuccess: (data) => {
      if (data.failedDocumentUploads > 0) {
        toast.warning(
          `${data.failedDocumentUploads} document upload${data.failedDocumentUploads === 1 ? "" : "s"} failed. Open the deal and retry from Documents.`,
        );
      }
      setDocuments([createDocumentDraft()]);
      onCreated();
    },
  });

  const createCustomerMutation = useApiMutation({
    mutationFn: () =>
      createAdminCustomer({
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        password: newCustomer.password,
        phone: newCustomer.phone.trim() || undefined,
        country: newCustomer.country.trim() || undefined,
        city: newCustomer.city.trim() || undefined,
      }),
    successToast: "Customer added.",
    onSuccess: (data) => {
      setCreatedCustomer(data.customer);
      setForm((state) => ({ ...state, userId: data.customer.id }));
      setCustomerSearch(data.customer.email);
      setNewCustomer({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        country: "",
        city: "",
      });
      setCustomerCreateOpen(false);
      setCustomerPickerOpen(false);
      void customersQuery.refetch();
    },
  });

  const createCarMutation = useApiMutation({
    mutationFn: () => {
      const referenceNo = newCar.referenceNo.trim().toUpperCase();
      const year = Number(newCar.year);
      if (!referenceNo || !newCar.modelId || !Number.isInteger(year)) {
        throw new ApiError("Reference number, model, and year are required.");
      }
      return createAdminCar({
        referenceNo,
        title: newCar.title.trim() || undefined,
        modelId: newCar.modelId,
        year,
        chassisNo: newCar.chassisNo.trim() || undefined,
        priceUsd: newCar.priceUsd ? Number(newCar.priceUsd) : null,
        priceJpy: newCar.priceJpy ? Number(newCar.priceJpy) : null,
        pricePkr: newCar.pricePkr ? Number(newCar.pricePkr) : null,
        isPublished: newCar.isPublished,
        ...(newCarImages.length > 0
          ? {
              images: newCarImages.map<CarImageInput>((image, index) => ({
                url: image.url,
                key: image.key,
                altText: newCar.referenceNo.trim().toUpperCase(),
                position: index,
                isPrimary: image.isPrimary || index === 0,
              })),
            }
          : {}),
      });
    },
    successToast: (data) =>
      data.car.isPublished
        ? "Car added and listed on website."
        : "Ledger car added.",
    onSuccess: (data) => {
      setCreatedCar(data.car);
      setForm((state) => ({ ...state, carId: data.car.id }));
      setCarSearch(data.car.referenceNo);
      setNewCar({
        referenceNo: "",
        title: "",
        modelId: "",
        year: String(new Date().getFullYear()),
        chassisNo: "",
        priceUsd: "",
        priceJpy: "",
        pricePkr: "",
        isPublished: false,
      });
      setModelSearch("");
      setNewCarImages([]);
      setCarCreateOpen(false);
      setCarPickerOpen(false);
      void carsQuery.refetch();
    },
  });

  async function uploadLedgerCarImages(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );
    if (selectedFiles.length === 0) {
      toast.error("Choose JPG, PNG, or WEBP images.");
      return;
    }

    setCarImageUploadBusy(true);
    try {
      const uploadedImages: LedgerCarImageDraft[] = [];
      for (const file of selectedFiles) {
        const uploaded = await uploadCarImage(file);
        uploadedImages.push({
          id: crypto.randomUUID(),
          url: uploaded.publicUrl,
          key: uploaded.key,
          fileName: file.name,
          isPrimary: false,
        });
      }
      setNewCarImages((state) => {
        const hasPrimary = state.some((image) => image.isPrimary);
        const nextImages = uploadedImages.map((image, index) => ({
          ...image,
          isPrimary: !hasPrimary && state.length === 0 && index === 0,
        }));
        return [...state, ...nextImages];
      });
      toast.success(
        `${uploadedImages.length} image${uploadedImages.length === 1 ? "" : "s"} uploaded.`,
      );
    } catch (error) {
      console.error("Ledger car image upload failed", error);
      toast.error("Image upload failed. Try again.");
    } finally {
      setCarImageUploadBusy(false);
    }
  }

  function openLedgerCarCreate() {
    setNewCar((state) => ({
      ...state,
      referenceNo: carSearch.trim()
        ? carSearch.trim().toUpperCase()
        : state.referenceNo,
    }));
    setCarPickerOpen(false);
    setCarCreateOpen(true);
  }

  const selectedCar =
    carsQuery.data?.data.find((car) => car.id === form.carId) ??
    (createdCar?.id === form.carId ? createdCar : undefined);
  const modelsData = modelsQuery.data?.models;
  const modelRows = useMemo(() => modelsData ?? [], [modelsData]);
  const selectedNewCarModel = modelRows.find((model) => model.id === newCar.modelId);
  const filteredModelRows = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    if (!query) return modelRows;
    return modelRows.filter((model) =>
      `${model.brand} ${model.name}`.toLowerCase().includes(query),
    );
  }, [modelRows, modelSearch]);
  const selectedCustomer =
    customersQuery.data?.data.find((customer) => customer.id === form.userId) ??
    (createdCustomer?.id === form.userId ? createdCustomer : undefined);
  const customerRows = customersQuery.data?.data ?? [];
  const carRows = carsQuery.data?.data ?? [];
  const newCustomerPasswordError = newCustomer.password
    ? getPasswordError(newCustomer.password)
    : null;
  const newCustomerConfirmError =
    newCustomer.confirmPassword && newCustomer.password !== newCustomer.confirmPassword
      ? "Passwords do not match."
      : null;
  const canCreateCustomer =
    Boolean(newCustomer.name.trim()) &&
    Boolean(newCustomer.email.trim()) &&
    Boolean(newCustomer.password) &&
    Boolean(newCustomer.confirmPassword) &&
    !newCustomerPasswordError &&
    !newCustomerConfirmError;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.userId || !form.carId || !form.totalAmount) {
      toast.error("Customer, car and total amount are required.");
      return;
    }
    createMutation.mutate({
      userId: form.userId,
      carId: form.carId,
      totalAmount: Number(form.totalAmount),
      currency: form.currency,
      dealType: form.dealType,
      downPaymentRequired: form.downPaymentRequired
        ? Number(form.downPaymentRequired)
        : null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      status: form.status,
      note: form.note.trim() || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create ledger deal</DialogTitle>
          <DialogDescription>
            Link a customer with a car and set the agreed amount.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Popover open={customerPickerOpen} onOpenChange={setCustomerPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerPickerOpen}
                    className={cn(
                      "h-auto min-h-11 w-full justify-between rounded-md px-3 py-2 text-left font-normal",
                      !selectedCustomer && "text-muted-foreground",
                    )}
                  >
                    <span className="min-w-0">
                      {selectedCustomer ? (
                        <>
                          <span className="block truncate font-medium text-foreground">
                            {selectedCustomer.name}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {selectedCustomer.email}
                          </span>
                        </>
                      ) : (
                        "Search or add customer"
                      )}
                    </span>
                    <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <SearchablePickerContent
                  placeholder="Search name or email"
                  searchValue={customerSearch}
                  onSearchChange={setCustomerSearch}
                  listClassName="max-h-60"
                  footer={
                    <div className="border-t bg-muted/20 p-3">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => {
                          setNewCustomer((state) => ({
                            ...state,
                            email: customerSearch.includes("@") ? customerSearch : state.email,
                            name: !customerSearch.includes("@") ? customerSearch : state.name,
                          }));
                          setCustomerPickerOpen(false);
                          setCustomerCreateOpen(true);
                        }}
                      >
                        <UserPlus className="size-4" />
                        Add new customer
                      </Button>
                    </div>
                  }
                >
                    {customersQuery.isPending ? (
                      <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                        Loading customers...
                      </p>
                    ) : customerRows.length > 0 ? (
                      customerRows.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          className="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm"
                          onClick={() => {
                            setForm((state) => ({ ...state, userId: customer.id }));
                            setCustomerPickerOpen(false);
                          }}
                        >
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium">{customer.name}</span>
                            <span className="text-muted-foreground truncate text-xs">
                              {customer.email}
                            </span>
                          </span>
                          {form.userId === customer.id ? (
                            <Check className="text-primary size-4 shrink-0" />
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                        No customers found.
                      </p>
                    )}
                </SearchablePickerContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Car</Label>
              <Popover open={carPickerOpen} onOpenChange={setCarPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={carPickerOpen}
                    className={cn(
                      "h-auto min-h-11 w-full justify-between rounded-md px-3 py-2 text-left font-normal",
                      !selectedCar && "text-muted-foreground",
                    )}
                  >
                    <span className="min-w-0">
                      {selectedCar ? (
                        <>
                          <span className="block truncate font-medium text-foreground">
                            {selectedCar.referenceNo} - {selectedCar.model.brand}{" "}
                            {selectedCar.model.name}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {selectedCar.chassisNo ?? "No chassis"} · {selectedCar.year}
                          </span>
                        </>
                      ) : (
                        "Search and select car"
                      )}
                    </span>
                    <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <SearchablePickerContent
                  placeholder="Search reference, title, chassis"
                  searchValue={carSearch}
                  onSearchChange={setCarSearch}
                  footer={
                    <div className="border-t bg-muted/20 p-3">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={openLedgerCarCreate}
                      >
                        <Plus className="size-4" />
                        Add ledger car
                      </Button>
                    </div>
                  }
                >
                    {carsQuery.isPending ? (
                      <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                        Loading cars...
                      </p>
                    ) : carRows.length > 0 ? (
                      carRows.map((car) => (
                        <button
                          key={car.id}
                          type="button"
                          className="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm"
                          onClick={() => {
                            setForm((state) => ({ ...state, carId: car.id }));
                            setCarPickerOpen(false);
                          }}
                        >
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium">
                              {car.referenceNo} - {car.model.brand} {car.model.name}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                              {car.chassisNo ?? "No chassis"} · {car.year}
                            </span>
                          </span>
                          {form.carId === car.id ? (
                            <Check className="text-primary size-4 shrink-0" />
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                        No cars found.
                      </p>
                    )}
                </SearchablePickerContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-total">Total amount</Label>
              <Input
                id="ledger-total"
                type="number"
                min="0"
                step="0.01"
                value={form.totalAmount}
                onChange={(event) => setForm((s) => ({ ...s, totalAmount: event.target.value }))}
              />
              {selectedCar ? (
                <p className="text-muted-foreground text-xs">
                  Listed JPY {selectedCar.priceJpy ?? "—"} / USD {selectedCar.priceUsd ?? "—"}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-currency">Currency</Label>
              <NativeSelect
                id="ledger-currency"
                value={form.currency}
                onChange={(event) => setForm((s) => ({ ...s, currency: event.target.value as LedgerCurrency }))}
              >
                {currencies.map((currency) => (
                  <NativeSelectOption key={currency} value={currency}>
                    {currency}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-deal-type">Deal Type</Label>
              <NativeSelect
                id="ledger-deal-type"
                value={form.dealType}
                onChange={(event) =>
                  setForm((s) => ({
                    ...s,
                    dealType: event.target.value as LedgerDealType,
                  }))
                }
              >
                {dealTypes.map((dealType) => (
                  <NativeSelectOption key={dealType} value={dealType}>
                    {dealTypeLabel(dealType)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-down">Down payment required</Label>
              <Input
                id="ledger-down"
                type="number"
                min="0"
                step="0.01"
                value={form.downPaymentRequired}
                onChange={(event) => setForm((s) => ({ ...s, downPaymentRequired: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-due">Down payment due date</Label>
              <Input
                id="ledger-due"
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((s) => ({ ...s, dueDate: event.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ledger-status-create">Status</Label>
              <NativeSelect
                id="ledger-status-create"
                value={form.status}
                onChange={(event) => setForm((s) => ({ ...s, status: event.target.value as LedgerDealStatus }))}
              >
                {dealStatuses.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {label(status)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ledger-note">Note</Label>
              <Textarea
                id="ledger-note"
                value={form.note}
                onChange={(event) => setForm((s) => ({ ...s, note: event.target.value }))}
              />
            </div>
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3 sm:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Car documents</h3>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Optional. Selected files will upload after the deal is created.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    setDocuments((state) => [...state, createDocumentDraft()])
                  }
                >
                  <Plus className="size-4" />
                  Add document
                </Button>
              </div>
              <div className="space-y-3">
                {documents.map((document, index) => (
                  <div
                    key={document.id}
                    className="grid gap-2 rounded-md border bg-background p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                  >
                    <div className="space-y-2">
                      <NativeSelect
                        value={document.type}
                        onChange={(event) => {
                          const nextType = event.target.value as LedgerDocumentType;
                          setDocuments((state) =>
                            state.map((item) =>
                              item.id === document.id
                                ? {
                                    ...item,
                                    type: nextType,
                                    title:
                                      item.title && item.title !== label(item.type)
                                        ? item.title
                                        : nextType === "OTHER"
                                          ? ""
                                          : label(nextType),
                                  }
                                : item,
                            ),
                          );
                        }}
                      >
                        {documentTypes.map((type) => (
                          <NativeSelectOption key={type} value={type}>
                            {label(type)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1.5">
                        <input
                          id={`ledger-document-file-${document.id}`}
                          type="file"
                          accept="application/pdf,image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={(event) =>
                            setDocuments((state) =>
                              state.map((item) =>
                                item.id === document.id
                                  ? { ...item, file: event.target.files?.[0] ?? null }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Button asChild variant="outline" className="w-full">
                          <label htmlFor={`ledger-document-file-${document.id}`}>
                            <FileUp className="size-4" />
                            Upload document
                          </label>
                        </Button>
                        <p className="text-muted-foreground truncate text-xs">
                          {document.file ? document.file.name : "No file selected"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-muted-foreground text-xs">Document {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={documents.length === 1}
                          onClick={() =>
                            setDocuments((state) =>
                              state.filter((item) => item.id !== document.id),
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Create deal"}
            </Button>
          </DialogFooter>
        </form>
        <Dialog open={customerCreateOpen} onOpenChange={setCustomerCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add new customer</DialogTitle>
              <DialogDescription>
                Create a customer account and select it for this ledger deal.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!canCreateCustomer) {
                  toast.error("Name, email and matching password are required.");
                  return;
                }
                createCustomerMutation.mutate(undefined);
              }}
            >
              <Input
                placeholder="Full name"
                value={newCustomer.name}
                onChange={(event) =>
                  setNewCustomer((state) => ({ ...state, name: event.target.value }))
                }
              />
              <Input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(event) =>
                  setNewCustomer((state) => ({ ...state, email: event.target.value }))
                }
              />
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Set password"
                value={newCustomer.password}
                onChange={(event) =>
                  setNewCustomer((state) => ({
                    ...state,
                    password: event.target.value,
                  }))
                }
              />
              {newCustomerPasswordError ? (
                <p className="text-destructive text-xs">{newCustomerPasswordError}</p>
              ) : null}
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm password"
                value={newCustomer.confirmPassword}
                onChange={(event) =>
                  setNewCustomer((state) => ({
                    ...state,
                    confirmPassword: event.target.value,
                  }))
                }
              />
              {newCustomerConfirmError ? (
                <p className="text-destructive text-xs">{newCustomerConfirmError}</p>
              ) : null}
              <Input
                placeholder="Phone"
                value={newCustomer.phone}
                onChange={(event) =>
                  setNewCustomer((state) => ({ ...state, phone: event.target.value }))
                }
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Country"
                  value={newCustomer.country}
                  onChange={(event) =>
                    setNewCustomer((state) => ({
                      ...state,
                      country: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="City"
                  value={newCustomer.city}
                  onChange={(event) =>
                    setNewCustomer((state) => ({ ...state, city: event.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomerCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCustomerMutation.isPending || !canCreateCustomer}
                >
                  {createCustomerMutation.isPending ? "Adding..." : "Add and select"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={carCreateOpen}
          onOpenChange={(nextOpen) => {
            setCarCreateOpen(nextOpen);
            if (!nextOpen) setNewCarImages([]);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add ledger car</DialogTitle>
              <DialogDescription>
                Create a car for this customer ledger. It stays hidden from the public
                website unless listing is enabled.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createCarMutation.mutate(undefined);
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ledger-car-reference">Reference no</Label>
                  <Input
                    id="ledger-car-reference"
                    value={newCar.referenceNo}
                    onChange={(event) =>
                      setNewCar((state) => ({
                        ...state,
                        referenceNo: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Popover open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={modelPickerOpen}
                        className={cn(
                          "h-10 w-full justify-between rounded-md px-3 text-left font-normal",
                          !selectedNewCarModel && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {selectedNewCarModel
                            ? `${selectedNewCarModel.brand} ${selectedNewCarModel.name}`
                            : "Search and select model"}
                        </span>
                        <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <SearchablePickerContent
                      placeholder="Search brand or model"
                      searchValue={modelSearch}
                      onSearchChange={setModelSearch}
                    >
                        {modelsQuery.isPending ? (
                          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                            Loading models...
                          </p>
                        ) : filteredModelRows.length > 0 ? (
                          filteredModelRows.map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              className="hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm"
                              onClick={() => {
                                setNewCar((state) => ({
                                  ...state,
                                  modelId: model.id,
                                }));
                                setModelSearch("");
                                setModelPickerOpen(false);
                              }}
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {model.brand} {model.name}
                              </span>
                              {newCar.modelId === model.id ? (
                                <Check className="text-primary size-4 shrink-0" />
                              ) : null}
                            </button>
                          ))
                        ) : (
                          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                            No models found.
                          </p>
                        )}
                    </SearchablePickerContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Popover open={yearPickerOpen} onOpenChange={setYearPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-10 w-full justify-between rounded-md px-3 text-left font-normal",
                          !newCar.year && "text-muted-foreground",
                        )}
                      >
                        <span>{newCar.year || "Select year"}</span>
                        <CalendarIcon className="text-muted-foreground size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-auto max-w-[calc(100vw-2rem)] p-0"
                    >
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={
                          newCar.year ? new Date(Number(newCar.year), 0, 1) : undefined
                        }
                        defaultMonth={
                          newCar.year
                            ? new Date(Number(newCar.year), 0, 1)
                            : new Date()
                        }
                        startMonth={new Date(1900, 0)}
                        endMonth={new Date(2100, 11)}
                        onSelect={(date) => {
                          if (!date) return;
                          setNewCar((state) => ({
                            ...state,
                            year: String(date.getFullYear()),
                          }));
                          setYearPickerOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ledger-car-chassis">Chassis no</Label>
                  <Input
                    id="ledger-car-chassis"
                    value={newCar.chassisNo}
                    onChange={(event) =>
                      setNewCar((state) => ({ ...state, chassisNo: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ledger-car-title">Title</Label>
                  <Input
                    id="ledger-car-title"
                    placeholder="Optional display title"
                    value={newCar.title}
                    onChange={(event) =>
                      setNewCar((state) => ({ ...state, title: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ledger-car-usd">USD price</Label>
                  <Input
                    id="ledger-car-usd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCar.priceUsd}
                    onChange={(event) =>
                      setNewCar((state) => ({ ...state, priceUsd: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ledger-car-jpy">JPY price</Label>
                  <Input
                    id="ledger-car-jpy"
                    type="number"
                    min="0"
                    step="1"
                    value={newCar.priceJpy}
                    onChange={(event) =>
                      setNewCar((state) => ({ ...state, priceJpy: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ledger-car-pkr">PKR price</Label>
                  <Input
                    id="ledger-car-pkr"
                    type="number"
                    min="0"
                    step="1"
                    value={newCar.pricePkr}
                    onChange={(event) =>
                      setNewCar((state) => ({ ...state, pricePkr: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-3 rounded-md border bg-muted/20 p-3 sm:col-span-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Car images</h3>
                        <Badge variant="secondary">{newCarImages.length}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Optional. Upload exterior, interior, or document photos for this
                        ledger car.
                      </p>
                    </div>
                    <div>
                      <input
                        id="ledger-car-images"
                        ref={carImageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          void uploadLedgerCarImages(event.target.files);
                          event.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={carImageUploadBusy}
                        onClick={() => carImageInputRef.current?.click()}
                      >
                        <FileUp className="size-4" />
                        {carImageUploadBusy ? "Uploading..." : "Upload images"}
                      </Button>
                    </div>
                  </div>
                  {newCarImages.length === 0 ? (
                    <div className="text-muted-foreground rounded-md border border-dashed bg-background px-3 py-5 text-center text-sm">
                      No car images yet. Click upload images to attach photos before
                      saving the car.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {newCarImages.map((image) => (
                        <div
                          key={image.id}
                          className="flex gap-3 rounded-md border bg-background p-2"
                        >
                          <div
                            role="img"
                            aria-label={image.fileName}
                            className="size-20 shrink-0 rounded-md bg-muted bg-cover bg-center"
                            style={{ backgroundImage: `url(${image.url})` }}
                          />
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <p className="truncate text-sm font-medium">{image.fileName}</p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant={image.isPrimary ? "secondary" : "outline"}
                                size="sm"
                                onClick={() =>
                                  setNewCarImages((state) =>
                                    state.map((item) => ({
                                      ...item,
                                      isPrimary: item.id === image.id,
                                    })),
                                  )
                                }
                              >
                                {image.isPrimary ? "Primary" : "Set primary"}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setNewCarImages((state) => {
                                    const next = state.filter((item) => item.id !== image.id);
                                    if (image.isPrimary && next[0]) {
                                      return next.map((item, index) => ({
                                        ...item,
                                        isPrimary: index === 0,
                                      }));
                                    }
                                    return next;
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
                  <Checkbox
                    id="ledger-car-published"
                    checked={newCar.isPublished}
                    onCheckedChange={(checked) =>
                      setNewCar((state) => ({ ...state, isPublished: checked === true }))
                    }
                  />
                  <Label htmlFor="ledger-car-published" className="font-normal">
                    List this car on website
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCarCreateOpen(false);
                    setNewCarImages([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createCarMutation.isPending ||
                    carImageUploadBusy ||
                    !newCar.referenceNo.trim() ||
                    !newCar.modelId ||
                    !newCar.year
                  }
                >
                  {createCarMutation.isPending ? "Adding..." : "Add and select car"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function DealDetailDialog({
  canUpdate,
  dealId,
  mode,
  onOpenChange,
  onChanged,
}: {
  canUpdate: boolean;
  dealId: string | null;
  mode: "view" | "edit";
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const queryClient = useQueryClient();
  const tabStateKey = `${dealId ?? "closed"}:${mode}:${canUpdate ? "update" : "view"}`;
  const defaultActiveTab = mode === "edit" && canUpdate ? "edit" : "payments";
  const [activeTabState, setActiveTabState] = useState({
    key: tabStateKey,
    value: defaultActiveTab,
  });
  const activeTab =
    activeTabState.key === tabStateKey ? activeTabState.value : defaultActiveTab;
  const detailQuery = useQuery({
    queryKey: ["admin-ledger-deal", dealId],
    queryFn: () => fetchLedgerDeal(dealId as string),
    enabled: Boolean(dealId),
  });
  const deal = detailQuery.data?.deal;

  const refresh = () => {
    if (dealId) {
      void queryClient.invalidateQueries({ queryKey: ["admin-ledger-deal", dealId] });
    }
    onChanged();
  };

  return (
    <Dialog open={Boolean(dealId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{deal ? deal.orderNumber : "Ledger detail"}</DialogTitle>
          <DialogDescription>
            Payments, documents, and notes for this customer car deal.
          </DialogDescription>
        </DialogHeader>
        {!deal ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            Loading ledger detail…
          </div>
        ) : (
          <div className="space-y-5">
            <DealSummary deal={deal} />
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTabState({ key: tabStateKey, value })}
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                {canUpdate ? (
                  <TabsTrigger value="edit">
                    <Pencil className="size-4" />
                    Edit
                  </TabsTrigger>
                ) : null}
                <TabsTrigger value="payments">
                  <Banknote className="size-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="shipment">
                  <Ship className="size-4" />
                  Shipment
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileUp className="size-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="images">
                  <ImageIcon className="size-4" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              {canUpdate ? (
                <TabsContent value="edit">
                  <EditDealTab key={`edit-${deal.id}`} deal={deal} onChanged={refresh} />
                </TabsContent>
              ) : null}
              <TabsContent value="payments">
                <PaymentsTab canUpdate={canUpdate} deal={deal} onChanged={refresh} />
              </TabsContent>
              <TabsContent value="shipment">
                <ShipmentTab
                  key={`shipment-${deal.id}`}
                  canUpdate={canUpdate}
                  deal={deal}
                  onChanged={refresh}
                />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentsTab canUpdate={canUpdate} deal={deal} onChanged={refresh} />
              </TabsContent>
              <TabsContent value="images">
                <CarImagesTab deal={deal} />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab canUpdate={canUpdate} deal={deal} onChanged={refresh} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DealSummary({ deal }: { deal: LedgerDeal }) {
  const primaryImage = deal.car.images[0];

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-3 xl:grid-cols-6">
      <div>
        <p className="text-muted-foreground text-xs uppercase">Customer</p>
        <p className="mt-1 font-semibold">{deal.user.name}</p>
        <p className="text-muted-foreground break-all text-xs">{deal.user.email}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase">Car</p>
        <div className="mt-1 flex items-center gap-3">
          {primaryImage ? (
            <div
              role="img"
              aria-label={primaryImage.altText ?? deal.car.referenceNo}
              className="size-12 shrink-0 rounded-md border bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url(${primaryImage.url})` }}
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {deal.car.model.brand} {deal.car.model.name}
            </p>
            <p className="text-muted-foreground text-xs">{deal.car.referenceNo}</p>
            <p className="text-muted-foreground text-xs">
              {deal.car.chassisNo ?? "No chassis"}
            </p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase">Deal type</p>
        <p className="mt-1 font-semibold">{dealTypeLabel(deal.dealType)}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase">Down payment</p>
        <p className="mt-1 font-semibold">
          {formatMoney(deal.downPaymentRequired, deal.currency)}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">Required</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase">Paid</p>
        <p className="mt-1 font-semibold">
          {formatMoney(deal.paymentSummary.paidAmount, deal.currency)}
        </p>
        <Progress value={deal.paymentSummary.paidPercent} className="mt-2 h-1.5" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase">Balance</p>
        <p className="mt-1 font-semibold">
          {formatMoney(deal.paymentSummary.remainingBalance, deal.currency)}
        </p>
        <Badge className="mt-2" variant={paymentBalanceVariant(deal)}>
          {paymentBalanceLabel(deal)}
        </Badge>
      </div>
    </div>
  );
}

function CarImagesTab({ deal }: { deal: LedgerDeal }) {
  const images = deal.car.images;
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  async function downloadImage(imageId: string) {
    setDownloadingImageId(imageId);
    try {
      const download = await getLedgerCarImageDownload(deal.id, imageId);
      triggerFileDownload(download.downloadUrl, download.fileName);
    } catch (error) {
      toast.error(formatErrorMessage(error));
    } finally {
      setDownloadingImageId(null);
    }
  }

  async function downloadAllImages() {
    setDownloadingAll(true);
    try {
      const downloads = await Promise.all(
        images.map((image) => getLedgerCarImageDownload(deal.id, image.id)),
      );
      triggerBatchDownloads(
        downloads.map((download) => ({
          url: download.downloadUrl,
          fileName: download.fileName,
        })),
      );
      toast.success(
        `Started ${downloads.length} image download${
          downloads.length === 1 ? "" : "s"
        }.`,
      );
    } catch (error) {
      toast.error(formatErrorMessage(error));
    } finally {
      setDownloadingAll(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Car images</h3>
          <p className="text-muted-foreground text-xs">
            {images.length} image{images.length === 1 ? "" : "s"} attached
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={images.length === 0 || downloadingAll}
          onClick={() => void downloadAllImages()}
        >
          <Download className="size-4" />
          {downloadingAll ? "Preparing..." : "Download all"}
        </Button>
      </div>
      {images.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border p-6 text-sm">
          No car images uploaded for this ledger car.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-lg border bg-background"
            >
              <div
                role="img"
                aria-label={image.altText ?? `Car image ${index + 1}`}
                className="aspect-4/3 w-full bg-muted bg-cover bg-center transition-transform group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${image.url})` }}
              />
              <div className="space-y-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">Image {index + 1}</p>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "Primary" : "Car image"}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={downloadingImageId === image.id}
                  onClick={() => void downloadImage(image.id)}
                >
                  <Download className="size-4" />
                  {downloadingImageId === image.id ? "Preparing..." : "Download"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditDealTab({ deal, onChanged }: { deal: LedgerDeal; onChanged: () => void }) {
  const [form, setForm] = useState({
    orderNumber: deal.orderNumber,
    totalAmount: String(deal.totalAmount),
    currency: deal.currency,
    dealType: deal.dealType,
    downPaymentRequired:
      deal.downPaymentRequired == null ? "" : String(deal.downPaymentRequired),
    dueDate: deal.dueDate ? new Date(deal.dueDate).toISOString().slice(0, 10) : "",
    status: deal.status,
    note: deal.note ?? "",
    chassisNo: deal.car.chassisNo ?? "",
  });

  const mutation = useApiMutation({
    mutationFn: async () => {
      if (!form.orderNumber.trim()) throw new ApiError("Order number is required.");
      if (!form.totalAmount) throw new ApiError("Total amount is required.");
      const trimmedChassis = form.chassisNo.trim();
      if (trimmedChassis !== (deal.car.chassisNo ?? "")) {
        await updateAdminCar(deal.car.id, { chassisNo: trimmedChassis });
      }
      return updateLedgerDeal(deal.id, {
        orderNumber: form.orderNumber.trim(),
        totalAmount: Number(form.totalAmount),
        currency: form.currency,
        dealType: form.dealType,
        downPaymentRequired: form.downPaymentRequired
          ? Number(form.downPaymentRequired)
          : null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        status: form.status,
        note: form.note.trim() || null,
      });
    },
    successToast: "Ledger deal updated.",
    onSuccess: onChanged,
  });

  return (
    <form
      className="mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(undefined);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-order">Order no</Label>
        <Input
          id="ledger-edit-order"
          value={form.orderNumber}
          onChange={(event) =>
            setForm((state) => ({ ...state, orderNumber: event.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-chassis">Chassis no</Label>
        <Input
          id="ledger-edit-chassis"
          value={form.chassisNo}
          placeholder="VIN or chassis number"
          onChange={(event) =>
            setForm((state) => ({ ...state, chassisNo: event.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-total">Total amount</Label>
        <Input
          id="ledger-edit-total"
          type="number"
          min="0"
          step="0.01"
          value={form.totalAmount}
          onChange={(event) =>
            setForm((state) => ({ ...state, totalAmount: event.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-currency">Currency</Label>
        <NativeSelect
          id="ledger-edit-currency"
          value={form.currency}
          onChange={(event) =>
            setForm((state) => ({
              ...state,
              currency: event.target.value as LedgerCurrency,
            }))
          }
        >
          {currencies.map((currency) => (
            <NativeSelectOption key={currency} value={currency}>
              {currency}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-deal-type">Deal Type</Label>
        <NativeSelect
          id="ledger-edit-deal-type"
          value={form.dealType}
          onChange={(event) =>
            setForm((state) => ({
              ...state,
              dealType: event.target.value as LedgerDealType,
            }))
          }
        >
          {dealTypes.map((dealType) => (
            <NativeSelectOption key={dealType} value={dealType}>
              {dealTypeLabel(dealType)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-down">Down payment required</Label>
        <Input
          id="ledger-edit-down"
          type="number"
          min="0"
          step="0.01"
          value={form.downPaymentRequired}
          onChange={(event) =>
            setForm((state) => ({
              ...state,
              downPaymentRequired: event.target.value,
            }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-due">Down payment due date</Label>
        <Input
          id="ledger-edit-due"
          type="date"
          value={form.dueDate}
          onChange={(event) =>
            setForm((state) => ({ ...state, dueDate: event.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-edit-status">Status</Label>
        <NativeSelect
          id="ledger-edit-status"
          value={form.status}
          onChange={(event) =>
            setForm((state) => ({
              ...state,
              status: event.target.value as LedgerDealStatus,
            }))
          }
        >
          {dealStatuses.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {label(status)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="ledger-edit-note">Note</Label>
        <Textarea
          id="ledger-edit-note"
          value={form.note}
          onChange={(event) =>
            setForm((state) => ({ ...state, note: event.target.value }))
          }
        />
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button
          type="submit"
          disabled={mutation.isPending || !form.orderNumber.trim() || !form.totalAmount}
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function PaymentsTab({
  canUpdate,
  deal,
  onChanged,
}: {
  canUpdate: boolean;
  deal: LedgerDeal;
  onChanged: () => void;
}) {
  const hasInitialDownPayment =
    deal.downPaymentRequired != null && deal.downPaymentRequired > 0;
  const [form, setForm] = useState({
    amount: "",
    type: (hasInitialDownPayment ? "INSTALLMENT" : "DOWN_PAYMENT") as LedgerPaymentType,
    method: "BANK_TRANSFER" as LedgerPaymentMethod,
    paidAt: new Date().toISOString().slice(0, 10),
    referenceNo: "",
    note: "",
  });
  const mutation = useApiMutation({
    mutationFn: () =>
      addLedgerPayment(deal.id, {
        amount: Number(form.amount),
        currency: deal.currency,
        type: form.type,
        method: form.method,
        paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : undefined,
        referenceNo: form.referenceNo.trim() || undefined,
        note: form.note.trim() || null,
      }),
    successToast: "Payment added.",
    onSuccess: () => {
      setForm((s) => ({ ...s, amount: "", referenceNo: "", note: "" }));
      onChanged();
    },
  });

  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      {canUpdate ? (
        <form
          className="space-y-3 rounded-lg border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.amount) {
              toast.error("Amount is required.");
              return;
            }
            mutation.mutate(undefined);
          }}
        >
        <h3 className="font-semibold">Add payment</h3>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder={`Amount in ${deal.currency}`}
          value={form.amount}
          onChange={(event) => setForm((s) => ({ ...s, amount: event.target.value }))}
        />
        <NativeSelect
          value={form.type}
          onChange={(event) => setForm((s) => ({ ...s, type: event.target.value as LedgerPaymentType }))}
        >
          {paymentTypes.map((type) => (
            <NativeSelectOption key={type} value={type}>{label(type)}</NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          value={form.method}
          onChange={(event) => setForm((s) => ({ ...s, method: event.target.value as LedgerPaymentMethod }))}
        >
          {paymentMethods.map((method) => (
            <NativeSelectOption key={method} value={method}>{label(method)}</NativeSelectOption>
          ))}
        </NativeSelect>
        <Input
          type="date"
          value={form.paidAt}
          onChange={(event) => setForm((s) => ({ ...s, paidAt: event.target.value }))}
        />
        <Input
          placeholder="Receipt/reference number"
          value={form.referenceNo}
          onChange={(event) => setForm((s) => ({ ...s, referenceNo: event.target.value }))}
        />
        <Textarea
          placeholder="Payment note"
          value={form.note}
          onChange={(event) => setForm((s) => ({ ...s, note: event.target.value }))}
        />
        <Button className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Adding..." : "Add payment"}
        </Button>
        </form>
      ) : null}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasInitialDownPayment ? (
              <TableRow>
                <TableCell>Down Payment</TableCell>
                <TableCell>
                  {formatMoney(deal.downPaymentRequired, deal.currency)}
                </TableCell>
                <TableCell>{format(new Date(deal.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>Initial down payment</TableCell>
              </TableRow>
            ) : null}
            {deal.payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{label(payment.type)}</TableCell>
                <TableCell>{formatMoney(payment.amount, payment.currency)}</TableCell>
                <TableCell>{format(new Date(payment.paidAt), "MMM d, yyyy")}</TableCell>
                <TableCell>{payment.referenceNo ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ShipmentTab({
  canUpdate,
  deal,
  onChanged,
}: {
  canUpdate: boolean;
  deal: LedgerDeal;
  onChanged: () => void;
}) {
  const [form, setForm] = useState({
    status: deal.status,
    shipmentOrigin: deal.shipmentOrigin ?? "",
    shipmentDestination: deal.shipmentDestination ?? "",
    shippingLine: deal.shippingLine ?? "",
    vesselName: deal.vesselName ?? "",
    estimatedDeparture: dateInputValue(deal.estimatedDeparture),
    estimatedArrival: dateInputValue(deal.estimatedArrival),
    bookingNo: deal.bookingNo ?? "",
    billOfLadingNo: deal.billOfLadingNo ?? "",
    shipmentNote: deal.shipmentNote ?? "",
  });

  const mutation = useApiMutation({
    mutationFn: () =>
      updateLedgerDeal(deal.id, {
        status: form.status,
        shipmentOrigin: form.shipmentOrigin.trim() || null,
        shipmentDestination: form.shipmentDestination.trim() || null,
        shippingLine: form.shippingLine.trim() || null,
        vesselName: form.vesselName.trim() || null,
        estimatedDeparture: form.estimatedDeparture
          ? new Date(form.estimatedDeparture).toISOString()
          : null,
        estimatedArrival: form.estimatedArrival
          ? new Date(form.estimatedArrival).toISOString()
          : null,
        bookingNo: form.bookingNo.trim() || null,
        billOfLadingNo: form.billOfLadingNo.trim() || null,
        shipmentNote: form.shipmentNote.trim() || null,
      }),
    successToast: "Shipment updated.",
    onSuccess: onChanged,
  });

  const previewOrigin = form.shipmentOrigin.trim() || "Origin pending";
  const previewDestination =
    form.shipmentDestination.trim() ||
    [deal.user.city, deal.user.country].filter(Boolean).join(", ") ||
    "Destination pending";
  const previewEta = form.estimatedArrival
    ? format(new Date(form.estimatedArrival), "MMM d, yyyy")
    : "Awaiting schedule";
  const previewVessel = form.vesselName.trim() || "Not added";
  const previewShippingLine = form.shippingLine.trim() || "Not added";
  const previewEstimatedDeparture = form.estimatedDeparture
    ? format(new Date(form.estimatedDeparture), "MMM d, yyyy")
    : "Not added";
  const previewEstimatedArrival = form.estimatedArrival
    ? format(new Date(form.estimatedArrival), "MMM d, yyyy")
    : "Not added";
  const previewNote = form.shipmentNote.trim() || "No shipment note added.";

  return (
    <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(460px,0.95fr)_minmax(0,1.05fr)]">
      {canUpdate ? (
        <form
          className="space-y-4 rounded-lg border bg-background p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate(undefined);
          }}
        >
        <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Ship className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold">Update shipment</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Saved values appear on the customer shipment tracking page.
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold">Tracking status</h4>
          <div className="mt-3 grid gap-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-status">
                Status
              </Label>
              <NativeSelect
                id="ledger-shipment-status"
                value={form.status}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    status: event.target.value as LedgerDealStatus,
                  }))
                }
              >
                {dealStatuses.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {label(status)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold">Route</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-origin">
                Origin
              </Label>
              <Input
                id="ledger-shipment-origin"
                placeholder="Yokohama, Japan"
                value={form.shipmentOrigin}
                onChange={(event) =>
                  setForm((state) => ({ ...state, shipmentOrigin: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-destination">
                Destination
              </Label>
              <Input
                id="ledger-shipment-destination"
                placeholder="Karachi, Pakistan"
                value={form.shipmentDestination}
                onChange={(event) =>
                  setForm((state) => ({ ...state, shipmentDestination: event.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-semibold">Carrier details</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-line">
                Shipping line
              </Label>
              <Input
                id="ledger-shipment-line"
                placeholder="Shipping company or line"
                value={form.shippingLine}
                onChange={(event) =>
                  setForm((state) => ({ ...state, shippingLine: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-vessel">
                Vessel
              </Label>
              <Input
                id="ledger-shipment-vessel"
                placeholder="Ocean Sakura"
                value={form.vesselName}
                onChange={(event) =>
                  setForm((state) => ({ ...state, vesselName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-etd">
                Estimated departure
              </Label>
              <Input
                id="ledger-shipment-etd"
                type="date"
                value={form.estimatedDeparture}
                onChange={(event) =>
                  setForm((state) => ({ ...state, estimatedDeparture: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-eta-detail">
                Estimated arrival
              </Label>
              <Input
                id="ledger-shipment-eta-detail"
                type="date"
                value={form.estimatedArrival}
                onChange={(event) =>
                  setForm((state) => ({ ...state, estimatedArrival: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-booking">
                Booking no
              </Label>
              <Input
                id="ledger-shipment-booking"
                placeholder="BK-ICC-77320"
                value={form.bookingNo}
                onChange={(event) =>
                  setForm((state) => ({ ...state, bookingNo: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-bl">
                BL no
              </Label>
              <Input
                id="ledger-shipment-bl"
                placeholder="Bill of lading number"
                value={form.billOfLadingNo}
                onChange={(event) =>
                  setForm((state) => ({ ...state, billOfLadingNo: event.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground" htmlFor="ledger-shipment-note">
              Customer note
            </Label>
            <Textarea
              id="ledger-shipment-note"
              className="min-h-24"
              placeholder="Short customer-visible shipment update"
              value={form.shipmentNote}
              onChange={(event) =>
                setForm((state) => ({ ...state, shipmentNote: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="sticky bottom-0 -mx-4 -mb-4 border-t bg-background/95 p-4 backdrop-blur">
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update shipment"}
          </Button>
        </div>
        </form>
      ) : null}

      <div className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold">Customer view preview</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              This is what the customer will see in shipment tracking.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            {label(form.status)}
          </Badge>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs uppercase">Order</p>
              <p className="mt-1 truncate text-lg font-semibold">{deal.orderNumber}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {deal.car.model.brand} {deal.car.model.name} · {deal.car.referenceNo}
              </p>
            </div>
            <div className="shrink-0 rounded-md border bg-background px-3 py-2 text-right">
              <p className="text-muted-foreground text-xs uppercase">ETA</p>
              <p className="font-semibold">{previewEta}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PreviewMetric label="Shipping line" value={previewShippingLine} />
          <PreviewMetric label="Vessel" value={previewVessel} />
          <PreviewMetric label="Documents" value={`${deal.documents.length} attached`} />
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Route</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
            <RoutePoint label="Origin" value={previewOrigin} />
            <span className="hidden h-px w-10 bg-border sm:block" />
            <RoutePoint label="Destination" value={previewDestination} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewDetail label="Estimated departure" value={previewEstimatedDeparture} />
          <PreviewDetail label="Estimated arrival" value={previewEstimatedArrival} />
          <PreviewDetail label="Booking no" value={form.bookingNo.trim() || "Not added"} />
          <PreviewDetail label="BL no" value={form.billOfLadingNo.trim() || "Not added"} />
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-muted-foreground text-xs uppercase">Shipment note</p>
          <p className="mt-2 text-sm leading-6">{previewNote}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({ label: metricLabel, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-muted-foreground text-xs uppercase">{metricLabel}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}

function PreviewDetail({ label: detailLabel, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs uppercase">{detailLabel}</p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  );
}

function RoutePoint({ label: pointLabel, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <p className="text-muted-foreground text-xs uppercase">{pointLabel}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function DocumentsTab({
  canUpdate,
  deal,
  onChanged,
}: {
  canUpdate: boolean;
  deal: LedgerDeal;
  onChanged: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "OTHER" as LedgerDocumentType,
    visibleToCustomer: "true",
    note: "",
  });

  const uploadMutation = useApiMutation({
    mutationFn: async () => {
      if (!file) throw new ApiError("Select a file first.");
      const meta = getFileMeta(file);
      if (!meta) throw new ApiError("Only PDF, JPG, PNG, or WEBP files are supported.");
      return uploadLedgerDocumentFile(deal.id, {
        type: form.type,
        title: form.title.trim() || file.name,
        file,
        visibleToCustomer: form.visibleToCustomer === "true",
        note: form.note.trim() || null,
      });
    },
    successToast: "Document uploaded.",
    onSuccess: () => {
      setFile(null);
      setForm({ title: "", type: "OTHER", visibleToCustomer: "true", note: "" });
      onChanged();
    },
  });
  const downloadAllMutation = useApiMutation({
    mutationFn: async () =>
      Promise.all(
        deal.documents.map(async (document) => ({
          document,
          download: await getLedgerDocumentDownload(deal.id, document.id),
        })),
      ),
    successToast: (downloads) =>
      `Started ${downloads.length} document download${
        downloads.length === 1 ? "" : "s"
      }.`,
    onSuccess: (downloads) => {
      triggerBatchDownloads(
        downloads.map(({ document, download }) => ({
          url: download.downloadUrl,
          fileName: document.fileName,
        })),
      );
    },
  });

  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      {canUpdate ? (
        <form
          className="space-y-3 rounded-lg border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            uploadMutation.mutate(undefined);
          }}
        >
        <div>
          <h3 className="font-semibold">Upload car document</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            PDF or image files are supported. Upload one document at a time.
          </p>
        </div>
        <Input
          value={form.title}
          placeholder="Document title"
          onChange={(event) => setForm((s) => ({ ...s, title: event.target.value }))}
        />
        <NativeSelect
          value={form.type}
          onChange={(event) => setForm((s) => ({ ...s, type: event.target.value as LedgerDocumentType }))}
        >
          {documentTypes.map((type) => (
            <NativeSelectOption key={type} value={type}>{label(type)}</NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          value={form.visibleToCustomer}
          onChange={(event) => setForm((s) => ({ ...s, visibleToCustomer: event.target.value }))}
        >
          <NativeSelectOption value="true">Visible to customer</NativeSelectOption>
          <NativeSelectOption value="false">Admin only</NativeSelectOption>
        </NativeSelect>
        <div className="space-y-1.5">
          <input
            id="ledger-detail-document-file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Button asChild variant="outline" className="w-full">
            <label htmlFor="ledger-detail-document-file">
              <FileUp className="size-4" />
              Upload document
            </label>
          </Button>
          <p className="text-muted-foreground truncate text-xs">
            {file ? file.name : "No file selected"}
          </p>
        </div>
        <Textarea
          placeholder="Document note"
          value={form.note}
          onChange={(event) => setForm((s) => ({ ...s, note: event.target.value }))}
        />
        <Button className="w-full" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? "Uploading..." : "Upload document"}
        </Button>
        </form>
      ) : null}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Uploaded documents</h3>
            <p className="text-muted-foreground text-xs">
              {deal.documents.length} document{deal.documents.length === 1 ? "" : "s"} attached
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deal.documents.length === 0 || downloadAllMutation.isPending}
            onClick={() => downloadAllMutation.mutate(undefined)}
          >
            <Download className="size-4" />
            {downloadAllMutation.isPending ? "Preparing..." : "Download all"}
          </Button>
        </div>
        {deal.documents.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border p-6 text-sm">
            No documents uploaded for this deal.
          </div>
        ) : (
          <div className="grid gap-3">
            {deal.documents.map((document) => (
              <DocumentRow key={document.id} dealId={deal.id} document={document} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentRow({
  dealId,
  document,
}: {
  dealId: string;
  document: LedgerDocument;
}) {
  const downloadMutation = useApiMutation({
    mutationFn: () => getLedgerDocumentDownload(dealId, document.id),
    onSuccess: (data) => {
      triggerFileDownload(data.downloadUrl, document.fileName);
    },
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{document.title}</p>
          <Badge variant="outline">{label(document.type)}</Badge>
          <Badge variant={document.visibleToCustomer ? "default" : "secondary"}>
            {document.visibleToCustomer ? "Customer visible" : "Admin only"}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 truncate text-xs">
          {document.fileName} · {format(new Date(document.createdAt), "MMM d, yyyy")}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={downloadMutation.isPending}
        onClick={() => downloadMutation.mutate(undefined)}
      >
        <Download className="size-4" />
        Download
      </Button>
    </div>
  );
}

function NotesTab({
  canUpdate,
  deal,
  onChanged,
}: {
  canUpdate: boolean;
  deal: LedgerDeal;
  onChanged: () => void;
}) {
  const [message, setMessage] = useState("");
  const noteEvents = useMemo(
    () => deal.events.filter((event) => event.type === "NOTE_ADDED"),
    [deal.events],
  );
  const mutation = useApiMutation({
    mutationFn: () => createLedgerNote(deal.id, message),
    successToast: "Note added.",
    onSuccess: () => {
      setMessage("");
      onChanged();
    },
  });

  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      {canUpdate ? (
        <form
          className="space-y-3 rounded-lg border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!message.trim()) return;
            mutation.mutate(undefined);
          }}
        >
          <h3 className="font-semibold">Add note</h3>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Internal admin note"
          />
          <Button className="w-full" disabled={mutation.isPending || !message.trim()}>
            {mutation.isPending ? "Adding..." : "Add note"}
          </Button>
        </form>
      ) : null}
      <div className="space-y-3">
        {noteEvents.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border p-6 text-sm">
            No notes yet.
          </div>
        ) : (
          noteEvents.map((event) => (
            <div key={event.id} className="rounded-lg border p-4">
              <p className="text-sm">{event.message}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                {format(new Date(event.createdAt), "MMM d, yyyy h:mm a")}
                {event.createdBy ? ` · ${event.createdBy.name}` : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function LedgerPage() {
  const hasPermission = useAdminAuthStore((state) => state.hasPermission);
  if (!hasPermission("ledgerRead")) return <ForbiddenPage />;
  return (
    <Suspense fallback={null}>
      <LedgerPageContent />
    </Suspense>
  );
}
