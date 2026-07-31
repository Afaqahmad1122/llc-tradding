"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

import { ForbiddenPage } from "@/components/auth/permission-guard";
import { useAdminAuthStore } from "@/stores/auth-store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
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
  fetchAdminAllUsers,
  type AdminUser,
  type AdminUserRole,
} from "@/lib/api/users";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type RoleFilter = "all" | AdminUserRole;
type StatusFilter = "all" | "active" | "inactive";

function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Try again.";
}

function AllUsersPageContent() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: [
      "admin-all-users",
      page,
      debouncedSearch,
      roleFilter,
      statusFilter,
    ],
    queryFn: () =>
      fetchAdminAllUsers({
        page,
        pageSize: PAGE_SIZE,
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
        ...(roleFilter !== "all" ? { role: roleFilter } : {}),
        ...(statusFilter !== "all"
          ? { isActive: statusFilter === "active" }
          : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalItems = data?.pagination.total ?? 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  function updateSearch(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  function updateRole(value: RoleFilter) {
    setRoleFilter(value);
    setPage(1);
  }

  function updateStatus(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-12 pt-8 sm:px-7 sm:pt-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div
            className="bg-primary/12 text-primary ring-primary/15 flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1"
            aria-hidden
          >
            <UsersRound className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              All Users
            </h1>
            <p className="text-muted-foreground max-w-xl text-pretty text-sm leading-relaxed">
              Every registered account — customers, staff, and admins — in
              one searchable list.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm ring-1 ring-border/60">
        <div className="bg-muted/25">
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="space-y-2">
              <Label
                htmlFor="all-users-search"
                className="text-muted-foreground text-xs font-medium"
              >
                Search users
              </Label>
              <div className="relative">
                <SearchIcon
                  className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  id="all-users-search"
                  className="bg-background min-h-10 border-border/80 pl-9 shadow-sm"
                  placeholder="Name or email…"
                  value={searchInput}
                  onChange={(e) => updateSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-4">
              <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-48">
                <Label
                  htmlFor="all-users-role"
                  className="text-muted-foreground text-xs font-medium"
                >
                  Role
                </Label>
                <NativeSelect
                  id="all-users-role"
                  value={roleFilter}
                  onChange={(e) =>
                    updateRole(e.target.value as RoleFilter)
                  }
                  className="bg-background min-w-0 border-border/80"
                >
                  <NativeSelectOption value="all">
                    All roles
                  </NativeSelectOption>
                  <NativeSelectOption value="ADMIN">Admin</NativeSelectOption>
                  <NativeSelectOption value="STAFF">Staff</NativeSelectOption>
                  <NativeSelectOption value="USER">
                    Customer
                  </NativeSelectOption>
                </NativeSelect>
              </div>
              <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:max-w-48">
                <Label
                  htmlFor="all-users-status"
                  className="text-muted-foreground text-xs font-medium"
                >
                  Status
                </Label>
                <NativeSelect
                  id="all-users-status"
                  value={statusFilter}
                  onChange={(e) =>
                    updateStatus(e.target.value as StatusFilter)
                  }
                  className="bg-background min-w-0 border-border/80"
                >
                  <NativeSelectOption value="all">
                    All statuses
                  </NativeSelectOption>
                  <NativeSelectOption value="active">
                    Active
                  </NativeSelectOption>
                  <NativeSelectOption value="inactive">
                    Inactive
                  </NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-56">
          {isError ? (
            <div className="p-6 sm:p-8">
              <Alert variant="destructive">
                <AlertTitle>Could not load users</AlertTitle>
                <AlertDescription>
                  {formatErrorMessage(error)}
                </AlertDescription>
              </Alert>
            </div>
          ) : isPending ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Spinner className="text-muted-foreground size-10" />
              <p className="text-muted-foreground text-sm">
                Loading users…
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-14 sm:px-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UsersRound
                      className="text-muted-foreground size-12"
                      aria-hidden
                    />
                  </EmptyMedia>
                  <EmptyTitle>No users match</EmptyTitle>
                  <EmptyDescription>
                    Adjust search or filters to see more results.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden pr-4 sm:table-cell sm:pr-5">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          )}
          {isFetching && data ? (
            <div className="bg-background/70 pointer-events-none absolute inset-0 flex items-start justify-center pt-16 sm:pt-20">
              <Spinner className="text-muted-foreground size-6" />
            </div>
          ) : null}
        </div>

        {totalPages > 0 ? (
          <div className="border-border/70 bg-muted/20 flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div className="text-muted-foreground flex flex-col gap-0.5 text-center text-sm sm:text-left">
              <p>
                Showing{" "}
                <span className="text-foreground font-medium">
                  {rows.length}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-medium">
                  {totalItems.toLocaleString()}
                </span>
              </p>
              <p>
                Page{" "}
                <span className="text-foreground font-semibold tabular-nums">
                  {page}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-semibold tabular-nums">
                  {totalPages}
                </span>
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-0 flex-1 sm:flex-initial"
                disabled={!canPrev || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => p + 1)}
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

function UserRow({ user }: { user: AdminUser }) {
  const roleVariant =
    user.role === "ADMIN"
      ? "default"
      : user.role === "STAFF"
        ? "secondary"
        : "outline";

  return (
    <TableRow>
      <TableCell className="max-w-[160px] pl-4 whitespace-normal sm:pl-5">
        <span className="font-medium">{user.name}</span>
        <p className="text-muted-foreground mt-0.5 truncate text-xs md:hidden">
          {user.phone ?? "—"}
        </p>
      </TableCell>
      <TableCell className="text-muted-foreground max-w-[220px] whitespace-normal">
        <span className="break-all">{user.email}</span>
      </TableCell>
      <TableCell className="text-muted-foreground hidden md:table-cell">
        {user.phone ?? "—"}
      </TableCell>
      <TableCell>
        <Badge variant={roleVariant}>{user.role}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.isActive ? "default" : "outline"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground hidden pr-4 tabular-nums sm:table-cell sm:pr-5">
        {format(new Date(user.createdAt), "MMM d, yyyy")}
      </TableCell>
    </TableRow>
  );
}

export default function AllUsersPage() {
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);
  if (!isAdmin()) return <ForbiddenPage />;
  return <AllUsersPageContent />;
}
