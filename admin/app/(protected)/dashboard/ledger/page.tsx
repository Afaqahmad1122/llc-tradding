"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Banknote,
  Check,
  ChevronsUpDown,
  Download,
  FileUp,
  Plus,
  ReceiptText,
  SearchIcon,
  UserPlus,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { ForbiddenPage } from "@/components/auth/permission-guard";
import {
  AdminDataPageHeader,
  AdminDataPanel,
} from "@/components/layout/admin-data-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { fetchAdminCars } from "@/lib/api/cars";
import {
  createAdminCustomer,
  fetchAdminCustomers,
  type AdminCustomer,
} from "@/lib/api/users";
import { cn } from "@/lib/utils";
import {
  addLedgerPayment,
  createLedgerDeal,
  createLedgerDocument,
  createLedgerNote,
  fetchLedgerDeal,
  fetchLedgerDeals,
  getLedgerDocumentDownload,
  presignLedgerDocument,
  type CreateLedgerDealBody,
  type LedgerCurrency,
  type LedgerDeal,
  type LedgerDealStatus,
  type LedgerDocument,
  type LedgerDocumentType,
  type LedgerPaymentMethod,
  type LedgerPaymentType,
} from "@/lib/api/ledger";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 400;

const currencies: LedgerCurrency[] = ["JPY", "USD", "PKR", "AED"];
const dealStatuses: LedgerDealStatus[] = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "IN_TRANSIT",
  "ARRIVED",
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

function formatMoney(amount: number | null | undefined, currency: string) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${currency} ${amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
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

function LedgerPageContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LedgerDealStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "OVERDUE" | "FULLY_PAID" | "BALANCE_PENDING"
  >("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const dealsQuery = useQuery({
    queryKey: ["admin-ledger-deals", page, debouncedSearch, statusFilter, paymentFilter],
    queryFn: () =>
      fetchLedgerDeals({
        page,
        pageSize: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(paymentFilter !== "all" ? { paymentStatus: paymentFilter } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const rows = dealsQuery.data?.data ?? [];
  const totalItems = dealsQuery.data?.pagination.total ?? 0;
  const totalPages = dealsQuery.data?.pagination.totalPages ?? 0;

  const refreshDeals = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-ledger-deals"] });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 pb-12 pt-8 sm:px-7 sm:pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminDataPageHeader
          icon={ReceiptText}
          title="Ledger"
          description="Track every customer car deal, down payment, balance, documents, and admin notes."
        />
        <Button className="h-10 rounded-md" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New deal
        </Button>
      </div>

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
        table={<LedgerTable rows={rows} onSelect={setSelectedDealId} />}
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
        onOpenChange={(open) => {
          if (!open) setSelectedDealId(null);
        }}
        onChanged={() => void refreshDeals()}
      />
    </div>
  );
}

function LedgerTable({
  rows,
  onSelect,
}: {
  rows: LedgerDeal[];
  onSelect: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4 sm:pl-5">Customer</TableHead>
          <TableHead>Car</TableHead>
          <TableHead className="hidden lg:table-cell">Total</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="pr-4 text-right sm:pr-5">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((deal) => (
          <TableRow key={deal.id}>
            <TableCell className="pl-4 sm:pl-5">
              <p className="font-medium">{deal.user.name}</p>
              <p className="text-muted-foreground mt-0.5 break-all text-xs">{deal.user.email}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{deal.orderNumber}</p>
            </TableCell>
            <TableCell>
              <p className="font-medium">{deal.car.model.brand} {deal.car.model.name}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{deal.car.referenceNo}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{deal.car.chassisNo ?? "No chassis"}</p>
            </TableCell>
            <TableCell className="hidden tabular-nums lg:table-cell">
              {formatMoney(deal.totalAmount, deal.currency)}
              <p className="text-muted-foreground mt-1 text-xs">
                Paid {formatMoney(deal.paymentSummary.paidAmount, deal.currency)}
              </p>
            </TableCell>
            <TableCell className="min-w-36">
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
            <TableCell className="hidden md:table-cell">
              <div className="flex flex-col gap-1">
                <Badge variant={deal.status === "CANCELLED" ? "destructive" : "outline"}>
                  {label(deal.status)}
                </Badge>
                <Badge variant={deal.paymentSummary.remainingBalance <= 0 ? "default" : "secondary"}>
                  {label(deal.paymentSummary.paymentStatus)}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="pr-4 text-right sm:pr-5">
              <Button variant="outline" size="sm" onClick={() => onSelect(deal.id)}>
                Open
              </Button>
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
  const [createdCustomer, setCreatedCustomer] = useState<AdminCustomer | null>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
  });
  const [form, setForm] = useState({
    userId: "",
    carId: "",
    totalAmount: "",
    currency: "JPY" as LedgerCurrency,
    downPaymentRequired: "",
    dueDate: "",
    status: "CONFIRMED" as LedgerDealStatus,
    note: "",
  });
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

  const createMutation = useApiMutation({
    mutationFn: (body: CreateLedgerDealBody) => createLedgerDeal(body),
    successToast: "Ledger deal created.",
    onSuccess: onCreated,
  });

  const createCustomerMutation = useApiMutation({
    mutationFn: () =>
      createAdminCustomer({
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        phone: newCustomer.phone.trim() || undefined,
        country: newCustomer.country.trim() || undefined,
        city: newCustomer.city.trim() || undefined,
      }),
    successToast: "Customer added.",
    onSuccess: (data) => {
      setCreatedCustomer(data.customer);
      setForm((state) => ({ ...state, userId: data.customer.id }));
      setCustomerSearch(data.customer.email);
      setNewCustomer({ name: "", email: "", phone: "", country: "", city: "" });
      setShowNewCustomer(false);
      setCustomerPickerOpen(false);
      void customersQuery.refetch();
    },
  });

  const selectedCar = carsQuery.data?.data.find((car) => car.id === form.carId);
  const selectedCustomer =
    customersQuery.data?.data.find((customer) => customer.id === form.userId) ??
    (createdCustomer?.id === form.userId ? createdCustomer : undefined);
  const customerRows = customersQuery.data?.data ?? [];

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
                <PopoverContent align="start" className="w-[min(560px,calc(100vw-3rem))] gap-0 p-0">
                  <div className="border-b p-3">
                    <div className="relative">
                      <SearchIcon
                        className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                        aria-hidden
                      />
                      <Input
                        autoFocus
                        placeholder="Search name or email"
                        className="pl-9"
                        value={customerSearch}
                        onChange={(event) => {
                          setCustomerSearch(event.target.value);
                          setShowNewCustomer(false);
                        }}
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto p-2">
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
                            setShowNewCustomer(false);
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
                  </div>

                  <div className="border-t bg-muted/20 p-3">
                    {!showNewCustomer ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => {
                          setShowNewCustomer(true);
                          setNewCustomer((state) => ({
                            ...state,
                            email: customerSearch.includes("@")
                              ? customerSearch
                              : state.email,
                            name: !customerSearch.includes("@")
                              ? customerSearch
                              : state.name,
                          }));
                        }}
                      >
                        <UserPlus className="size-4" />
                        Add new customer
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">Add new customer</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setShowNewCustomer(false)}
                          >
                            Cancel
                          </Button>
                        </div>
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
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={
                      createCustomerMutation.isPending ||
                      !newCustomer.name.trim() ||
                      !newCustomer.email.trim()
                    }
                    onClick={() => createCustomerMutation.mutate(undefined)}
                  >
                    {createCustomerMutation.isPending
                      ? "Adding customer..."
                      : "Add and select customer"}
                  </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledger-car-search">Find car</Label>
              <Input
                id="ledger-car-search"
                placeholder="Search reference, title, chassis"
                value={carSearch}
                onChange={(event) => setCarSearch(event.target.value)}
              />
              <NativeSelect
                value={form.carId}
                onChange={(event) => setForm((s) => ({ ...s, carId: event.target.value }))}
              >
                <NativeSelectOption value="">Select car</NativeSelectOption>
                {(carsQuery.data?.data ?? []).map((car) => (
                  <NativeSelectOption key={car.id} value={car.id}>
                    {car.referenceNo} - {car.model.brand} {car.model.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
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
              <Label htmlFor="ledger-due">Due date</Label>
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DealDetailDialog({
  dealId,
  onOpenChange,
  onChanged,
}: {
  dealId: string | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const queryClient = useQueryClient();
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
            <Tabs defaultValue="payments">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="payments">
                  <Banknote className="size-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileUp className="size-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="payments">
                <PaymentsTab deal={deal} onChanged={refresh} />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentsTab deal={deal} onChanged={refresh} />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab deal={deal} onChanged={refresh} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DealSummary({ deal }: { deal: LedgerDeal }) {
  return (
    <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-4">
      <div>
        <p className="text-muted-foreground text-xs uppercase">Customer</p>
        <p className="mt-1 font-semibold">{deal.user.name}</p>
        <p className="text-muted-foreground break-all text-xs">{deal.user.email}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase">Car</p>
        <p className="mt-1 font-semibold">{deal.car.model.brand} {deal.car.model.name}</p>
        <p className="text-muted-foreground text-xs">{deal.car.referenceNo}</p>
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
        <Badge className="mt-2" variant={deal.paymentSummary.isOverdue ? "destructive" : "outline"}>
          {deal.paymentSummary.isOverdue ? "Overdue" : label(deal.paymentSummary.paymentStatus)}
        </Badge>
      </div>
    </div>
  );
}

function PaymentsTab({ deal, onChanged }: { deal: LedgerDeal; onChanged: () => void }) {
  const [form, setForm] = useState({
    amount: "",
    type: "DOWN_PAYMENT" as LedgerPaymentType,
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

function DocumentsTab({ deal, onChanged }: { deal: LedgerDeal; onChanged: () => void }) {
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
      const presigned = await presignLedgerDocument(deal.id, meta);
      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": meta.contentType },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new ApiError("Document upload failed.");
      }
      return createLedgerDocument(deal.id, {
        type: form.type,
        title: form.title.trim() || file.name,
        fileKey: presigned.key,
        fileUrl: presigned.fileUrl,
        fileName: file.name,
        mimeType: meta.contentType,
        fileSize: file.size,
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

  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <form
        className="space-y-3 rounded-lg border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate(undefined);
        }}
      >
        <h3 className="font-semibold">Upload document</h3>
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
        <Input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <Textarea
          placeholder="Document note"
          value={form.note}
          onChange={(event) => setForm((s) => ({ ...s, note: event.target.value }))}
        />
        <Button className="w-full" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? "Uploading..." : "Upload document"}
        </Button>
      </form>
      <div className="grid gap-3">
        {deal.documents.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border p-6 text-sm">
            No documents uploaded for this deal.
          </div>
        ) : (
          deal.documents.map((document) => (
            <DocumentRow key={document.id} dealId={deal.id} document={document} />
          ))
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
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
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

function NotesTab({ deal, onChanged }: { deal: LedgerDeal; onChanged: () => void }) {
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
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);
  if (!isAdmin()) return <ForbiddenPage />;
  return <LedgerPageContent />;
}
