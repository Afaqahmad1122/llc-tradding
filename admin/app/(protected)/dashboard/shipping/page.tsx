"use client";

import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarClock,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPin,
  MapPinned,
  PackageCheck,
  Pencil,
  Plus,
  SearchIcon,
  Ship,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import { useEffect, useReducer, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminDataPanel } from "@/components/layout/admin-data-page";
import { Separator } from "@/components/ui/separator";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
import {
  fetchAdminLedgerShipments,
  type AdminLedgerShipment,
  type LedgerDealStatus,
} from "@/lib/api/ledger";
import {
  createAdminShippingRegion,
  createAdminShippingSchedule,
  deactivateAdminShippingRegion,
  deactivateAdminShippingSchedule,
  deleteAdminShippingRegion,
  fetchAdminShippingRegions,
  fetchAdminShippingScheduleById,
  fetchAdminShippingSchedulesByRegion,
  replaceAdminShippingArrivals,
  replaceAdminShippingDepartures,
  updateAdminShippingRegion,
  updateAdminShippingSchedule,
  type AdminShippingRegion,
  type AdminShippingRegionsQuery,
  type AdminShippingSchedule,
} from "@/lib/api/shipping";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const CUSTOMER_SHIPMENT_PAGE_SIZE = 12;
const CUSTOMER_SHIPMENT_SEARCH_DEBOUNCE_MS = 400;

const customerShipmentStatuses: LedgerDealStatus[] = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "IN_TRANSIT",
  "ARRIVED",
  "PAYMENT_COMPLETED",
  "DOCUMENTS_DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

type VisibilityFilter = "all" | "active" | "inactive";

type ListState = {
  page: number;
  pageSize: (typeof PAGE_SIZE_OPTIONS)[number];
  searchInput: string;
  debouncedSearch: string;
  sort: "latest" | "oldest" | "name";
  visibility: VisibilityFilter;
};

type ListAction =
  | { type: "SET_SEARCH_INPUT"; payload: string }
  | { type: "APPLY_DEBOUNCED_SEARCH"; payload: string }
  | { type: "SET_SORT"; payload: "latest" | "oldest" | "name" }
  | { type: "SET_VISIBILITY"; payload: VisibilityFilter }
  | { type: "SET_PAGE_SIZE"; payload: (typeof PAGE_SIZE_OPTIONS)[number] }
  | { type: "SET_PAGE"; payload: number };

const initialListState: ListState = {
  page: 1,
  pageSize: 10,
  searchInput: "",
  debouncedSearch: "",
  sort: "latest",
  visibility: "all",
};

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "SET_SEARCH_INPUT":
      return { ...state, searchInput: action.payload };
    case "APPLY_DEBOUNCED_SEARCH":
      if (state.debouncedSearch === action.payload) return state;
      return { ...state, debouncedSearch: action.payload, page: 1 };
    case "SET_SORT":
      if (state.sort === action.payload) return state;
      return { ...state, sort: action.payload, page: 1 };
    case "SET_VISIBILITY":
      if (state.visibility === action.payload) return state;
      return { ...state, visibility: action.payload, page: 1 };
    case "SET_PAGE_SIZE":
      if (state.pageSize === action.payload) return state;
      return { ...state, pageSize: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

function slugFromName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Request failed";
}

function buildRegionsQuery(list: ListState): AdminShippingRegionsQuery {
  const query: AdminShippingRegionsQuery = {
    page: list.page,
    pageSize: list.pageSize,
    ...(list.debouncedSearch ? { search: list.debouncedSearch } : {}),
    ...(list.sort === "oldest" ? { sort: "oldest" } : {}),
    ...(list.sort === "name" ? { sort: "name" } : {}),
  };
  if (list.visibility === "active") query.isActive = true;
  if (list.visibility === "inactive") query.isActive = false;
  return query;
}

type NavState =
  | { screen: "regions" }
  | { screen: "schedules"; regionId: string }
  | { screen: "schedule"; regionId: string; scheduleId: string };

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 border font-medium tabular-nums",
        isActive
          ? "border-emerald-500/45 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200"
          : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function shipmentLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatShipmentDate(value: string | null | undefined) {
  if (!value) return "Not scheduled";
  return format(new Date(value), "MMM d, yyyy");
}

function shipmentBadgeVariant(status: LedgerDealStatus) {
  if (status === "CANCELLED") return "destructive";
  if (status === "DELIVERED") return "default";
  if (status === "IN_TRANSIT" || status === "ARRIVED") return "secondary";
  return "outline";
}

function hasShipmentDetails(shipment: AdminLedgerShipment) {
  return Boolean(
    shipment.shipmentOrigin ||
      shipment.shipmentDestination ||
      shipment.vesselName ||
      shipment.bookingNo ||
      shipment.billOfLadingNo ||
      shipment.currentLocation ||
      shipment.shipmentNote ||
      shipment.dueDate,
  );
}

function CustomerShipmentStats({ rows }: { rows: AdminLedgerShipment[] }) {
  const inTransit = rows.filter((shipment) => shipment.status === "IN_TRANSIT").length;
  const delivered = rows.filter((shipment) => shipment.status === "DELIVERED").length;
  const missingTracking = rows.filter((shipment) => !hasShipmentDetails(shipment)).length;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border bg-background px-4 py-3">
        <p className="text-muted-foreground text-xs uppercase">In transit</p>
        <p className="mt-1 text-xl font-semibold tabular-nums">{inTransit}</p>
      </div>
      <div className="rounded-lg border bg-background px-4 py-3">
        <p className="text-muted-foreground text-xs uppercase">Delivered</p>
        <p className="mt-1 text-xl font-semibold tabular-nums">{delivered}</p>
      </div>
      <div className="rounded-lg border bg-background px-4 py-3">
        <p className="text-muted-foreground text-xs uppercase">Missing tracking</p>
        <p className="mt-1 text-xl font-semibold tabular-nums">{missingTracking}</p>
      </div>
    </div>
  );
}

function CustomerShipmentsTable({ rows }: { rows: AdminLedgerShipment[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-56 pl-4 sm:pl-5">Customer</TableHead>
            <TableHead className="min-w-52">Vehicle</TableHead>
            <TableHead className="min-w-64">Route</TableHead>
            <TableHead className="min-w-52">Tracking</TableHead>
            <TableHead className="min-w-36 pr-4 sm:pr-5">ETA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((shipment) => (
            <TableRow key={shipment.id} className="align-top hover:bg-muted/30">
              <TableCell className="pl-4 sm:pl-5">
                <p className="font-medium">{shipment.user.name}</p>
                <p className="text-muted-foreground mt-0.5 break-all text-xs">
                  {shipment.user.email}
                </p>
                <Badge variant="secondary" className="mt-2 font-normal">
                  {shipment.orderNumber}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="font-medium">
                  {shipment.car.model.brand} {shipment.car.model.name}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Ref {shipment.car.referenceNo}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {shipment.car.chassisNo ?? "No chassis"}
                </p>
              </TableCell>
              <TableCell>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium">
                        {shipment.shipmentOrigin || "Origin pending"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        to {shipment.shipmentDestination || "Destination pending"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={shipmentBadgeVariant(shipment.status)}>
                    {shipmentLabel(shipment.status)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <Ship className="text-muted-foreground size-4" />
                    {shipment.vesselName || "Vessel pending"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Current: {shipment.currentLocation || shipmentLabel(shipment.status)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Booking: {shipment.bookingNo || "-"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    BL: {shipment.billOfLadingNo || "-"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="pr-4 sm:pr-5">
                <p className="flex items-center gap-2 font-medium">
                  <CalendarClock className="text-muted-foreground size-4" />
                  {formatShipmentDate(shipment.dueDate)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {shipment.documentCount} document{shipment.documentCount === 1 ? "" : "s"}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Updated {format(new Date(shipment.updatedAt), "MMM d, yyyy")}
                </p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomerShipmentsSection() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LedgerDealStatus>("all");
  const debouncedSearch = useDebouncedValue(
    searchInput,
    CUSTOMER_SHIPMENT_SEARCH_DEBOUNCE_MS,
  );

  const shipmentsQuery = useQuery({
    queryKey: ["admin-shipping-customer-shipments", page, debouncedSearch, statusFilter],
    queryFn: () =>
      fetchAdminLedgerShipments({
        page,
        pageSize: CUSTOMER_SHIPMENT_PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch.trim() } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const rows = shipmentsQuery.data?.data ?? [];
  const totalItems = shipmentsQuery.data?.pagination.total ?? 0;
  const totalPages = shipmentsQuery.data?.pagination.totalPages ?? 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Customer shipments</h2>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Shipment details for each customer car order from ledger deals.
        </p>
      </div>
      <AdminDataPanel
        controls={
          <>
            <CustomerShipmentStats rows={rows} />
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="customer-shipment-search" className="text-muted-foreground text-xs font-medium">
                  Search customer shipments
                </Label>
                <div className="relative">
                  <SearchIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    id="customer-shipment-search"
                    className="pl-9"
                    value={searchInput}
                    onChange={(event) => {
                      setSearchInput(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Customer, email, order no, car ref, chassis..."
                  />
                </div>
              </div>
              <div className="min-w-52 space-y-1.5">
                <Label htmlFor="customer-shipment-status" className="text-muted-foreground text-xs font-medium">
                  Shipment status
                </Label>
                <NativeSelect
                  id="customer-shipment-status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as typeof statusFilter);
                    setPage(1);
                  }}
                >
                  <NativeSelectOption value="all">All statuses</NativeSelectOption>
                  {customerShipmentStatuses.map((status) => (
                    <NativeSelectOption key={status} value={status}>
                      {shipmentLabel(status)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
          </>
        }
        emptyDescription="Create ledger deals or add shipment details to see customer shipments here."
        emptyIcon={PackageCheck}
        emptyTitle="No customer shipments"
        error={shipmentsQuery.error}
        errorMessage={formatErrorMessage}
        errorTitle="Could not load customer shipments"
        isEmpty={rows.length === 0}
        isError={shipmentsQuery.isError}
        isFetching={shipmentsQuery.isFetching}
        isPending={shipmentsQuery.isPending}
        loadingLabel="Loading customer shipments..."
        table={<CustomerShipmentsTable rows={rows} />}
        pagination={{
          isFetching: shipmentsQuery.isFetching,
          onPageChange: setPage,
          page,
          rowsShown: rows.length,
          totalItems,
          totalPages,
        }}
      />
    </section>
  );
}

type PortDraft = { key: string; portName: string; cellText: string };

function newPortRowKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function portsFromSchedule(
  kind: "departure" | "arrival",
  schedule: AdminShippingSchedule,
): PortDraft[] {
  if (kind === "departure") {
    return schedule.departures.map((d) => ({
      key: d.id,
      portName: d.portName,
      cellText: d.etdText,
    }));
  }
  return schedule.arrivals.map((a) => ({
    key: a.id,
    portName: a.portName,
    cellText: a.etaText,
  }));
}

function PortRowsEditor({
  title,
  hint,
  rows,
  onChange,
  onSave,
  disabled,
  pending,
  error,
  showSaveFooter = true,
}: {
  title: string;
  hint: string;
  rows: PortDraft[];
  onChange: (next: PortDraft[]) => void;
  onSave: () => void;
  disabled?: boolean;
  pending: boolean;
  error: string | null;
  /** When false, hide the per-section save button (e.g. parent submits everything at once). */
  showSaveFooter?: boolean;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  const updateRow = (index: number, patch: Partial<Pick<PortDraft, "portName" | "cellText">>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground mt-0.5 max-w-xl text-xs leading-relaxed">
            {hint}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || pending}
          onClick={() =>
            onChange([
              ...rows,
              { key: newPortRowKey(), portName: "", cellText: "-" },
            ])
          }
        >
          <Plus className="mr-1.5 size-3.5" aria-hidden />
          Add port
        </Button>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No ports yet. Add ports or save to clear all (empty list is allowed).
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <li
              key={row.key}
              className="bg-card flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:flex-wrap sm:items-end"
            >
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Port name</Label>
                  <Input
                    value={row.portName}
                    onChange={(e) =>
                      updateRow(index, { portName: e.target.value })
                    }
                    placeholder="e.g. Kobe"
                    autoComplete="off"
                    disabled={disabled || pending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ETD / ETA text</Label>
                  <Input
                    value={row.cellText}
                    onChange={(e) =>
                      updateRow(index, { cellText: e.target.value })
                    }
                    placeholder="Date or -"
                    autoComplete="off"
                    disabled={disabled || pending}
                  />
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5 sm:pb-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={disabled || pending || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={
                    disabled || pending || index === rows.length - 1
                  }
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive size-8"
                  disabled={disabled || pending}
                  onClick={() => removeRow(index)}
                  aria-label="Remove row"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showSaveFooter ? (
        <div className="flex justify-end border-t border-border/60 pt-3">
          <Button
            type="button"
            disabled={disabled || pending}
            onClick={onSave}
          >
            {pending ? (
              <>
                <Spinner className="mr-2 size-4" />
                Saving…
              </>
            ) : (
              `Save ${title.toLowerCase()}`
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function validatePortDrafts(
  rows: PortDraft[],
  emptyTextLabel: string,
): string | null {
  const seen = new Set<string>();
  for (const row of rows) {
    const name = row.portName.trim();
    const text = row.cellText.trim();
    if (!name) return "Each port row needs a port name.";
    if (!text) return `${emptyTextLabel} cannot be empty (use “-”).`;
    const key = name.toLowerCase();
    if (seen.has(key)) return "Duplicate port names are not allowed.";
    seen.add(key);
  }
  return null;
}

function AdminShippingPageContent() {
  const qc = useQueryClient();
  const [list, dispatch] = useReducer(listReducer, initialListState);
  const [nav, setNav] = useState<NavState>({ screen: "regions" });

  const [createRegionOpen, setCreateRegionOpen] = useState(false);
  const [createSlugTouched, setCreateSlugTouched] = useState(false);
  const [createRegion, setCreateRegion] = useState({
    name: "",
    slug: "",
    sortOrder: 0,
    isActive: true,
  });
  const [createFirstSchedule, setCreateFirstSchedule] = useState({
    company: "",
    shipName: "",
    voyage: "",
    sortOrder: 0,
    isActive: true,
  });
  const [createRegionDepartureDrafts, setCreateRegionDepartureDrafts] =
    useState<PortDraft[]>([]);
  const [createRegionArrivalDrafts, setCreateRegionArrivalDrafts] = useState<
    PortDraft[]
  >([]);
  const [createRegionError, setCreateRegionError] = useState<string | null>(
    null,
  );

  const [editRegion, setEditRegion] = useState<AdminShippingRegion | null>(
    null,
  );
  const [editRegionFields, setEditRegionFields] = useState<{
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
  } | null>(null);
  const [editRegionError, setEditRegionError] = useState<string | null>(null);

  const [regionDanger, setRegionDanger] = useState<AdminShippingRegion | null>(
    null,
  );
  const [regionDeleteTarget, setRegionDeleteTarget] =
    useState<AdminShippingRegion | null>(null);

  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [createSchedule, setCreateSchedule] = useState({
    company: "",
    shipName: "",
    voyage: "",
    sortOrder: 0,
    isActive: true,
  });
  const [createScheduleDepartureDrafts, setCreateScheduleDepartureDrafts] =
    useState<PortDraft[]>([]);
  const [createScheduleArrivalDrafts, setCreateScheduleArrivalDrafts] =
    useState<PortDraft[]>([]);
  const [createScheduleError, setCreateScheduleError] = useState<
    string | null
  >(null);

  const [scheduleDanger, setScheduleDanger] =
    useState<AdminShippingSchedule | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      dispatch({
        type: "APPLY_DEBOUNCED_SEARCH",
        payload: list.searchInput.trim(),
      });
    }, 320);
    return () => window.clearTimeout(t);
  }, [list.searchInput]);

  const invalidateRegions = () =>
    void qc.invalidateQueries({ queryKey: ["admin-shipping-regions"] });

  const invalidateSchedules = (regionId: string) =>
    void qc.invalidateQueries({
      queryKey: ["admin-shipping-schedules", regionId],
    });

  const invalidateSchedule = (scheduleId: string) =>
    void qc.invalidateQueries({
      queryKey: ["admin-shipping-schedule", scheduleId],
    });

  const schedulesRegionId =
    nav.screen === "schedules" || nav.screen === "schedule"
      ? nav.regionId
      : null;
  const detailScheduleId =
    nav.screen === "schedule" ? nav.scheduleId : null;

  const regionsQuery = useQuery({
    queryKey: [
      "admin-shipping-regions",
      list.page,
      list.pageSize,
      list.debouncedSearch,
      list.sort,
      list.visibility,
    ],
    queryFn: () => fetchAdminShippingRegions(buildRegionsQuery(list)),
    placeholderData: keepPreviousData,
    enabled: nav.screen === "regions",
  });

  const schedulesQuery = useQuery({
    queryKey: ["admin-shipping-schedules", schedulesRegionId ?? ""],
    queryFn: () => fetchAdminShippingSchedulesByRegion(schedulesRegionId!),
    enabled: schedulesRegionId != null,
  });

  const scheduleDetailQuery = useQuery({
    queryKey: ["admin-shipping-schedule", detailScheduleId ?? ""],
    queryFn: () => fetchAdminShippingScheduleById(detailScheduleId!),
    enabled: detailScheduleId != null,
  });

  const scheduleData = scheduleDetailQuery.data?.schedule;

  const [metaFields, setMetaFields] = useState<{
    company: string;
    shipName: string;
    voyage: string;
    sortOrder: number;
    isActive: boolean;
  } | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [departureDrafts, setDepartureDrafts] = useState<PortDraft[]>([]);
  const [arrivalDrafts, setArrivalDrafts] = useState<PortDraft[]>([]);
  const [departuresSaveError, setDeparturesSaveError] = useState<string | null>(
    null,
  );
  const [arrivalsSaveError, setArrivalsSaveError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!scheduleData || nav.screen !== "schedule") {
      setMetaFields(null);
      setDepartureDrafts([]);
      setArrivalDrafts([]);
      return;
    }
    setMetaFields({
      company: scheduleData.company,
      shipName: scheduleData.shipName,
      voyage: scheduleData.voyage,
      sortOrder: scheduleData.sortOrder,
      isActive: scheduleData.isActive,
    });
    setDepartureDrafts(portsFromSchedule("departure", scheduleData));
    setArrivalDrafts(portsFromSchedule("arrival", scheduleData));
    setMetaError(null);
    setDeparturesSaveError(null);
    setArrivalsSaveError(null);
  }, [scheduleData, nav.screen]);

  const createDestinationMutation = useMutation({
    mutationFn: async () => {
      const name = createRegion.name.trim();
      if (!name) throw new Error("Destination name is required.");
      const slug = slugFromName(createRegion.slug || createRegion.name);
      if (!slug) throw new Error("Slug is required.");

      const company = createFirstSchedule.company.trim();
      const shipName = createFirstSchedule.shipName.trim();
      const voyage = createFirstSchedule.voyage.trim();
      if (!company) {
        throw new Error("Shipping company is required for the first sailing row.");
      }
      if (!shipName) throw new Error("Ship name is required.");
      if (!voyage) throw new Error("Voyage number or code is required.");

      const depErr = validatePortDrafts(
        createRegionDepartureDrafts,
        "ETD text",
      );
      if (depErr) throw new Error(depErr);
      const arrErr = validatePortDrafts(
        createRegionArrivalDrafts,
        "ETA text",
      );
      if (arrErr) throw new Error(arrErr);

      const { region } = await createAdminShippingRegion({
        name,
        slug,
        sortOrder: createRegion.sortOrder,
        isActive: createRegion.isActive,
      });

      const { schedule } = await createAdminShippingSchedule(region.id, {
        company,
        shipName,
        voyage,
        sortOrder: createFirstSchedule.sortOrder,
        isActive: createFirstSchedule.isActive,
      });

      await replaceAdminShippingDepartures(schedule.id, {
        entries: createRegionDepartureDrafts.map((r, i) => ({
          portName: r.portName.trim(),
          etdText: r.cellText.trim(),
          sortOrder: i,
        })),
      });

      await replaceAdminShippingArrivals(schedule.id, {
        entries: createRegionArrivalDrafts.map((r, i) => ({
          portName: r.portName.trim(),
          etaText: r.cellText.trim(),
          sortOrder: i,
        })),
      });

      return region;
    },
    onSuccess: () => {
      setCreateRegionOpen(false);
      setCreateSlugTouched(false);
      setCreateRegion({ name: "", slug: "", sortOrder: 0, isActive: true });
      setCreateFirstSchedule({
        company: "",
        shipName: "",
        voyage: "",
        sortOrder: 0,
        isActive: true,
      });
      setCreateRegionDepartureDrafts([]);
      setCreateRegionArrivalDrafts([]);
      setCreateRegionError(null);
      invalidateRegions();
    },
    onError: (e: unknown) => {
      setCreateRegionError(formatErrorMessage(e));
    },
  });

  const updateRegionMutation = useMutation({
    mutationFn: () => {
      if (!editRegion || !editRegionFields) throw new Error("No region");
      return updateAdminShippingRegion(editRegion.id, {
        name: editRegionFields.name.trim(),
        slug: slugFromName(editRegionFields.slug),
        sortOrder: editRegionFields.sortOrder,
        isActive: editRegionFields.isActive,
      });
    },
    onSuccess: () => {
      setEditRegion(null);
      setEditRegionFields(null);
      setEditRegionError(null);
      invalidateRegions();
      if (nav.screen !== "regions") void schedulesQuery.refetch();
    },
    onError: (e: unknown) => {
      setEditRegionError(formatErrorMessage(e));
    },
  });

  const deactivateRegionMutation = useMutation({
    mutationFn: (id: string) => deactivateAdminShippingRegion(id),
    onSuccess: (_data, deactivatedId) => {
      setRegionDanger(null);
      invalidateRegions();
      if (nav.screen !== "regions" && nav.regionId === deactivatedId) {
        setNav({ screen: "regions" });
      }
    },
  });

  const deleteRegionMutation = useMutation({
    mutationFn: (id: string) => deleteAdminShippingRegion(id),
    onSuccess: (_data, deletedId) => {
      setRegionDeleteTarget(null);
      invalidateRegions();
      if (nav.screen !== "regions" && nav.regionId === deletedId) {
        setNav({ screen: "regions" });
      }
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async () => {
      if (nav.screen !== "schedules" && nav.screen !== "schedule") {
        throw new Error("No region");
      }
      const regionId = nav.regionId;
      const company = createSchedule.company.trim();
      const shipName = createSchedule.shipName.trim();
      const voyage = createSchedule.voyage.trim();
      if (!company) throw new Error("Company is required.");
      if (!shipName) throw new Error("Ship name is required.");
      if (!voyage) throw new Error("Voyage is required.");

      const depErr = validatePortDrafts(
        createScheduleDepartureDrafts,
        "ETD text",
      );
      if (depErr) throw new Error(depErr);
      const arrErr = validatePortDrafts(
        createScheduleArrivalDrafts,
        "ETA text",
      );
      if (arrErr) throw new Error(arrErr);

      const { schedule } = await createAdminShippingSchedule(regionId, {
        company,
        shipName,
        voyage,
        sortOrder: createSchedule.sortOrder,
        isActive: createSchedule.isActive,
      });

      await replaceAdminShippingDepartures(schedule.id, {
        entries: createScheduleDepartureDrafts.map((r, i) => ({
          portName: r.portName.trim(),
          etdText: r.cellText.trim(),
          sortOrder: i,
        })),
      });

      await replaceAdminShippingArrivals(schedule.id, {
        entries: createScheduleArrivalDrafts.map((r, i) => ({
          portName: r.portName.trim(),
          etaText: r.cellText.trim(),
          sortOrder: i,
        })),
      });
    },
    onSuccess: () => {
      setCreateScheduleOpen(false);
      setCreateSchedule({
        company: "",
        shipName: "",
        voyage: "",
        sortOrder: 0,
        isActive: true,
      });
      setCreateScheduleDepartureDrafts([]);
      setCreateScheduleArrivalDrafts([]);
      setCreateScheduleError(null);
      if (nav.screen === "schedules" || nav.screen === "schedule") {
        invalidateSchedules(nav.regionId);
      }
    },
    onError: (e: unknown) => {
      setCreateScheduleError(formatErrorMessage(e));
    },
  });

  const deactivateScheduleMutation = useMutation({
    mutationFn: (id: string) => deactivateAdminShippingSchedule(id),
    onSuccess: (_, id) => {
      setScheduleDanger(null);
      if (nav.screen === "schedules" || nav.screen === "schedule") {
        invalidateSchedules(nav.regionId);
      }
      if (nav.screen === "schedule" && nav.scheduleId === id) {
        setNav({ screen: "schedules", regionId: nav.regionId });
      }
    },
  });

  const updateScheduleMetaMutation = useMutation({
    mutationFn: () => {
      if (nav.screen !== "schedule" || !metaFields) {
        throw new Error("No schedule");
      }
      return updateAdminShippingSchedule(nav.scheduleId, {
        company: metaFields.company.trim(),
        shipName: metaFields.shipName.trim(),
        voyage: metaFields.voyage.trim(),
        sortOrder: metaFields.sortOrder,
        isActive: metaFields.isActive,
      });
    },
    onSuccess: (_, __) => {
      if (nav.screen === "schedule") {
        invalidateSchedule(nav.scheduleId);
        invalidateSchedules(nav.regionId);
      }
      setMetaError(null);
    },
    onError: (e: unknown) => {
      setMetaError(formatErrorMessage(e));
    },
  });

  const saveDeparturesMutation = useMutation({
    mutationFn: () => {
      if (nav.screen !== "schedule") throw new Error("No schedule");
      const err = validatePortDrafts(departureDrafts, "ETD text");
      if (err) throw new Error(err);
      return replaceAdminShippingDepartures(nav.scheduleId, {
        entries: departureDrafts.map((r, i) => ({
          portName: r.portName.trim(),
          etdText: r.cellText.trim(),
          sortOrder: i,
        })),
      });
    },
    onSuccess: () => {
      if (nav.screen === "schedule") {
        invalidateSchedule(nav.scheduleId);
        invalidateSchedules(nav.regionId);
      }
      setDeparturesSaveError(null);
    },
    onError: (e: unknown) => {
      setDeparturesSaveError(formatErrorMessage(e));
    },
  });

  const saveArrivalsMutation = useMutation({
    mutationFn: () => {
      if (nav.screen !== "schedule") throw new Error("No schedule");
      const err = validatePortDrafts(arrivalDrafts, "ETA text");
      if (err) throw new Error(err);
      return replaceAdminShippingArrivals(nav.scheduleId, {
        entries: arrivalDrafts.map((r, i) => ({
          portName: r.portName.trim(),
          etaText: r.cellText.trim(),
          sortOrder: i,
        })),
      });
    },
    onSuccess: () => {
      if (nav.screen === "schedule") {
        invalidateSchedule(nav.scheduleId);
        invalidateSchedules(nav.regionId);
      }
      setArrivalsSaveError(null);
    },
    onError: (e: unknown) => {
      setArrivalsSaveError(formatErrorMessage(e));
    },
  });

  const pagination = regionsQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const canPrev = list.page > 1;
  const canNext = totalPages > 0 && list.page < totalPages;

  const openCreateRegion = () => {
    setCreateRegionError(null);
    setCreateSlugTouched(false);
    setCreateRegion({ name: "", slug: "", sortOrder: 0, isActive: true });
    setCreateFirstSchedule({
      company: "",
      shipName: "",
      voyage: "",
      sortOrder: 0,
      isActive: true,
    });
    setCreateRegionDepartureDrafts([]);
    setCreateRegionArrivalDrafts([]);
    setCreateRegionOpen(true);
  };

  const openCreateSchedule = () => {
    setCreateScheduleError(null);
    setCreateSchedule({
      company: "",
      shipName: "",
      voyage: "",
      sortOrder: 0,
      isActive: true,
    });
    setCreateScheduleDepartureDrafts([]);
    setCreateScheduleArrivalDrafts([]);
    setCreateScheduleOpen(true);
  };

  const openEditRegion = (r: AdminShippingRegion) => {
    setEditRegionError(null);
    setEditRegion(r);
    setEditRegionFields({
      name: r.name,
      slug: r.slug,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
    });
  };

  const regionDialogOpen = Boolean(editRegion && editRegionFields);

  const schedulesRegion =
    nav.screen === "schedules" || nav.screen === "schedule"
      ? schedulesQuery.data?.region
      : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Shipping</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            Destinations power the public shipping information page. Add a
            region and its first sailing row—including departure and arrival
            ports—in one step.
          </p>
        </div>
        {nav.screen === "regions" ? (
          <Button
            type="button"
            onClick={openCreateRegion}
            className="shrink-0 gap-2"
          >
            <Plus className="size-4" aria-hidden />
            Add destination
          </Button>
        ) : null}
        {nav.screen === "schedules" && schedulesRegion ? (
          <Button
            type="button"
            onClick={openCreateSchedule}
            className="shrink-0 gap-2"
          >
            <Plus className="size-4" aria-hidden />
          Add sailing row
          </Button>
        ) : null}
      </div>

      {nav.screen === "regions" ? <CustomerShipmentsSection /> : null}

      {nav.screen !== "regions" ? (
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2"
            onClick={() => setNav({ screen: "regions" })}
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Destinations
          </Button>
          <span aria-hidden>/</span>
          {nav.screen === "schedule" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() =>
                  setNav({ screen: "schedules", regionId: nav.regionId })
                }
              >
                {schedulesRegion?.name ?? "Schedules"}
              </Button>
              <span aria-hidden>/</span>
              <span className="text-foreground font-medium">
                {metaFields
                  ? `${metaFields.company} · ${metaFields.shipName}`
                  : "Schedule"}
              </span>
            </>
          ) : (
            <span className="text-foreground font-medium">
              {schedulesRegion?.name ?? "Schedules"}
            </span>
          )}
        </div>
      ) : null}

      {nav.screen === "regions" ? (
        <div className="bg-card text-card-foreground flex min-w-0 flex-col overflow-hidden rounded-xl border shadow-xs ring-1 ring-foreground/10">
          <div className="border-border/60 bg-muted/30 flex flex-col gap-4 border-b p-4 sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-3">
              <p className="text-muted-foreground text-sm tabular-nums">
                {pagination != null ? (
                  <>
                    <span className="text-foreground font-semibold">
                      {pagination.total === 0
                        ? 0
                        : (pagination.page - 1) * pagination.pageSize + 1}
                      –
                      {Math.min(
                        pagination.page * pagination.pageSize,
                        pagination.total,
                      )}
                    </span>
                    <span className="font-normal"> of </span>
                    <span className="text-foreground font-semibold">
                      {pagination.total}
                    </span>
                    <span className="font-normal"> destinations</span>
                  </>
                ) : (
                  "\u00a0"
                )}
              </p>
              <label className="flex items-center gap-2 text-sm sm:shrink-0">
                <span className="text-muted-foreground whitespace-nowrap">
                  Rows
                </span>
                <NativeSelect
                  value={String(list.pageSize)}
                  onChange={(e) => {
                    dispatch({
                      type: "SET_PAGE_SIZE",
                      payload: Number(
                        e.target.value,
                      ) as (typeof PAGE_SIZE_OPTIONS)[number],
                    });
                  }}
                  className="min-w-18"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <NativeSelectOption key={n} value={String(n)}>
                      {n}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </label>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="min-w-0 flex-1">
                <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                  Search
                </label>
                <div className="relative min-w-0 flex-1">
                  <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                  <Input
                    value={list.searchInput}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_SEARCH_INPUT",
                        payload: e.target.value,
                      })
                    }
                    placeholder="Name or slug…"
                    className="pr-9 pl-9"
                    autoComplete="off"
                    aria-label="Search destinations"
                  />
                  {list.searchInput.length > 0 ? (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1"
                      aria-label="Clear search"
                      onClick={() =>
                        dispatch({ type: "SET_SEARCH_INPUT", payload: "" })
                      }
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <label className="flex w-full min-w-[10rem] flex-col gap-1.5 sm:w-44">
                  <span className="text-muted-foreground text-xs font-medium">
                    Sort
                  </span>
                  <NativeSelect
                    value={list.sort}
                    onChange={(e) => {
                      dispatch({
                        type: "SET_SORT",
                        payload: e.target.value as ListState["sort"],
                      });
                    }}
                  >
                    <NativeSelectOption value="latest">
                      Latest
                    </NativeSelectOption>
                    <NativeSelectOption value="oldest">
                      Oldest
                    </NativeSelectOption>
                    <NativeSelectOption value="name">Name (A–Z)</NativeSelectOption>
                  </NativeSelect>
                </label>
                <label className="flex w-full min-w-[10rem] flex-col gap-1.5 sm:w-44">
                  <span className="text-muted-foreground text-xs font-medium">
                    Visibility
                  </span>
                  <NativeSelect
                    value={list.visibility}
                    onChange={(e) => {
                      dispatch({
                        type: "SET_VISIBILITY",
                        payload: e.target.value as VisibilityFilter,
                      });
                    }}
                  >
                    <NativeSelectOption value="all">All</NativeSelectOption>
                    <NativeSelectOption value="active">Active</NativeSelectOption>
                    <NativeSelectOption value="inactive">
                      Inactive
                    </NativeSelectOption>
                  </NativeSelect>
                </label>
              </div>
            </div>
          </div>

          {regionsQuery.isError ? (
            <Alert variant="destructive" className="m-4 sm:m-5">
              <AlertTitle>Could not load regions</AlertTitle>
              <AlertDescription>
                {formatErrorMessage(regionsQuery.error)}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="divide-border/60 min-w-0 divide-y">
            {regionsQuery.isPending && !regionsQuery.data ? (
              <div className="flex items-center justify-center gap-2 py-16">
                <Spinner className="size-5" />
                <span className="text-muted-foreground text-sm">Loading…</span>
              </div>
            ) : null}

            {!regionsQuery.isPending &&
            regionsQuery.data &&
            regionsQuery.data.data.length === 0 ? (
              <Empty className="border-0 py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MapPinned className="size-6" aria-hidden />
                  </EmptyMedia>
                  <EmptyTitle>No destinations yet</EmptyTitle>
                <EmptyDescription>
                  Add a destination with its first sailing schedule and port
                  columns in one form.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                type="button"
                onClick={openCreateRegion}
                className="gap-2"
              >
                <Plus className="size-4" aria-hidden />
                Add destination
              </Button>
            </Empty>
            ) : null}

            {regionsQuery.data?.data.map((r) => (
              <article
                key={r.id}
                className="hover:bg-muted/25 flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-foreground min-w-0 truncate text-base font-semibold tracking-tight">
                      {r.name}
                    </h2>
                    <ActiveBadge isActive={r.isActive} />
                  </div>
                  <p className="text-muted-foreground font-mono text-xs break-all">
                    /{r.slug}
                  </p>
                  <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span>
                      Sort order{" "}
                      <span className="text-foreground font-medium tabular-nums">
                        {r.sortOrder}
                      </span>
                    </span>
                    <span>
                      Schedules{" "}
                      <span className="text-foreground font-medium tabular-nums">
                        {r._count.schedules}
                      </span>
                    </span>
                    <time
                      dateTime={r.updatedAt}
                      className="tabular-nums"
                    >
                      Updated {format(new Date(r.updatedAt), "MMM d, yyyy")}
                    </time>
                  </div>
                </div>
                <div
                  className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:max-w-56 sm:flex-col"
                  role="group"
                  aria-label={`Actions for ${r.name}`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="inline-flex min-h-9 flex-1 items-center gap-2 sm:flex-initial"
                    onClick={() =>
                      setNav({ screen: "schedules", regionId: r.id })
                    }
                  >
                    <Ship className="size-3.5 shrink-0" aria-hidden />
                    Sailing rows
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="inline-flex min-h-9 flex-1 items-center gap-2 sm:flex-initial"
                    onClick={() => openEditRegion(r)}
                  >
                    <Pencil className="size-3.5 shrink-0" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="inline-flex min-h-9 flex-1 items-center gap-2 sm:flex-initial"
                    disabled={
                      !r.isActive ||
                      deactivateRegionMutation.isPending ||
                      deleteRegionMutation.isPending
                    }
                    onClick={() => setRegionDanger(r)}
                  >
                    <UserMinus className="size-3.5 shrink-0" aria-hidden />
                    Deactivate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive inline-flex min-h-9 flex-1 items-center gap-2 sm:flex-initial"
                    disabled={
                      deleteRegionMutation.isPending ||
                      deactivateRegionMutation.isPending
                    }
                    onClick={() => setRegionDeleteTarget(r)}
                  >
                    <Trash2 className="size-3.5 shrink-0" aria-hidden />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {pagination && pagination.total > 0 ? (
            <div className="border-border/60 bg-muted/20 flex flex-col gap-3 border-t p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Page{" "}
                <span className="text-foreground font-medium tabular-nums">
                  {list.page}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium tabular-nums">
                  {totalPages}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canPrev || regionsQuery.isFetching}
                  onClick={() =>
                    dispatch({ type: "SET_PAGE", payload: list.page - 1 })
                  }
                >
                  <ChevronLeftIcon className="mr-1 size-4" aria-hidden />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canNext || regionsQuery.isFetching}
                  onClick={() =>
                    dispatch({ type: "SET_PAGE", payload: list.page + 1 })
                  }
                >
                  Next
                  <ChevronRightIcon className="ml-1 size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {nav.screen === "schedules" ? (
        <div className="bg-card flex min-w-0 flex-col overflow-hidden rounded-xl border shadow-xs ring-1 ring-foreground/10">
          {schedulesQuery.isError ? (
            <Alert variant="destructive" className="m-4 sm:m-5">
              <AlertTitle>Could not load schedules</AlertTitle>
              <AlertDescription>
                {formatErrorMessage(schedulesQuery.error)}
              </AlertDescription>
            </Alert>
          ) : null}
          {schedulesQuery.isPending && !schedulesQuery.data ? (
            <div className="flex items-center justify-center gap-2 py-16">
              <Spinner className="size-5" />
              <span className="text-muted-foreground text-sm">Loading…</span>
            </div>
          ) : null}
          {schedulesQuery.data &&
          schedulesQuery.data.data.length === 0 ? (
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Ship className="size-6" aria-hidden />
                </EmptyMedia>
                <EmptyTitle>No sailing rows yet</EmptyTitle>
                <EmptyDescription>
                  Add a row with company, ship, voyage, and ports in one form.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                type="button"
                onClick={openCreateSchedule}
                className="gap-2"
              >
                <Plus className="size-4" aria-hidden />
                Add sailing row
              </Button>
            </Empty>
          ) : null}
          <div className="divide-border/60 divide-y">
            {schedulesQuery.data?.data.map((s) => (
              <article
                key={s.id}
                className="hover:bg-muted/25 flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 space-y-2 text-left"
                  onClick={() =>
                    setNav({
                      screen: "schedule",
                      regionId: nav.regionId,
                      scheduleId: s.id,
                    })
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground text-base font-semibold tracking-tight">
                      {s.company} · {s.shipName}
                    </span>
                    <ActiveBadge isActive={s.isActive} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Voyage{" "}
                    <span className="text-foreground font-mono tabular-nums">
                      {s.voyage}
                    </span>
                    {" · "}
                    {s.departures.length} departure
                    {s.departures.length === 1 ? "" : "s"},{" "}
                    {s.arrivals.length} arrival
                    {s.arrivals.length === 1 ? "" : "s"}
                  </p>
                </button>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNav({
                        screen: "schedule",
                        regionId: nav.regionId,
                        scheduleId: s.id,
                      })
                    }
                  >
                    Open
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      !s.isActive || deactivateScheduleMutation.isPending
                    }
                    onClick={() => setScheduleDanger(s)}
                  >
                    <UserMinus className="mr-1.5 size-3.5" aria-hidden />
                    Deactivate
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {nav.screen === "schedule" ? (
        <div className="flex min-w-0 flex-col gap-6">
          {scheduleDetailQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load schedule</AlertTitle>
              <AlertDescription>
                {formatErrorMessage(scheduleDetailQuery.error)}
              </AlertDescription>
            </Alert>
          ) : null}
          {scheduleDetailQuery.isPending && !scheduleData ? (
            <div className="bg-card flex items-center justify-center gap-2 rounded-xl border py-16 shadow-xs ring-1 ring-foreground/10">
              <Spinner className="size-5" />
              <span className="text-muted-foreground text-sm">Loading…</span>
            </div>
          ) : null}
          {metaFields ? (
            <>
              <div className="bg-card flex min-w-0 flex-col gap-4 rounded-xl border p-4 shadow-xs ring-1 ring-foreground/10 sm:p-6">
                <h2 className="text-sm font-semibold tracking-tight">
                  Schedule details
                </h2>
                {metaError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Update failed</AlertTitle>
                    <AlertDescription>{metaError}</AlertDescription>
                  </Alert>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ship-company">Company</Label>
                    <Input
                      id="ship-company"
                      value={metaFields.company}
                      onChange={(e) =>
                        setMetaFields((f) =>
                          f ? { ...f, company: e.target.value } : f,
                        )
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ship-name">Ship name</Label>
                    <Input
                      id="ship-name"
                      value={metaFields.shipName}
                      onChange={(e) =>
                        setMetaFields((f) =>
                          f ? { ...f, shipName: e.target.value } : f,
                        )
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ship-voyage">Voyage</Label>
                    <Input
                      id="ship-voyage"
                      value={metaFields.voyage}
                      onChange={(e) =>
                        setMetaFields((f) =>
                          f ? { ...f, voyage: e.target.value } : f,
                        )
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ship-sort">Sort order</Label>
                    <Input
                      id="ship-sort"
                      type="number"
                      min={0}
                      step={1}
                      value={metaFields.sortOrder}
                      onChange={(e) =>
                        setMetaFields((f) =>
                          f
                            ? {
                                ...f,
                                sortOrder: Number(e.target.value) || 0,
                              }
                            : f,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Checkbox
                      id="ship-active"
                      checked={metaFields.isActive}
                      onCheckedChange={(c) =>
                        setMetaFields((f) =>
                          f ? { ...f, isActive: c === true } : f,
                        )
                      }
                    />
                    <Label htmlFor="ship-active" className="font-normal">
                      Active on public shipping tables
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => updateScheduleMetaMutation.mutate()}
                    disabled={updateScheduleMetaMutation.isPending}
                  >
                    {updateScheduleMetaMutation.isPending ? (
                      <>
                        <Spinner className="mr-2 size-4" />
                        Saving…
                      </>
                    ) : (
                      "Save details"
                    )}
                  </Button>
                </div>
              </div>

              <PortRowsEditor
                title="Departures"
                hint="Each save replaces all departure ports for this schedule. Use “-” when there is no ETD. Port names must be unique per schedule. On the public page, column headers are the union of all departure ports across every active schedule in this region—keep names and order aligned across rows for a consistent grid."
                rows={departureDrafts}
                onChange={setDepartureDrafts}
                onSave={() => saveDeparturesMutation.mutate()}
                pending={saveDeparturesMutation.isPending}
                error={departuresSaveError}
              />

              <PortRowsEditor
                title="Arrivals"
                hint="Each save replaces all arrival ports. Use “-” when there is no ETA. Port names must be unique per schedule. Public arrival columns are the union of all arrivals across schedules in this region—use matching port names and order when you want the same columns on every row."
                rows={arrivalDrafts}
                onChange={setArrivalDrafts}
                onSave={() => saveArrivalsMutation.mutate()}
                pending={saveArrivalsMutation.isPending}
                error={arrivalsSaveError}
              />
            </>
          ) : null}
        </div>
      ) : null}

      <Dialog open={createRegionOpen} onOpenChange={setCreateRegionOpen}>
        <DialogContent className="flex max-h-[min(92dvh,calc(100dvh-2rem))] min-h-0 w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-border/60 shrink-0 space-y-1 border-b px-6 py-5 text-left">
            <DialogTitle className="text-lg">Add shipping destination</DialogTitle>
            <DialogDescription>
              Create the region tab, the first sailing row, and port columns in
              one save. You can add more sailing rows afterward from the list.
            </DialogDescription>
          </DialogHeader>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 [-webkit-overflow-scrolling:touch]"
            data-slot="dialog-scroll-body"
          >
            <div className="space-y-6 py-5">
              {createRegionError ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not save</AlertTitle>
                  <AlertDescription>{createRegionError}</AlertDescription>
                </Alert>
              ) : null}

              <section className="space-y-4">
                <div>
                  <h3 className="text-foreground text-sm font-semibold tracking-tight">
                    Destination (public tab)
                  </h3>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    Shown as a region tab on the help center shipping page.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="cr-name">Name</Label>
                    <Input
                      id="cr-name"
                      value={createRegion.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setCreateRegion((r) => ({
                          ...r,
                          name,
                          slug: createSlugTouched
                            ? r.slug
                            : slugFromName(name),
                        }));
                      }}
                      placeholder="e.g. Pakistan"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cr-slug">URL slug</Label>
                    <Input
                      id="cr-slug"
                      className="font-mono text-sm"
                      value={createRegion.slug}
                      onChange={(e) => {
                        setCreateSlugTouched(true);
                        setCreateRegion((r) => ({
                          ...r,
                          slug: e.target.value,
                        }));
                      }}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cr-sort">Tab sort order</Label>
                    <Input
                      id="cr-sort"
                      type="number"
                      min={0}
                      value={createRegion.sortOrder}
                      onChange={(e) =>
                        setCreateRegion((r) => ({
                          ...r,
                          sortOrder: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Checkbox
                      id="cr-active"
                      checked={createRegion.isActive}
                      onCheckedChange={(c) =>
                        setCreateRegion((r) => ({
                          ...r,
                          isActive: c === true,
                        }))
                      }
                    />
                    <Label htmlFor="cr-active" className="font-normal">
                      Show this destination on the site
                    </Label>
                  </div>
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <h3 className="text-foreground text-sm font-semibold tracking-tight">
                    First sailing row
                  </h3>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    One schedule row (you can add more later from{" "}
                    <span className="text-foreground font-medium">
                      Sailing rows
                    </span>
                    ).
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cr-co">Company</Label>
                    <Input
                      id="cr-co"
                      value={createFirstSchedule.company}
                      onChange={(e) =>
                        setCreateFirstSchedule((s) => ({
                          ...s,
                          company: e.target.value,
                        }))
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cr-ship">Ship name</Label>
                    <Input
                      id="cr-ship"
                      value={createFirstSchedule.shipName}
                      onChange={(e) =>
                        setCreateFirstSchedule((s) => ({
                          ...s,
                          shipName: e.target.value,
                        }))
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cr-voy">Voyage</Label>
                    <Input
                      id="cr-voy"
                      value={createFirstSchedule.voyage}
                      onChange={(e) =>
                        setCreateFirstSchedule((s) => ({
                          ...s,
                          voyage: e.target.value,
                        }))
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cr-ssort">Row sort order</Label>
                    <Input
                      id="cr-ssort"
                      type="number"
                      min={0}
                      value={createFirstSchedule.sortOrder}
                      onChange={(e) =>
                        setCreateFirstSchedule((s) => ({
                          ...s,
                          sortOrder: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Checkbox
                      id="cr-sactive"
                      checked={createFirstSchedule.isActive}
                      onCheckedChange={(c) =>
                        setCreateFirstSchedule((s) => ({
                          ...s,
                          isActive: c === true,
                        }))
                      }
                    />
                    <Label htmlFor="cr-sactive" className="font-normal">
                      Active on public shipping tables
                    </Label>
                  </div>
                </div>
              </section>

              <PortRowsEditor
                title="Departures"
                hint="Optional until you add ports. Use “-” when there is no ETD. Port names must be unique. Public columns are the union of all departure ports in this destination—keep naming consistent across rows you add later."
                rows={createRegionDepartureDrafts}
                onChange={setCreateRegionDepartureDrafts}
                onSave={() => {}}
                disabled={createDestinationMutation.isPending}
                pending={false}
                error={null}
                showSaveFooter={false}
              />

              <PortRowsEditor
                title="Arrivals"
                hint="Optional until you add ports. Use “-” when there is no ETA. Arrival columns work the same way as departures for the public grid."
                rows={createRegionArrivalDrafts}
                onChange={setCreateRegionArrivalDrafts}
                onSave={() => {}}
                disabled={createDestinationMutation.isPending}
                pending={false}
                error={null}
                showSaveFooter={false}
              />
            </div>
          </div>
          <DialogFooter className="border-border/60 bg-muted/20 shrink-0 gap-2 border-t px-6 py-4 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateRegionOpen(false)}
              disabled={createDestinationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => createDestinationMutation.mutate()}
              disabled={createDestinationMutation.isPending}
              className="min-w-36"
            >
              {createDestinationMutation.isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Saving…
                </>
              ) : (
                "Save destination"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={regionDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditRegion(null);
            setEditRegionFields(null);
            setEditRegionError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit destination</DialogTitle>
            <DialogDescription>
              Updates the tab label and URL slug on the public shipping page.
            </DialogDescription>
          </DialogHeader>
          {editRegionError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not save</AlertTitle>
              <AlertDescription>{editRegionError}</AlertDescription>
            </Alert>
          ) : null}
          {editRegionFields ? (
            <div className="grid max-h-[min(60vh,calc(100vh-12rem))] gap-4 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="er-name">Name</Label>
                <Input
                  id="er-name"
                  value={editRegionFields.name}
                  onChange={(e) =>
                    setEditRegionFields((f) =>
                      f ? { ...f, name: e.target.value } : f,
                    )
                  }
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="er-slug">Slug</Label>
                <Input
                  id="er-slug"
                  className="font-mono text-sm"
                  value={editRegionFields.slug}
                  onChange={(e) =>
                    setEditRegionFields((f) =>
                      f ? { ...f, slug: e.target.value } : f,
                    )
                  }
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="er-sort">Sort order</Label>
                <Input
                  id="er-sort"
                  type="number"
                  min={0}
                  value={editRegionFields.sortOrder}
                  onChange={(e) =>
                    setEditRegionFields((f) =>
                      f
                        ? {
                            ...f,
                            sortOrder: Number(e.target.value) || 0,
                          }
                        : f,
                    )
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="er-active"
                  checked={editRegionFields.isActive}
                  onCheckedChange={(c) =>
                    setEditRegionFields((f) =>
                      f ? { ...f, isActive: c === true } : f,
                    )
                  }
                />
                <Label htmlFor="er-active" className="font-normal">
                  Active
                </Label>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditRegion(null);
                setEditRegionFields(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => updateRegionMutation.mutate()}
              disabled={updateRegionMutation.isPending}
            >
              {updateRegionMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(regionDanger)}
        onOpenChange={(open) => !open && setRegionDanger(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate region?</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {regionDanger ? (
                <>
                  <span className="text-foreground font-medium">
                    {regionDanger.name}
                  </span>{" "}
                  will be hidden from public shipping tabs. Schedules stay in the
                  database but inactive regions do not appear on the site.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deactivateRegionMutation.error ? (
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>
                {formatErrorMessage(deactivateRegionMutation.error)}
              </AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                !regionDanger || deactivateRegionMutation.isPending
              }
              onClick={(e) => {
                e.preventDefault();
                if (regionDanger) {
                  void deactivateRegionMutation.mutateAsync(regionDanger.id);
                }
              }}
            >
              {deactivateRegionMutation.isPending
                ? "Deactivating…"
                : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(regionDeleteTarget)}
        onOpenChange={(open) => !open && setRegionDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete destination permanently?</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {regionDeleteTarget ? (
                <>
                  This removes{" "}
                  <span className="text-foreground font-medium">
                    {regionDeleteTarget.name}
                  </span>{" "}
                  and every sailing row and port entry under it. This cannot be
                  undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteRegionMutation.error ? (
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>
                {formatErrorMessage(deleteRegionMutation.error)}
              </AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRegionMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={
                !regionDeleteTarget || deleteRegionMutation.isPending
              }
              onClick={(e) => {
                e.preventDefault();
                if (regionDeleteTarget) {
                  void deleteRegionMutation.mutateAsync(regionDeleteTarget.id);
                }
              }}
            >
              {deleteRegionMutation.isPending ? "Deleting…" : "Delete forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
        <DialogContent className="flex max-h-[min(92dvh,calc(100dvh-2rem))] min-h-0 w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-border/60 shrink-0 space-y-1 border-b px-6 py-5 text-left">
            <DialogTitle className="text-lg">Add sailing row</DialogTitle>
            <DialogDescription>
              For{" "}
              <span className="text-foreground font-medium">
                {schedulesRegion?.name ?? "this destination"}
              </span>
              . Includes departure and arrival ports in one save.
            </DialogDescription>
          </DialogHeader>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 [-webkit-overflow-scrolling:touch]"
            data-slot="dialog-scroll-body"
          >
            <div className="space-y-6 py-5">
              {createScheduleError ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not save</AlertTitle>
                  <AlertDescription>{createScheduleError}</AlertDescription>
                </Alert>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cs-company">Company</Label>
                  <Input
                    id="cs-company"
                    value={createSchedule.company}
                    onChange={(e) =>
                      setCreateSchedule((s) => ({
                        ...s,
                        company: e.target.value,
                      }))
                    }
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cs-ship">Ship name</Label>
                  <Input
                    id="cs-ship"
                    value={createSchedule.shipName}
                    onChange={(e) =>
                      setCreateSchedule((s) => ({
                        ...s,
                        shipName: e.target.value,
                      }))
                    }
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cs-voyage">Voyage</Label>
                  <Input
                    id="cs-voyage"
                    value={createSchedule.voyage}
                    onChange={(e) =>
                      setCreateSchedule((s) => ({
                        ...s,
                        voyage: e.target.value,
                      }))
                    }
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cs-sort">Sort order</Label>
                  <Input
                    id="cs-sort"
                    type="number"
                    min={0}
                    value={createSchedule.sortOrder}
                    onChange={(e) =>
                      setCreateSchedule((s) => ({
                        ...s,
                        sortOrder: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Checkbox
                    id="cs-active"
                    checked={createSchedule.isActive}
                    onCheckedChange={(c) =>
                      setCreateSchedule((s) => ({
                        ...s,
                        isActive: c === true,
                      }))
                    }
                  />
                  <Label htmlFor="cs-active" className="font-normal">
                    Active on public shipping tables
                  </Label>
                </div>
              </div>
              <PortRowsEditor
                title="Departures"
                hint="Optional until you add ports. Use “-” when there is no ETD. Keep port names aligned with other rows in this destination for a clean public table."
                rows={createScheduleDepartureDrafts}
                onChange={setCreateScheduleDepartureDrafts}
                onSave={() => {}}
                disabled={createScheduleMutation.isPending}
                pending={false}
                error={null}
                showSaveFooter={false}
              />
              <PortRowsEditor
                title="Arrivals"
                hint="Optional until you add ports. Use “-” when there is no ETA."
                rows={createScheduleArrivalDrafts}
                onChange={setCreateScheduleArrivalDrafts}
                onSave={() => {}}
                disabled={createScheduleMutation.isPending}
                pending={false}
                error={null}
                showSaveFooter={false}
              />
            </div>
          </div>
          <DialogFooter className="border-border/60 bg-muted/20 shrink-0 gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateScheduleOpen(false)}
              disabled={createScheduleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => createScheduleMutation.mutate()}
              disabled={
                createScheduleMutation.isPending || nav.screen === "regions"
              }
              className="min-w-32"
            >
              {createScheduleMutation.isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Saving…
                </>
              ) : (
                "Save row"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(scheduleDanger)}
        onOpenChange={(open) => !open && setScheduleDanger(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate schedule?</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {scheduleDanger ? (
                <>
                  <span className="text-foreground font-medium">
                    {scheduleDanger.company} · {scheduleDanger.shipName}
                  </span>{" "}
                  will be hidden from public shipping tables for this region.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deactivateScheduleMutation.error ? (
            <Alert variant="destructive">
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>
                {formatErrorMessage(deactivateScheduleMutation.error)}
              </AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                !scheduleDanger || deactivateScheduleMutation.isPending
              }
              onClick={(e) => {
                e.preventDefault();
                if (scheduleDanger) {
                  void deactivateScheduleMutation.mutateAsync(
                    scheduleDanger.id,
                  );
                }
              }}
            >
              {deactivateScheduleMutation.isPending
                ? "Deactivating…"
                : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminShippingPage() {
  return (
    <PermissionGuard permissionKey="shippingRead">
      <AdminShippingPageContent />
    </PermissionGuard>
  );
}
