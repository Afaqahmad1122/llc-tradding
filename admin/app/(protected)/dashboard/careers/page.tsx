"use client";

import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Briefcase,
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil,
  SearchIcon,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  createAdminJob,
  deactivateAdminJob,
  fetchAdminJobs,
  permanentlyDeleteAdminJob,
  updateAdminJob,
  type AdminJob,
  type AdminJobsQuery,
  type DeactivateAdminJobResponse,
} from "@/lib/api/jobs";
import { cn } from "@/lib/utils";
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type VisibilityFilter = "all" | "active" | "inactive";

type ListState = {
  page: number;
  pageSize: (typeof PAGE_SIZE_OPTIONS)[number];
  searchInput: string;
  debouncedSearch: string;
  sort: "latest" | "oldest";
  visibility: VisibilityFilter;
};

type ListAction =
  | { type: "SET_SEARCH_INPUT"; payload: string }
  | { type: "APPLY_DEBOUNCED_SEARCH"; payload: string }
  | { type: "SET_SORT"; payload: "latest" | "oldest" }
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

function slugFromTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidOptionalEmail(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type JobFields = {
  title: string;
  slug: string;
  location: string;
  type: string;
  description: string;
  applyEmail: string;
  isActive: boolean;
};

function validateJobFields(v: JobFields): string | null {
  if (!v.title.trim() || v.title.trim().length < 2)
    return "Title must be at least 2 characters.";
  const slugNorm = slugFromTitle(v.slug);
  if (!slugNorm || slugNorm.length < 2)
    return "Slug must be at least 2 characters.";
  const desc = v.description.trim();
  if (desc.length < 10) return "Description must be at least 10 characters.";
  if (!isValidOptionalEmail(v.applyEmail)) return "Apply email must be valid.";
  return null;
}

function jobToFields(job: AdminJob): JobFields {
  return {
    title: job.title,
    slug: job.slug,
    location: job.location ?? "",
    type: job.type ?? "",
    description: job.description,
    applyEmail: job.applyEmail ?? "",
    isActive: job.isActive,
  };
}

function emptyJobFields(active = true): JobFields {
  return {
    title: "",
    slug: "",
    location: "",
    type: "",
    description: "",
    applyEmail: "",
    isActive: active,
  };
}

function buildJobsQuery(list: ListState): AdminJobsQuery {
  const query: AdminJobsQuery = {
    page: list.page,
    pageSize: list.pageSize,
    ...(list.debouncedSearch ? { search: list.debouncedSearch } : {}),
    ...(list.sort === "oldest" ? { sort: "oldest" } : {}),
  };
  if (list.visibility === "active") query.isActive = true;
  if (list.visibility === "inactive") query.isActive = false;
  return query;
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Request failed";
}

type JobDangerAction =
  | { kind: "deactivate"; job: AdminJob }
  | { kind: "delete"; job: AdminJob };

function JobStatusBadge({ isActive }: { isActive: boolean }) {
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

function JobMetaItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-muted/25 flex min-w-0 flex-col gap-1 rounded-lg border border-border/60 px-3 py-2.5">
      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </p>
      <div className="text-foreground min-w-0 wrap-break-word text-sm leading-snug">
        {children}
      </div>
    </div>
  );
}

function JobRowActions({
  job,
  onEdit,
  onDeactivate,
  onDelete,
  deactivatePending,
  deletePending,
}: {
  job: AdminJob;
  onEdit: (job: AdminJob) => void;
  onDeactivate: (job: AdminJob) => void;
  onDelete: (job: AdminJob) => void;
  deactivatePending: boolean;
  deletePending: boolean;
}) {
  return (
    <div
      className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:max-w-[min(100%,20rem)] sm:flex-col sm:items-stretch"
      role="group"
      aria-label={`Actions for ${job.title}`}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="inline-flex min-h-9 flex-1 items-center gap-2 sm:flex-initial"
        onClick={() => onEdit(job)}
      >
        <Pencil className="size-3.5 shrink-0" aria-hidden />
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="inline-flex min-h-9 flex-1 items-center gap-2 sm:flex-initial"
        disabled={!job.isActive || deactivatePending}
        onClick={() => onDeactivate(job)}
      >
        <UserMinus className="size-3.5 shrink-0" aria-hidden />
        Hide listing
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive border-destructive/35 hover:bg-destructive/10 inline-flex min-h-9 flex-1 items-center gap-2 sm:flex-initial"
        disabled={deletePending}
        onClick={() => onDelete(job)}
      >
        <Trash2 className="size-3.5 shrink-0" aria-hidden />
        Delete
      </Button>
    </div>
  );
}

type JobDangerMut = UseMutationResult<
  DeactivateAdminJobResponse,
  unknown,
  string
>;

function JobDangerDialog({
  action,
  onOpenChange,
  deactivateMutation,
  deleteMutation,
}: {
  action: JobDangerAction | null;
  onOpenChange: (open: boolean) => void;
  deactivateMutation: JobDangerMut;
  deleteMutation: JobDangerMut;
}) {
  const open = Boolean(action);
  const isDelete = action?.kind === "delete";
  const job = action?.job;
  const mutation = isDelete ? deleteMutation : deactivateMutation;
  const mutationError = mutation.error;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDelete
              ? "Delete job permanently?"
              : "Hide job from careers page?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-pretty">
            {job && isDelete ? (
              <>
                <span className="text-foreground font-medium">{job.title}</span>{" "}
                will be removed from the database.{" "}
                <span className="text-foreground font-medium tabular-nums">
                  {job._count.applications}
                </span>{" "}
                {job._count.applications === 1 ? "application" : "applications"}{" "}
                will be deleted. This cannot be undone.
              </>
            ) : job ? (
              <>
                <span className="text-foreground font-medium">{job.title}</span>{" "}
                will no longer appear on the public careers page. You can show
                it again by editing the job and enabling the listing.
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutationError ? (
          <Alert variant="destructive">
            <AlertTitle>
              {isDelete ? "Delete failed" : "Could not hide listing"}
            </AlertTitle>
            <AlertDescription>
              {formatErrorMessage(mutationError)}
            </AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter className="gap-2 sm:gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={isDelete ? "destructive" : "default"}
            disabled={!job || mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              if (!job) return;
              mutation.mutate(job.id);
            }}
          >
            {mutation.isPending
              ? isDelete
                ? "Deleting…"
                : "Hiding…"
              : isDelete
                ? "Delete permanently"
                : "Hide listing"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function JobFormFields({
  fields,
  onChange,
  idPrefix,
}: {
  fields: JobFields;
  onChange: (patch: Partial<JobFields>) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid max-h-[min(65vh,calc(100vh-14rem))] gap-4 overflow-y-auto sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={fields.title}
          onChange={(e) => onChange({ title: e.target.value })}
          autoComplete="off"
          maxLength={200}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-slug`}>Slug</Label>
        <Input
          id={`${idPrefix}-slug`}
          value={fields.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          spellCheck={false}
          autoComplete="off"
          className="font-mono text-sm"
          maxLength={120}
        />
        <p className="text-muted-foreground text-xs">
          Lowercase letters, numbers, and hyphens. Used in URLs.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-location`}>Location</Label>
        <Input
          id={`${idPrefix}-location`}
          value={fields.location}
          onChange={(e) => onChange({ location: e.target.value })}
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-type`}>Employment type</Label>
        <Input
          id={`${idPrefix}-type`}
          value={fields.type}
          onChange={(e) => onChange({ type: e.target.value })}
          placeholder="Full-time"
          autoComplete="off"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={fields.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={8}
          className="resize-y font-[inherit]"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-apply`}>Applications email override</Label>
        <Input
          id={`${idPrefix}-apply`}
          type="email"
          value={fields.applyEmail}
          onChange={(e) => onChange({ applyEmail: e.target.value })}
          autoComplete="off"
          placeholder="Leave blank for default outbound address"
        />
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox
          id={`${idPrefix}-active`}
          checked={fields.isActive}
          onCheckedChange={(c) => onChange({ isActive: c === true })}
        />
        <Label htmlFor={`${idPrefix}-active`} className="font-normal">
          Listing visible on the public careers page
        </Label>
      </div>
    </div>
  );
}

function AdminCareersPageContent() {
  const qc = useQueryClient();
  const [list, dispatch] = useReducer(listReducer, initialListState);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSlugTouched, setCreateSlugTouched] = useState(false);
  const [createFields, setCreateFields] = useState<JobFields>(() =>
    emptyJobFields(true),
  );
  const [createError, setCreateError] = useState<string | null>(null);

  const [editJob, setEditJob] = useState<AdminJob | null>(null);
  const [editFields, setEditFields] = useState<JobFields | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [dangerAction, setDangerAction] = useState<JobDangerAction | null>(
    null,
  );

  const editJobRef = useRef<AdminJob | null>(null);

  useEffect(() => {
    editJobRef.current = editJob;
  }, [editJob]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      dispatch({
        type: "APPLY_DEBOUNCED_SEARCH",
        payload: list.searchInput.trim(),
      });
    }, 320);
    return () => window.clearTimeout(t);
  }, [list.searchInput]);

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: [
      "admin-jobs",
      list.page,
      list.pageSize,
      list.debouncedSearch,
      list.sort,
      list.visibility,
    ],
    queryFn: () => fetchAdminJobs(buildJobsQuery(list)),
    placeholderData: keepPreviousData,
  });

  const invalidateJobs = () =>
    qc.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "admin-jobs",
    });

  const createMutation = useMutation({
    mutationFn: () => {
      const err = validateJobFields(createFields);
      if (err) throw new Error(err);
      return createAdminJob({
        title: createFields.title.trim(),
        slug: slugFromTitle(createFields.slug || createFields.title),
        description: createFields.description.trim(),
        ...(createFields.location.trim()
          ? { location: createFields.location.trim() }
          : {}),
        ...(createFields.type.trim() ? { type: createFields.type.trim() } : {}),
        ...(createFields.applyEmail.trim()
          ? { applyEmail: createFields.applyEmail.trim() }
          : {}),
        isActive: createFields.isActive,
      });
    },
    onSuccess: () => {
      setCreateOpen(false);
      setCreateFields(emptyJobFields(true));
      setCreateSlugTouched(false);
      setCreateError(null);
      void invalidateJobs();
    },
    onError: (e: unknown) => {
      setCreateError(e instanceof Error ? e.message : String(e));
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editJob || !editFields) throw new Error("No job selected.");
      const err = validateJobFields(editFields);
      if (err) throw new Error(err);
      return updateAdminJob(editJob.id, {
        title: editFields.title.trim(),
        slug: slugFromTitle(editFields.slug),
        description: editFields.description.trim(),
        location: editFields.location.trim(),
        type: editFields.type.trim(),
        ...(editFields.applyEmail.trim()
          ? { applyEmail: editFields.applyEmail.trim() }
          : {}),
        isActive: editFields.isActive,
      });
    },
    onSuccess: () => {
      setEditJob(null);
      setEditFields(null);
      setEditError(null);
      void invalidateJobs();
    },
    onError: (e: unknown) => {
      setEditError(e instanceof Error ? e.message : String(e));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateAdminJob(id),
    onSuccess: () => {
      setDangerAction(null);
      void invalidateJobs();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => permanentlyDeleteAdminJob(id),
    onSuccess: (_, deletedId) => {
      setDangerAction(null);
      if (editJobRef.current?.id === deletedId) {
        setEditJob(null);
        setEditFields(null);
      }
      void invalidateJobs();
    },
  });

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const canPrev = list.page > 1;
  const canNext = totalPages > 0 && list.page < totalPages;

  const openCreate = () => {
    setCreateError(null);
    setCreateSlugTouched(false);
    setCreateFields(emptyJobFields(true));
    setCreateOpen(true);
  };

  const patchCreateFields = (patch: Partial<JobFields>) => {
    if ("title" in patch && Object.keys(patch).length === 1) {
      setCreateFields((f) => ({
        ...f,
        title: patch.title as string,
        slug: createSlugTouched ? f.slug : slugFromTitle(patch.title as string),
      }));
      return;
    }
    if ("slug" in patch) setCreateSlugTouched(true);
    setCreateFields((f) => ({ ...f, ...patch }));
  };

  const patchEditFields = (patch: Partial<JobFields>) => {
    setEditFields((f) => (f ? { ...f, ...patch } : f));
  };

  const openEdit = (job: AdminJob) => {
    setEditError(null);
    setEditJob(job);
    setEditFields(jobToFields(job));
  };

  const openDeactivateConfirm = (job: AdminJob) => {
    deleteMutation.reset();
    deactivateMutation.reset();
    setDangerAction({ kind: "deactivate", job });
  };

  const openDeleteConfirm = (job: AdminJob) => {
    deactivateMutation.reset();
    deleteMutation.reset();
    setDangerAction({ kind: "delete", job });
  };

  const editOpen = Boolean(editJob && editFields);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Careers</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            Hide a listing to remove it from the site without losing data, or delete
            permanently when the role should be removed from the system.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0">
          New job
        </Button>
      </div>

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
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    of{" "}
                  </span>
                  <span className="text-foreground font-semibold">
                    {pagination.total}
                  </span>
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    jobs
                  </span>
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
                className="w-18"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <NativeSelectOption key={n} value={String(n)}>
                    {n}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
                  placeholder="Title, slug, location, type…"
                  className="pr-9 pl-9"
                  autoComplete="off"
                  aria-label="Search jobs"
                />
                {list.searchInput.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2"
                    onClick={() =>
                      dispatch({ type: "SET_SEARCH_INPUT", payload: "" })
                    }
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
            <label className="flex w-full min-w-36 flex-col gap-1.5 sm:w-auto">
              <span className="text-muted-foreground text-xs font-medium">
                Sort
              </span>
              <NativeSelect
                value={list.sort}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SORT",
                    payload: e.target.value as "latest" | "oldest",
                  })
                }
              >
                <NativeSelectOption value="latest">
                  Newest first
                </NativeSelectOption>
                <NativeSelectOption value="oldest">
                  Oldest first
                </NativeSelectOption>
              </NativeSelect>
            </label>
            <label className="flex w-full min-w-36 flex-col gap-1.5 sm:w-auto">
              <span className="text-muted-foreground text-xs font-medium">
                Status
              </span>
              <NativeSelect
                value={list.visibility}
                onChange={(e) =>
                  dispatch({
                    type: "SET_VISIBILITY",
                    payload: e.target.value as VisibilityFilter,
                  })
                }
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

        {isError ? (
          <div className="p-4 sm:p-6">
            <Alert variant="destructive" role="alert">
              <AlertTitle>Could not load jobs</AlertTitle>
              <AlertDescription>
                {error instanceof ApiError
                  ? error.message
                  : "Something went wrong. Try again."}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="relative min-h-48 min-w-0">
          {isPending && !data ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="size-6" />
            </div>
          ) : data?.data.length === 0 ? (
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Briefcase />
                </EmptyMedia>
                <EmptyTitle>No jobs</EmptyTitle>
                <EmptyDescription>
                  {list.debouncedSearch
                    ? "Try another search or clear the field."
                    : "Create a job to show it on the public careers page."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-border/50 list-none divide-y">
              {data?.data.map((job) => {
                const created = new Date(job.createdAt);

                return (
                  <li key={job.id}>
                    <article className="hover:bg-muted/15 flex flex-col gap-5 p-5 transition-colors lg:flex-row lg:gap-8">
                      <div className="flex min-w-0 flex-1 flex-col gap-5">
                        <header className="flex flex-wrap items-start gap-3 gap-y-2">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-foreground text-lg font-semibold tracking-tight wrap-break-word">
                                {job.title}
                              </h2>
                              <JobStatusBadge isActive={job.isActive} />
                            </div>
                            <p className="text-muted-foreground text-xs tabular-nums">
                              {job._count.applications}{" "}
                              {job._count.applications === 1
                                ? "application"
                                : "applications"}
                              {" · "}
                              inactive listings stay in this list until deleted
                            </p>
                          </div>
                        </header>

                        <div
                          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
                          aria-label="Job details"
                          role="group"
                        >
                          <JobMetaItem label="URL slug">
                            <code className="bg-muted/80 text-foreground/90 rounded px-1.5 py-0.5 font-mono text-[11px] tracking-tight">
                              /{job.slug}
                            </code>
                          </JobMetaItem>
                          <JobMetaItem label="Location">
                            {job.location ?? (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </JobMetaItem>
                          <JobMetaItem label="Employment type">
                            {job.type ?? (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </JobMetaItem>
                          <JobMetaItem label="Listed">
                            <time dateTime={job.createdAt} className="tabular-nums">
                              {format(created, "MMM d, yyyy · HH:mm")}
                            </time>
                          </JobMetaItem>
                        </div>

                        <div className="border-border/60 bg-muted/15 rounded-lg border px-4 py-3">
                          <p className="text-muted-foreground mb-1 text-[10px] font-semibold uppercase tracking-wider">
                            Description
                          </p>
                          <p className="text-foreground/95 text-sm leading-relaxed wrap-break-word text-pretty whitespace-pre-wrap">
                            {job.description}
                          </p>
                        </div>
                      </div>

                      <JobRowActions
                        job={job}
                        onEdit={openEdit}
                        onDeactivate={openDeactivateConfirm}
                        onDelete={openDeleteConfirm}
                        deactivatePending={
                          dangerAction?.kind === "deactivate" &&
                          dangerAction.job.id === job.id &&
                          deactivateMutation.isPending
                        }
                        deletePending={
                          dangerAction?.kind === "delete" &&
                          dangerAction.job.id === job.id &&
                          deleteMutation.isPending
                        }
                      />
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          {isFetching && data ? (
            <div
              className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-16 sm:pt-20"
              aria-busy
              aria-label="Loading"
            >
              <Spinner className="text-muted-foreground size-6" />
            </div>
          ) : null}
        </div>

        {totalPages > 0 ? (
          <div className="border-border/60 bg-muted/20 flex flex-col gap-4 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-muted-foreground text-center text-sm sm:text-left">
              Page{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {list.page}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {totalPages}
              </span>
            </p>
            <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-0 flex-1 sm:flex-initial"
                disabled={!canPrev || isFetching}
                onClick={() =>
                  dispatch({
                    type: "SET_PAGE",
                    payload: Math.max(1, list.page - 1),
                  })
                }
              >
                <ChevronLeftIcon data-icon="inline-start" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-0 flex-1 sm:flex-initial"
                disabled={!canNext || isFetching}
                onClick={() =>
                  dispatch({ type: "SET_PAGE", payload: list.page + 1 })
                }
              >
                Next
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateError(null);
            setCreateSlugTouched(false);
          }
        }}
      >
        <DialogContent
          showCloseButton
          className="max-h-[calc(100dvh-2rem)] gap-5 sm:max-w-lg md:max-w-xl"
        >
          <DialogHeader>
            <DialogTitle>Create a careers listing</DialogTitle>
            <DialogDescription>
              This job will appear on the public careers page when the listing is set
              to visible. The URL slug is suggested from the role title until you edit
              it. You need a role title, slug, and description; other fields are
              optional.
            </DialogDescription>
          </DialogHeader>
          <JobFormFields
            idPrefix="create"
            fields={createFields}
            onChange={patchCreateFields}
          />
          {createError ? (
            <Alert variant="destructive">
              <AlertTitle>Create failed</AlertTitle>
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                setCreateError(null);
                createMutation.mutate();
              }}
              className="inline-flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Saving…
                </>
              ) : (
                "Create job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditJob(null);
            setEditFields(null);
            setEditError(null);
          }
        }}
      >
        <DialogContent
          showCloseButton
          className="max-h-[calc(100dvh-2rem)] gap-5 sm:max-w-lg md:max-w-xl"
        >
          <DialogHeader>
            <DialogTitle>Edit careers listing</DialogTitle>
            <DialogDescription>
              Updates apply as soon as you save. Turn the visibility option off to
              hide this role from the public careers page without removing it from
              the admin list.
            </DialogDescription>
          </DialogHeader>
          {editFields ? (
            <JobFormFields
              idPrefix="edit"
              fields={editFields}
              onChange={patchEditFields}
            />
          ) : null}
          {editError ? (
            <Alert variant="destructive">
              <AlertTitle>Update failed</AlertTitle>
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditJob(null);
                setEditFields(null);
                setEditError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={updateMutation.isPending || !editFields}
              onClick={() => {
                setEditError(null);
                updateMutation.mutate();
              }}
              className="inline-flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <JobDangerDialog
        action={dangerAction}
        onOpenChange={(open) => {
          if (!open) {
            deactivateMutation.reset();
            deleteMutation.reset();
            setDangerAction(null);
          }
        }}
        deactivateMutation={deactivateMutation}
        deleteMutation={deleteMutation}
      />
    </div>
  );
}

export default function AdminCareersPage() {
  return (
    <PermissionGuard permissionKey="careersRead">
      <AdminCareersPageContent />
    </PermissionGuard>
  );
}