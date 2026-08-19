"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { Car, Mail, MapPin, Phone, SearchIcon, UsersRound } from "lucide-react";
import { useState } from "react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  AdminDataPageHeader,
  AdminDataPanel,
} from "@/components/layout/admin-data-page";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
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
  fetchAdminUserDetail,
  type AdminAllUsersRole,
  type AdminUser,
  type AdminUserDetailResponse,
} from "@/lib/api/users";

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type RoleFilter = "all" | AdminAllUsersRole;
type StatusFilter = "all" | "active" | "inactive";

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

function dealTypeLabel(value: string) {
  return value === "CNF" ? "C&F" : value;
}

const DEAL_TYPE_BADGE_CLASS =
  "border-amber-300 bg-amber-100 text-amber-900 shadow-none dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-200";

function formatMoney(amount: number | null | undefined, currency: string) {
  if (amount == null || Number.isNaN(amount)) return "-";
  return `${currency} ${amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function AllUsersPageContent() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
  const userDetailQuery = useQuery({
    queryKey: ["admin-user-detail", selectedUserId],
    queryFn: () => fetchAdminUserDetail(selectedUserId as string),
    enabled: Boolean(selectedUserId),
  });

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalItems = data?.pagination.total ?? 0;

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
      <AdminDataPageHeader
        icon={UsersRound}
        title="All Users"
        description={
          <>
            Every registered customer and admin account in one searchable list.
          </>
        }
      />

      <AdminDataPanel
        controls={
          <>
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
          </>
        }
        emptyDescription="Adjust search or filters to see more results."
        emptyIcon={UsersRound}
        emptyTitle="No users match"
        error={error}
        errorMessage={formatErrorMessage}
        errorTitle="Could not load users"
        isEmpty={rows.length === 0}
        isError={isError}
        isFetching={isFetching}
        isPending={isPending}
        loadingLabel="Loading users…"
        table={
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4 sm:pl-5">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden pr-4 sm:table-cell sm:pr-5">
                  Joined
                </TableHead>
                <TableHead className="pr-4 text-right sm:pr-5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onSelect={() => setSelectedUserId(user.id)}
                />
              ))}
            </TableBody>
          </Table>
        }
        pagination={{
          isFetching,
          onPageChange: setPage,
          page,
          rowsShown: rows.length,
          totalItems,
          totalPages,
        }}
      />

      <UserDetailSheet
        data={userDetailQuery.data}
        error={userDetailQuery.error}
        isError={userDetailQuery.isError}
        isPending={userDetailQuery.isPending}
        open={Boolean(selectedUserId)}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null);
        }}
      />
    </div>
  );
}

function UserRow({
  onSelect,
  user,
}: {
  onSelect: () => void;
  user: AdminUser;
}) {
  const roleVariant =
    user.role === "ADMIN"
      ? "default"
      : user.role === "STAFF"
        ? "secondary"
        : "outline";

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/40"
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
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
      <TableCell className="pr-4 text-right sm:pr-5">
        <Button
          asChild
          variant="outline"
          size="sm"
          onClick={(event) => event.stopPropagation()}
        >
          <Link
            href={`/dashboard/ledger?userId=${encodeURIComponent(user.id)}&userName=${encodeURIComponent(user.name)}`}
          >
            View Ledger
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

function UserDetailSheet({
  data,
  error,
  isError,
  isPending,
  onOpenChange,
  open,
}: {
  data: AdminUserDetailResponse | undefined;
  error: unknown;
  isError: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const user = data?.user;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle>{user?.name ?? "User detail"}</SheetTitle>
          <SheetDescription>
            Profile, purchase activity, and ledger totals for this user.
          </SheetDescription>
        </SheetHeader>

        {isPending ? (
          <div className="space-y-4 p-5">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : isError ? (
          <div className="p-5">
            <p className="text-destructive text-sm">{formatErrorMessage(error)}</p>
          </div>
        ) : data && user ? (
          <div className="space-y-5 p-5">
            <section className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground break-all text-sm">{user.email}</p>
                </div>
                <Badge variant={user.isActive ? "default" : "outline"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4" />
                  <span>{user.emailVerifiedAt ? "Email verified" : "Email not verified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground size-4" />
                  <span>{user.phone ?? "No phone"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 size-4" />
                  <span>
                    {[user.city, user.country, user.address, user.postalCode]
                      .filter(Boolean)
                      .join(", ") || "No address"}
                  </span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Cars bought
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {data.stats.carCount}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Ledger deals
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {data.stats.dealCount}
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Ledger totals</h3>
              {data.stats.byCurrency.length > 0 ? (
                data.stats.byCurrency.map((bucket) => (
                  <div key={bucket.currency} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{bucket.currency}</p>
                      <Badge variant="secondary">{bucket.dealCount} deals</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium tabular-nums">
                          {formatMoney(bucket.totalAmount, bucket.currency)}
                        </p>
                      </div>
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
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground rounded-lg border p-4 text-sm">
                  No ledger deals for this user.
                </p>
              )}
            </section>

            {data.stats.statusCounts.length > 0 ? (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Deal statuses</h3>
                <div className="flex flex-wrap gap-2">
                  {data.stats.statusCounts.map((item) => (
                    <Badge key={item.status} variant="outline">
                      {label(item.status)}: {item.count}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Recent cars</h3>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/dashboard/ledger?userId=${encodeURIComponent(user.id)}&userName=${encodeURIComponent(user.name)}`}
                  >
                    View full ledger
                  </Link>
                </Button>
              </div>
              {data.recentDeals.length > 0 ? (
                <div className="space-y-2">
                  {data.recentDeals.map((deal) => (
                    <div key={deal.id} className="rounded-lg border bg-card p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary rounded-md p-2">
                          <Car className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {deal.car.model.brand} {deal.car.model.name}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {deal.car.referenceNo} - {deal.car.year} - {deal.orderNumber}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={DEAL_TYPE_BADGE_CLASS}>
                              {dealTypeLabel(deal.dealType)}
                            </Badge>
                            <Badge variant="outline">{label(deal.status)}</Badge>
                            <span className="text-sm font-medium tabular-nums">
                              {formatMoney(deal.totalAmount, deal.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground rounded-lg border p-4 text-sm">
                  No car purchases recorded.
                </p>
              )}
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export default function AllUsersPage() {
  return (
    <PermissionGuard permissionKey="usersRead">
      <AllUsersPageContent />
    </PermissionGuard>
  );
}
