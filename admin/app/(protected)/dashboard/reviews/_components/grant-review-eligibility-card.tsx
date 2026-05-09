"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  SearchIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/client";
import { fetchAdminCars, type AdminCar } from "@/lib/api/cars";
import {
  createBuyerReviewEligibility,
  fetchReviewEligibilities,
  type ReviewEligibilityAdmin,
} from "@/lib/api/reviews";
import { fetchAdminCustomers, type AdminCustomer } from "@/lib/api/users";
import { cn } from "@/lib/utils";

const ELIG_PAGE_SIZE = 8;
const CUSTOMER_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

type EligibilityFilter = "all" | "pending" | "used";

type DialogStep = "confirm" | "success";

export function GrantReviewEligibilityCard() {
  const queryClient = useQueryClient();

  const [customerSearchInput, setCustomerSearchInput] = useState("");
  const [customerPage, setCustomerPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("confirm");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(
    null,
  );
  const [carSearchInput, setCarSearchInput] = useState("");
  const [selectedCar, setSelectedCar] = useState<AdminCar | null>(null);
  const [expiresAtLocal, setExpiresAtLocal] = useState("");
  const [copied, setCopied] = useState(false);

  const [eligPage, setEligPage] = useState(1);
  const [eligFilter, setEligFilter] = useState<EligibilityFilter>("pending");

  const debouncedCustomerSearch = useDebouncedValue(
    customerSearchInput,
    SEARCH_DEBOUNCE_MS,
  );

  const debouncedCarSearch = useDebouncedValue(
    dialogOpen && dialogStep === "confirm" ? carSearchInput : "",
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setCustomerPage(1);
  }, [debouncedCustomerSearch]);

  const resetClosedDialogState = useCallback(() => {
    setDialogStep("confirm");
    setSelectedCustomer(null);
    setCarSearchInput("");
    setSelectedCar(null);
    setExpiresAtLocal("");
    setCopied(false);
  }, []);

  const eligIsUsedParam =
    eligFilter === "pending"
      ? false
      : eligFilter === "used"
        ? true
        : undefined;

  const eligQuery = useQuery({
    queryKey: ["admin-review-eligibilities", eligPage, eligFilter],
    queryFn: () =>
      fetchReviewEligibilities({
        page: eligPage,
        pageSize: ELIG_PAGE_SIZE,
        ...(eligIsUsedParam !== undefined ? { isUsed: eligIsUsedParam } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const customersQuery = useQuery({
    queryKey: ["admin-customers", debouncedCustomerSearch, customerPage],
    queryFn: () =>
      fetchAdminCustomers({
        q: debouncedCustomerSearch,
        page: customerPage,
        pageSize: CUSTOMER_PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const carsPickQuery = useQuery({
    queryKey: ["admin-cars-review-pick", debouncedCarSearch],
    queryFn: () =>
      fetchAdminCars({
        search: debouncedCarSearch || undefined,
        page: 1,
        pageSize: 10,
        sort: "latest",
      }),
    enabled: dialogOpen && dialogStep === "confirm",
    placeholderData: keepPreviousData,
  });

  const grantMutation = useMutation({
    mutationFn: createBuyerReviewEligibility,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-review-eligibilities"],
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setDialogStep("success");
    },
  });

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        resetClosedDialogState();
        grantMutation.reset();
      }
    },
    [grantMutation, resetClosedDialogState],
  );

  const openAllowDialog = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setCarSearchInput("");
    setSelectedCar(null);
    setExpiresAtLocal("");
    setDialogStep("confirm");
    grantMutation.reset();
    setCopied(false);
    setDialogOpen(true);
  };

  const handleConfirmGrant = () => {
    if (!selectedCustomer) return;
    const payload: {
      userId: string;
      carId?: string;
      expiresAt?: string;
    } = { userId: selectedCustomer.id };
    if (selectedCar) {
      payload.carId = selectedCar.id;
    }
    if (expiresAtLocal.trim()) {
      const parsed = new Date(expiresAtLocal);
      if (!Number.isNaN(parsed.getTime())) {
        payload.expiresAt = parsed.toISOString();
      }
    }
    grantMutation.mutate(payload);
  };

  const copyInvoiceReference = async () => {
    const code = grantMutation.data?.eligibility.invoiceReference;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const eligPagination = eligQuery.data?.pagination;
  const eligTotalPages = eligPagination?.totalPages ?? 0;
  const eligCanPrev = eligPage > 1;
  const eligCanNext = eligTotalPages > 0 && eligPage < eligTotalPages;

  const custPagination = customersQuery.data?.pagination;
  const custTotalPages = custPagination?.totalPages ?? 0;
  const custCanPrev = customerPage > 1;
  const custCanNext = custTotalPages > 0 && customerPage < custTotalPages;

  const carsList = carsPickQuery.data?.data ?? [];
  const successInvoice =
    grantMutation.data?.eligibility.invoiceReference ?? "";
  const successHint = grantMutation.data?.reviewCodeHint ?? "";

  return (
    <>
      <Card size="sm">
        <CardHeader className="border-border border-b">
          <CardTitle className="text-base">Allow a customer review</CardTitle>
          <CardDescription>
            Find a registered buyer, click the checkmark, optionally link a
            vehicle from inventory — we set their review code automatically (vehicle
            stock reference or a generated RVW code to share).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label htmlFor="customer-review-search" className="sr-only">
              Search customers
            </Label>
            <div className="relative">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="customer-review-search"
                placeholder="Search by name or email…"
                value={customerSearchInput}
                onChange={(e) => setCustomerSearchInput(e.target.value)}
                className="pl-9"
                autoComplete="off"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Leave search empty to see the most recently registered buyers first.
            </p>

            <div className="relative min-h-48 rounded-lg border">
              {customersQuery.isPending && !customersQuery.data ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="size-6" />
                </div>
              ) : customersQuery.data?.data.length === 0 ? (
                <p className="text-muted-foreground p-4 text-sm">
                  No buyer accounts match this search.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Customer</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Joined
                      </TableHead>
                      <TableHead className="w-14 pr-4 text-right">
                        Allow
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersQuery.data?.data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="max-w-[140px] pl-4 whitespace-normal">
                          <span className="font-medium">{row.name}</span>
                          <p className="text-muted-foreground mt-0.5 truncate text-xs md:hidden">
                            {row.email}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden max-w-[220px] whitespace-normal md:table-cell">
                          <span className="break-all">{row.email}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden tabular-nums text-xs sm:table-cell">
                          {format(new Date(row.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            aria-label={`Allow ${row.name} to submit a review`}
                            onClick={() => openAllowDialog(row)}
                          >
                            <CheckCircle2Icon className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {customersQuery.isFetching && customersQuery.data ? (
                <div
                  className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-14"
                  aria-busy
                  aria-label="Loading"
                >
                  <Spinner className="text-muted-foreground size-5" />
                </div>
              ) : null}
            </div>

            {custTotalPages > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-center text-xs sm:text-left">
                  Page{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {customerPage}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {custTotalPages}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!custCanPrev || customersQuery.isFetching}
                    onClick={() =>
                      setCustomerPage((p) => Math.max(1, p - 1))
                    }
                  >
                    <ChevronLeftIcon data-icon="inline-start" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!custCanNext || customersQuery.isFetching}
                    onClick={() => setCustomerPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-foreground text-sm font-medium">
                  Review permissions
                </h3>
                <p className="text-muted-foreground text-xs">
                  Pending rows are unused invitations; used rows consumed after a
                  review was submitted.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground whitespace-nowrap">
                  Show
                </span>
                <NativeSelect
                  value={eligFilter}
                  onChange={(e) => {
                    setEligFilter(e.target.value as EligibilityFilter);
                    setEligPage(1);
                  }}
                  className="min-w-36"
                >
                  <NativeSelectOption value="pending">
                    Pending only
                  </NativeSelectOption>
                  <NativeSelectOption value="used">Used only</NativeSelectOption>
                  <NativeSelectOption value="all">All</NativeSelectOption>
                </NativeSelect>
              </label>
            </div>

            {eligQuery.isError ? (
              <Alert variant="destructive" role="alert">
                <AlertTitle>Could not load permissions</AlertTitle>
                <AlertDescription>
                  {eligQuery.error instanceof ApiError
                    ? eligQuery.error.message
                    : "Something went wrong. Try again."}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="relative min-h-32 rounded-lg border">
              {eligQuery.isPending && !eligQuery.data ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="size-6" />
                </div>
              ) : eligQuery.data?.data.length === 0 ? (
                <p className="text-muted-foreground p-4 text-sm">
                  No eligibility rows match this filter.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {eligQuery.data?.data.map((row) => (
                    <EligibilityRow key={row.id} row={row} />
                  ))}
                </ul>
              )}
              {eligQuery.isFetching && eligQuery.data ? (
                <div
                  className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-10"
                  aria-busy
                  aria-label="Loading"
                >
                  <Spinner className="text-muted-foreground size-5" />
                </div>
              ) : null}
            </div>

            {eligTotalPages > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-center text-xs sm:text-left">
                  Page{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {eligPage}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {eligTotalPages}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!eligCanPrev || eligQuery.isFetching}
                    onClick={() => setEligPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeftIcon data-icon="inline-start" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!eligCanNext || eligQuery.isFetching}
                    onClick={() => setEligPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-lg" showCloseButton>
          {dialogStep === "confirm" && selectedCustomer ? (
            <>
              <DialogHeader>
                <DialogTitle>Allow review</DialogTitle>
                <DialogDescription>
                  Confirm access for{" "}
                  <span className="text-foreground font-medium">
                    {selectedCustomer.name}
                  </span>
                  . They must be signed in on the website when they submit.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-1 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                <p className="text-foreground font-medium">
                  {selectedCustomer.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-car-search">
                  Vehicle (optional)
                </Label>
                <Input
                  id="review-car-search"
                  placeholder="Search stock ref, title, chassis…"
                  value={carSearchInput}
                  onChange={(e) => setCarSearchInput(e.target.value)}
                  autoComplete="off"
                />
                <p className="text-muted-foreground text-xs">
                  If you pick a listing, their review code becomes that
                  vehicle&apos;s stock reference. Otherwise we generate an RVW code
                  for you to share.
                </p>

                {selectedCar ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {selectedCar.referenceNo}
                    </Badge>
                    <span className="text-muted-foreground max-w-full truncate text-xs">
                      {selectedCar.title ?? selectedCar.model.name}{" "}
                      · {selectedCar.year}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-7"
                      onClick={() => setSelectedCar(null)}
                    >
                      Clear
                    </Button>
                  </div>
                ) : null}

                <ScrollArea className="h-40 rounded-md border">
                  <div className="p-1">
                    {carsPickQuery.isPending && !carsPickQuery.data ? (
                      <div className="flex justify-center py-6">
                        <Spinner className="size-5" />
                      </div>
                    ) : carsList.length === 0 ? (
                      <p className="text-muted-foreground px-2 py-4 text-center text-xs">
                        {debouncedCarSearch.trim()
                          ? `No vehicles match "${debouncedCarSearch}".`
                          : "No vehicles found."}
                      </p>
                    ) : (
                      <ul className="space-y-0.5">
                        {carsList.map((car) => (
                          <li key={car.id}>
                            <button
                              type="button"
                              className={cn(
                                "hover:bg-muted/80 flex w-full flex-col items-start rounded-md px-2 py-2 text-left text-xs transition-colors",
                                selectedCar?.id === car.id &&
                                  "bg-muted ring-1 ring-foreground/15",
                              )}
                              onClick={() => setSelectedCar(car)}
                            >
                              <span className="font-mono font-medium">
                                {car.referenceNo}
                              </span>
                              <span className="text-muted-foreground line-clamp-2">
                                {car.title ?? car.model.name} · {car.year}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-dialog-expires">
                  Expires (optional)
                </Label>
                <Input
                  id="review-dialog-expires"
                  type="datetime-local"
                  value={expiresAtLocal}
                  onChange={(e) => setExpiresAtLocal(e.target.value)}
                />
              </div>

              {grantMutation.isError ? (
                <Alert variant="destructive" role="alert">
                  <AlertTitle>Could not grant permission</AlertTitle>
                  <AlertDescription>
                    {grantMutation.error instanceof ApiError
                      ? grantMutation.error.message
                      : "Something went wrong. Try again."}
                  </AlertDescription>
                </Alert>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={grantMutation.isPending}
                  onClick={handleConfirmGrant}
                >
                  {grantMutation.isPending ? (
                    <>
                      <Spinner className="size-4" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2Icon data-icon="inline-start" />
                      Confirm allow review
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : null}

          {dialogStep === "success" ? (
            <>
              <DialogHeader>
                <DialogTitle>Review access granted</DialogTitle>
                <DialogDescription>{successHint}</DialogDescription>
              </DialogHeader>

              <div className="space-y-2 rounded-lg border bg-muted/25 px-3 py-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Internal reference
                </p>
                <p className="text-muted-foreground text-xs">
                  For your records only — the buyer submits from the site after signing in without
                  typing a code.
                </p>
                <p className="font-mono text-sm wrap-break-word">
                  {successInvoice}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => void copyInvoiceReference()}
                >
                  <CopyIcon className="size-4" />
                  {copied ? "Copied" : "Copy internal ref"}
                </Button>
              </div>

              <DialogFooter>
                <Button type="button" onClick={() => handleDialogOpenChange(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function EligibilityRow({ row }: { row: ReviewEligibilityAdmin }) {
  const created = new Date(row.createdAt);
  const expires = row.expiresAt ? new Date(row.expiresAt) : null;

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium">{row.user.name}</p>
        <p className="text-muted-foreground truncate text-xs">{row.user.email}</p>
        <p className="text-muted-foreground font-mono text-xs break-all">
          {row.invoiceReference}
          {row.carId ? (
            <span className="text-foreground/80">
              {" "}
              · car <span className="tabular-nums">{row.carId}</span>
            </span>
          ) : null}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        <Badge variant={row.isUsed ? "secondary" : "default"}>
          {row.isUsed ? "Used" : "Pending"}
        </Badge>
        <time
          className="text-muted-foreground text-xs tabular-nums"
          dateTime={row.createdAt}
        >
          {format(created, "MMM d, yyyy")}
        </time>
        {expires && !Number.isNaN(expires.getTime()) ? (
          <span className="text-muted-foreground text-xs">
            Expires {format(expires, "MMM d, yyyy HH:mm")}
          </span>
        ) : null}
      </div>
    </li>
  );
}
