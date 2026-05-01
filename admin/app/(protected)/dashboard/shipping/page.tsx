"use client";

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
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinned,
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import {
  createAdminShippingRegion,
  createAdminShippingSchedule,
  deactivateAdminShippingRegion,
  deactivateAdminShippingSchedule,
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
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

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

type PortDraft = { portName: string; cellText: string };

function portsFromSchedule(
  kind: "departure" | "arrival",
  schedule: AdminShippingSchedule,
): PortDraft[] {
  if (kind === "departure") {
    return schedule.departures.map((d) => ({
      portName: d.portName,
      cellText: d.etdText,
    }));
  }
  return schedule.arrivals.map((a) => ({
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
}: {
  title: string;
  hint: string;
  rows: PortDraft[];
  onChange: (next: PortDraft[]) => void;
  onSave: () => void;
  disabled?: boolean;
  pending: boolean;
  error: string | null;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  const updateRow = (index: number, patch: Partial<PortDraft>) => {
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
            onChange([...rows, { portName: "", cellText: "-" }])
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
              key={`${index}-${row.portName}`}
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
    </div>
  );
}

export default function AdminShippingPage() {
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

  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [createSchedule, setCreateSchedule] = useState({
    company: "",
    shipName: "",
    voyage: "",
    sortOrder: 0,
    isActive: true,
  });
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

  const createRegionMutation = useMutation({
    mutationFn: () =>
      createAdminShippingRegion({
        name: createRegion.name.trim(),
        slug: slugFromName(createRegion.slug || createRegion.name),
        sortOrder: createRegion.sortOrder,
        isActive: createRegion.isActive,
      }),
    onSuccess: () => {
      setCreateRegionOpen(false);
      setCreateSlugTouched(false);
      setCreateRegion({ name: "", slug: "", sortOrder: 0, isActive: true });
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

  const createScheduleMutation = useMutation({
    mutationFn: () => {
      if (nav.screen !== "schedules" && nav.screen !== "schedule") {
        throw new Error("No region");
      }
      return createAdminShippingSchedule(nav.regionId, {
        company: createSchedule.company.trim(),
        shipName: createSchedule.shipName.trim(),
        voyage: createSchedule.voyage.trim(),
        sortOrder: createSchedule.sortOrder,
        isActive: createSchedule.isActive,
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
      const seen = new Set<string>();
      for (const row of departureDrafts) {
        const name = row.portName.trim();
        const text = row.cellText.trim();
        if (!name) throw new Error("Each row needs a port name.");
        if (!text) throw new Error("ETD text cannot be empty (use “-”).");
        const key = name.toLowerCase();
        if (seen.has(key)) throw new Error("Duplicate port names are not allowed.");
        seen.add(key);
      }
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
      const seen = new Set<string>();
      for (const row of arrivalDrafts) {
        const name = row.portName.trim();
        const text = row.cellText.trim();
        if (!name) throw new Error("Each row needs a port name.");
        if (!text) throw new Error("ETA text cannot be empty (use “-”).");
        const key = name.toLowerCase();
        if (seen.has(key)) throw new Error("Duplicate port names are not allowed.");
        seen.add(key);
      }
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
    setCreateRegionOpen(true);
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
            Manage destination regions and sailing schedules shown on the public
            shipping information page.
          </p>
        </div>
        {nav.screen === "regions" ? (
          <Button type="button" onClick={openCreateRegion} className="shrink-0">
            New region
          </Button>
        ) : null}
        {nav.screen === "schedules" && schedulesRegion ? (
          <Button
            type="button"
            onClick={() => setCreateScheduleOpen(true)}
            className="shrink-0"
          >
            New schedule
          </Button>
        ) : null}
      </div>

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
            Regions
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
                    <span className="font-normal"> regions</span>
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
                    aria-label="Search regions"
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
                  <EmptyTitle>No regions</EmptyTitle>
                  <EmptyDescription>
                    Create a region to group schedules for the help center
                    shipping tables.
                  </EmptyDescription>
                </EmptyHeader>
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
                  className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:max-w-[14rem] sm:flex-col"
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
                    Schedules
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
                    disabled={!r.isActive || deactivateRegionMutation.isPending}
                    onClick={() => setRegionDanger(r)}
                  >
                    <UserMinus className="size-3.5 shrink-0" aria-hidden />
                    Deactivate
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
                <EmptyTitle>No schedules</EmptyTitle>
                <EmptyDescription>
                  Add a schedule row (company, ship, voyage) for this region.
                </EmptyDescription>
              </EmptyHeader>
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
                hint="Each save replaces all departure ports for this schedule. Use “-” when there is no ETD. Port names must be unique per schedule."
                rows={departureDrafts}
                onChange={setDepartureDrafts}
                onSave={() => saveDeparturesMutation.mutate()}
                pending={saveDeparturesMutation.isPending}
                error={departuresSaveError}
              />

              <PortRowsEditor
                title="Arrivals"
                hint="Each save replaces all arrival ports. Use “-” when there is no ETA."
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New shipping region</DialogTitle>
            <DialogDescription>
              Regions appear as tabs on the public shipping information page.
            </DialogDescription>
          </DialogHeader>
          {createRegionError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not create</AlertTitle>
              <AlertDescription>{createRegionError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid max-h-[min(60vh,calc(100vh-12rem))] gap-4 overflow-y-auto">
            <div className="space-y-2">
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
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-slug">Slug</Label>
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
              <Label htmlFor="cr-sort">Sort order</Label>
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
            <div className="flex items-center gap-2">
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
                Active
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateRegionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => createRegionMutation.mutate()}
              disabled={createRegionMutation.isPending}
            >
              {createRegionMutation.isPending ? "Creating…" : "Create"}
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
            <DialogTitle>Edit region</DialogTitle>
            <DialogDescription>
              Changes apply to the admin list and the public help center.
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

      <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New schedule</DialogTitle>
            <DialogDescription>
              Add a sailing row for{" "}
              <span className="text-foreground font-medium">
                {schedulesRegion?.name ?? "this region"}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          {createScheduleError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not create</AlertTitle>
              <AlertDescription>{createScheduleError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-4">
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
            <div className="flex items-center gap-2">
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
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateScheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => createScheduleMutation.mutate()}
              disabled={
                createScheduleMutation.isPending || nav.screen === "regions"
              }
            >
              {createScheduleMutation.isPending ? "Creating…" : "Create"}
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
