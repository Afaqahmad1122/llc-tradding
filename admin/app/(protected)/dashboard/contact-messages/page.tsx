"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useReducer } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import {
  fetchAdminContactMessages,
  type AdminContactMessage,
  type ContactMessageStatus,
} from "@/lib/api/contact-messages";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type ListState = {
  page: number;
  pageSize: (typeof PAGE_SIZE_OPTIONS)[number];
  searchInput: string;
  debouncedSearch: string;
  sort: "newest" | "oldest";
};

type ListAction =
  | { type: "SET_SEARCH_INPUT"; payload: string }
  | { type: "APPLY_DEBOUNCED_SEARCH"; payload: string }
  | { type: "SET_SORT"; payload: "newest" | "oldest" }
  | { type: "SET_PAGE_SIZE"; payload: (typeof PAGE_SIZE_OPTIONS)[number] }
  | { type: "SET_PAGE"; payload: number };

const initialListState: ListState = {
  page: 1,
  pageSize: 10,
  searchInput: "",
  debouncedSearch: "",
  sort: "newest",
};

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "SET_SEARCH_INPUT":
      return { ...state, searchInput: action.payload };
    case "APPLY_DEBOUNCED_SEARCH":
      if (state.debouncedSearch === action.payload) {
        return state;
      }
      return { ...state, debouncedSearch: action.payload, page: 1 };
    case "SET_SORT":
      if (state.sort === action.payload) {
        return state;
      }
      return { ...state, sort: action.payload, page: 1 };
    case "SET_PAGE_SIZE":
      if (state.pageSize === action.payload) {
        return state;
      }
      return { ...state, pageSize: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

function senderInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function statusBadgeVariant(status: ContactMessageStatus) {
  switch (status) {
    case "NEW":
      return "default" as const;
    case "IN_REVIEW":
      return "secondary" as const;
    case "RESOLVED":
      return "outline" as const;
    case "SPAM":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function statusLabel(status: ContactMessageStatus) {
  switch (status) {
    case "NEW":
      return "New";
    case "IN_REVIEW":
      return "In review";
    case "RESOLVED":
      return "Resolved";
    case "SPAM":
      return "Spam";
    default:
      return status;
  }
}

function MessageCard({ item }: { item: AdminContactMessage }) {
  const created = new Date(item.createdAt);

  return (
    <article className="min-w-0 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <Avatar className="ring-border hidden sm:flex ring-2" size="default">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
            {senderInitials(item.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <Avatar className="ring-border shrink-0 ring-2 sm:hidden" size="sm">
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-medium">
                  {senderInitials(item.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-semibold tracking-tight">
                  {item.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {item.email}
                </p>
                <p className="text-muted-foreground truncate font-mono text-xs">
                  {item.phone}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              <Badge variant={statusBadgeVariant(item.status)}>
                {statusLabel(item.status)}
              </Badge>
              <time
                className="text-muted-foreground text-xs tabular-nums"
                dateTime={item.createdAt}
              >
                {format(created, "MMM d, yyyy · HH:mm")}
              </time>
            </div>
          </div>

          <p className="text-foreground/90 text-sm leading-relaxed wrap-break-word text-pretty">
            {item.message}
          </p>

          {(item.country ||
            item.city ||
            item.company ||
            item.vehicleRequirement) && (
            <dl className="text-muted-foreground grid gap-2 text-xs sm:grid-cols-2">
              {item.company ? (
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="font-medium text-foreground/70">Company</dt>
                  <dd className="wrap-break-word">{item.company}</dd>
                </div>
              ) : null}
              {item.country || item.city ? (
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="font-medium text-foreground/70">Location</dt>
                  <dd className="wrap-break-word">
                    {[item.city, item.country].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
              ) : null}
              {item.vehicleRequirement ? (
                <div className="min-w-0 sm:col-span-2">
                  <dt className="font-medium text-foreground/70">
                    Vehicle requirement
                  </dt>
                  <dd className="wrap-break-word mt-0.5">{item.vehicleRequirement}</dd>
                </div>
              ) : null}
            </dl>
          )}

          {item.adminNote ? (
            <div className="bg-muted/60 rounded-md border px-3 py-2 text-xs">
              <p className="text-muted-foreground font-medium">Internal note</p>
              <p className="text-foreground/90 mt-1 wrap-break-word">
                {item.adminNote}
              </p>
            </div>
          ) : null}

          {item.reviewedBy ? (
            <p className="text-muted-foreground text-xs">
              Handled by{" "}
              <span className="text-foreground font-medium">
                {item.reviewedBy.name}
              </span>
              {item.reviewedAt ? (
                <>
                  {" "}
                  ·{" "}
                  <time dateTime={item.reviewedAt}>
                    {format(new Date(item.reviewedAt), "MMM d, yyyy HH:mm")}
                  </time>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function AdminContactMessagesPage() {
  const [list, dispatch] = useReducer(listReducer, initialListState);

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
      "admin-contact-messages",
      list.page,
      list.pageSize,
      list.debouncedSearch,
      list.sort,
    ],
    queryFn: () =>
      fetchAdminContactMessages({
        page: list.page,
        pageSize: list.pageSize,
        ...(list.debouncedSearch ? { search: list.debouncedSearch } : {}),
        sort: list.sort,
      }),
    placeholderData: keepPreviousData,
  });

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const canPrev = list.page > 1;
  const canNext = totalPages > 0 && list.page < totalPages;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Contact messages</h1>
        <p className="text-muted-foreground text-sm">
          Inbox from the site contact form. Search or sort as needed.
        </p>
      </div>

      <div className="bg-card text-card-foreground flex min-w-0 flex-col overflow-hidden rounded-lg border shadow-xs ring-1 ring-foreground/10">
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              {pagination != null ? (
                <>
                  <span className="text-foreground font-medium tabular-nums">
                    {pagination.total === 0
                      ? 0
                      : (pagination.page - 1) * pagination.pageSize + 1}
                    –
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total,
                    )}
                  </span>
                  <span className="text-muted-foreground"> of </span>
                  <span className="text-foreground font-medium tabular-nums">
                    {pagination.total}
                  </span>
                  <span className="text-muted-foreground"> messages</span>
                </>
              ) : (
                "\u00a0"
              )}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground whitespace-nowrap">
                Per page
              </span>
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

          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-0 flex-1">
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Search
              </label>
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  value={list.searchInput}
                  onChange={(e) =>
                    dispatch({ type: "SET_SEARCH_INPUT", payload: e.target.value })
                  }
                  placeholder="Name, email, phone, message…"
                  className="pl-9"
                  autoComplete="off"
                  aria-label="Search messages"
                />
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto">
              <label className="flex w-full min-w-36 flex-col gap-1.5 sm:w-auto">
                <span className="text-muted-foreground text-xs font-medium">
                  Sort
                </span>
                <NativeSelect
                  value={list.sort}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SORT",
                      payload: e.target.value as "newest" | "oldest",
                    })
                  }
                >
                  <NativeSelectOption value="newest">Newest first</NativeSelectOption>
                  <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
                </NativeSelect>
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {isError ? (
          <div className="p-4 sm:p-6">
            <Alert variant="destructive" role="alert">
              <AlertTitle>Could not load messages</AlertTitle>
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
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No messages</EmptyTitle>
                <EmptyDescription>
                  {list.debouncedSearch
                    ? "Try a different search or clear the field."
                    : "Submissions from the contact form will show up here."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-border/80 bg-muted/25 divide-y">
              {data?.data.map((row) => (
                <MessageCard key={row.id} item={row} />
              ))}
            </div>
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
          <>
            <Separator />
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-muted-foreground text-center text-sm sm:text-left">
                Page{" "}
                <span className="text-foreground font-medium tabular-nums">
                  {list.page}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium tabular-nums">
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
                    dispatch({ type: "SET_PAGE", payload: Math.max(1, list.page - 1) })
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
          </>
        ) : null}
      </div>
    </div>
  );
}
