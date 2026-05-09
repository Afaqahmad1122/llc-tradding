"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { format } from "date-fns";
import {
  Building2,
  Car,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  Mail,
  MapPin,
  Phone,
  SearchIcon,
  X,
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
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import {
  fetchAdminContactMessages,
  type AdminContactMessage,
  type ContactMessageStatus,
} from "@/lib/api/contact-messages";
import { cn } from "@/lib/utils";

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[\s()-]/g, "")}`;
}

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
  const isNew = item.status === "NEW";

  return (
    <article
      className={cn(
        "bg-card min-w-0 rounded-xl border shadow-xs ring-1 transition-colors ring-foreground/5",
        "hover:bg-muted/20",
        isNew && "ring-primary/25 shadow-sm ring-2",
      )}
    >
      <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
        <Avatar className="ring-border hidden sm:flex ring-2" size="default">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
            {senderInitials(item.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <Avatar className="ring-border shrink-0 ring-2 sm:hidden" size="sm">
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-medium">
                  {senderInitials(item.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <p className="text-foreground text-base font-semibold tracking-tight sm:text-sm">
                  {item.name}
                </p>
                <div className="flex min-w-0 flex-col gap-1.5 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                  <a
                    href={`mailto:${item.email}`}
                    className="text-muted-foreground hover:text-foreground group inline-flex min-w-0 max-w-full items-center gap-1.5 underline-offset-4 hover:underline"
                  >
                    <Mail className="text-muted-foreground/80 size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{item.email}</span>
                  </a>
                  <a
                    href={phoneHref(item.phone)}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono tabular-nums underline-offset-4 hover:underline"
                  >
                    <Phone className="text-muted-foreground/80 size-3.5 shrink-0" aria-hidden />
                    {item.phone}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
              <Badge className="font-medium" variant={statusBadgeVariant(item.status)}>
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

          <div className="bg-muted/35 border-border/80 rounded-lg border px-3.5 py-3 sm:px-4 sm:py-3.5">
            <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-wide uppercase">
              Message
            </p>
            <p className="text-foreground/95 text-sm leading-relaxed wrap-break-word text-pretty">
              {item.message}
            </p>
          </div>

          {(item.country ||
            item.city ||
            item.company ||
            item.vehicleRequirement) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {item.company ? (
                <Item variant="outline" size="sm" className="min-w-0 border-dashed">
                  <ItemMedia variant="icon">
                    <Building2 className="text-muted-foreground" aria-hidden />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="text-[11px] font-medium text-muted-foreground">
                      Company
                    </ItemTitle>
                    <ItemDescription className="line-clamp-none wrap-break-word text-foreground">
                      {item.company}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ) : null}
              {item.country || item.city ? (
                <Item variant="outline" size="sm" className="min-w-0 border-dashed">
                  <ItemMedia variant="icon">
                    <MapPin className="text-muted-foreground" aria-hidden />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="text-[11px] font-medium text-muted-foreground">
                      Location
                    </ItemTitle>
                    <ItemDescription className="line-clamp-none wrap-break-word text-foreground">
                      {[item.city, item.country].filter(Boolean).join(", ") || "—"}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ) : null}
              {item.vehicleRequirement ? (
                <Item
                  variant="outline"
                  size="sm"
                  className="min-w-0 border-dashed sm:col-span-2"
                >
                  <ItemMedia variant="icon">
                    <Car className="text-muted-foreground" aria-hidden />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="text-[11px] font-medium text-muted-foreground">
                      Vehicle requirement
                    </ItemTitle>
                    <ItemDescription className="line-clamp-none wrap-break-word text-foreground">
                      {item.vehicleRequirement}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ) : null}
            </div>
          )}

          {item.adminNote ? (
            <div className="border-primary/20 from-muted/50 rounded-lg border bg-linear-to-b to-transparent px-3.5 py-3">
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                Internal note
              </p>
              <p className="text-foreground/90 mt-1.5 text-sm wrap-break-word leading-relaxed">
                {item.adminNote}
              </p>
            </div>
          ) : null}

          {item.reviewedBy ? (
            <p className="text-muted-foreground border-border/60 flex flex-wrap items-center gap-x-1 border-t pt-3 text-xs">
              <span>Handled by</span>
              <span className="text-foreground font-medium">{item.reviewedBy.name}</span>
              {item.reviewedAt ? (
                <>
                  <span aria-hidden>·</span>
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

function AdminContactMessagesPageContent() {
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
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Read and follow up on inquiries. Click email or phone to open your mail client or dial.
        </p>
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
                  <span className="text-muted-foreground font-normal"> in this inbox</span>
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
              <div className="relative flex gap-1.5">
                <div className="relative min-w-0 flex-1">
                  <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                  <Input
                    value={list.searchInput}
                    onChange={(e) =>
                      dispatch({ type: "SET_SEARCH_INPUT", payload: e.target.value })
                    }
                    placeholder="Name, email, phone, or message…"
                    className="pr-9 pl-9"
                    autoComplete="off"
                    aria-label="Search messages"
                  />
                  {list.searchInput.length > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2"
                      onClick={() => dispatch({ type: "SET_SEARCH_INPUT", payload: "" })}
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            <label className="flex w-full min-w-36 flex-col gap-1.5 sm:w-auto">
              <span className="text-muted-foreground text-xs font-medium">Sort</span>
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
            <ul className="divide-border/40 list-none space-y-3 p-3 sm:p-4">
              {data?.data.map((row) => (
                <li key={row.id}>
                  <MessageCard item={row} />
                </li>
              ))}
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
        ) : null}
      </div>
    </div>
  );
}

export default function AdminContactMessagesPage() {
  return (
    <PermissionGuard permissionKey="contactRead">
      <AdminContactMessagesPageContent />
    </PermissionGuard>
  );
}
