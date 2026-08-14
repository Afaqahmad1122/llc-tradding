"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { SearchIcon, UsersRound } from "lucide-react";
import { useState } from "react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import {
  AdminDataPageHeader,
  AdminDataPanel,
} from "@/components/layout/admin-data-page";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
            Every registered account — customers, staff, and admins — in one
            searchable list.
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <UserRow key={user.id} user={user} />
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
  return (
    <PermissionGuard permissionKey="usersRead">
      <AllUsersPageContent />
    </PermissionGuard>
  );
}
