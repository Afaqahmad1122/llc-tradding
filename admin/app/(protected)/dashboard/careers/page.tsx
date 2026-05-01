"use client";

import { useMutation, useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Briefcase,
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil,
  SearchIcon,
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  createAdminJob,
  deactivateAdminJob,
  fetchAdminJobs,
  updateAdminJob,
  type AdminJob,
  type AdminJobsQuery,
} from "@/lib/api/jobs";
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
  if (desc.length < 10)
    return "Description must be at least 10 characters.";
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

function buildJobsQuery(
  list: ListState,
): AdminJobsQuery {
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

export default function AdminCareersPage() {
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

  const [deactivateJob, setDeactivateJob] = useState<AdminJob | null>(null);

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
        ...(createFields.type.trim()
          ? { type: createFields.type.trim() }
          : {}),
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
      setDeactivateJob(null);
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

  const editOpen = Boolean(editJob && editFields);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Careers</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            Manage job postings. Deactivating a role hides it from the site; edit to
            activate again.
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
                  <span className="text-muted-foreground font-normal"> of </span>
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
              <span className="text-muted-foreground whitespace-nowrap">Rows</span>
              <NativeSelect
                value={String(list.pageSize)}
                onChange={(e) => {
                  dispatch({
                    type: "SET_PAGE_SIZE",
                    payload: Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number],
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
                <NativeSelectOption value="latest">Newest first</NativeSelectOption>
                <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
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
                <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
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
            <ul className="divide-border/40 list-none divide-y">
              {data?.data.map((job) => {
                const created = new Date(job.createdAt);

                return (
                  <li key={job.id}>
                    <article className="hover:bg-muted/20 flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-start sm:justify-between sm:p-5">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-foreground truncate text-base font-semibold tracking-tight">
                            {job.title}
                          </h2>
                          <Badge variant={job.isActive ? "default" : "outline"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-muted-foreground text-xs tabular-nums">
                            {job._count.applications}{" "}
                            {job._count.applications === 1 ? "application" : "applications"}
                          </span>
                        </div>
                        <dl className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-xs">
                          <div>
                            <dt className="sr-only">Slug</dt>
                            <dd className="font-mono text-[11px] text-foreground/80">
                              /jobs/{job.slug}
                            </dd>
                          </div>
                          {job.location ? (
                            <div>
                              <dt className="font-medium text-foreground/70">
                                Location{" "}
                              </dt>
                              <dd>{job.location}</dd>
                            </div>
                          ) : null}
                          {job.type ? (
                            <div>
                              <dt className="font-medium text-foreground/70">
                                Type{" "}
                              </dt>
                              <dd>{job.type}</dd>
                            </div>
                          ) : null}
                          <div>
                            <dt className="font-medium text-foreground/70">
                              Listed{" "}
                            </dt>
                            <dd>
                              <time dateTime={job.createdAt}>
                                {format(created, "MMM d, yyyy · HH:mm")}
                              </time>
                            </dd>
                          </div>
                        </dl>
                        <p className="text-foreground/90 line-clamp-2 text-sm leading-relaxed wrap-break-word text-pretty">
                          {job.description}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-stretch">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(job)}
                        >
                          <Pencil data-icon="inline-start" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!job.isActive || deactivateMutation.isPending}
                          onClick={() => {
                            deactivateMutation.reset();
                            setDeactivateJob(job);
                          }}
                        >
                          <UserMinus data-icon="inline-start" />
                          Deactivate
                        </Button>
                      </div>
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
            <DialogTitle>New job posting</DialogTitle>
            <DialogDescription>
              Slug is generated from the title until you edit it. Title, slug, and
              description are required by the API.
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
            <DialogTitle>Edit job</DialogTitle>
            <DialogDescription>
              Changes apply immediately. Use the listing toggle to hide or show the
              role on the public careers page.
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

      <AlertDialog
        open={Boolean(deactivateJob)}
        onOpenChange={(open) => {
          if (!open) setDeactivateJob(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate job?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateJob ? (
                <>
                  <span className="text-foreground font-medium">
                    {deactivateJob.title}
                  </span>{" "}
                  will be hidden from the public careers page. You can activate it
                  again from edit.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deactivateMutation.error ? (
            <Alert variant="destructive">
              <AlertTitle>Could not deactivate</AlertTitle>
              <AlertDescription>
                {deactivateMutation.error instanceof ApiError
                  ? deactivateMutation.error.message
                  : deactivateMutation.error instanceof Error
                    ? deactivateMutation.error.message
                    : "Request failed"}
              </AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!deactivateJob || deactivateMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deactivateJob) deactivateMutation.mutate(deactivateJob.id);
              }}
            >
              {deactivateMutation.isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
