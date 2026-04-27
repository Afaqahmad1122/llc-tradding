"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ContactMessageStatus,
  type ContactMessagesListParams,
} from "@/lib/api/contact-messages";
import { useAdminContactMessagesQuery } from "@/hooks/use-admin-contact-messages-query";
import { useAdminContactMessageMutation } from "@/hooks/use-admin-contact-message-mutation";
import { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 10;

const statusFilters: Array<{ label: string; value: "" | ContactMessageStatus }> = [
  { label: "All statuses", value: "" },
  { label: "New", value: "NEW" },
  { label: "In review", value: "IN_REVIEW" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Spam", value: "SPAM" },
];

const statusBadgeClassMap: Record<ContactMessageStatus, string> = {
  NEW: "bg-sky-100 text-sky-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  SPAM: "bg-rose-100 text-rose-700",
};

export default function AdminContactMessagesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | ContactMessageStatus>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const statusMutation = useAdminContactMessageMutation();

  const params = useMemo<ContactMessagesListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      status: status || undefined,
      search: search || undefined,
      sort: "latest",
    }),
    [page, search, status],
  );

  const { data, isLoading, isError, error, isFetching } = useAdminContactMessagesQuery(params);
  const messages = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (value: string) => {
    setPage(1);
    setStatus(value as "" | ContactMessageStatus);
  };

  const handleQuickStatusUpdate = async (id: string, nextStatus: ContactMessageStatus) => {
    setActionError(null);
    try {
      await statusMutation.mutateAsync({ id, status: nextStatus });
      await queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-contact-message", id] });
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setActionError(mutationError.message);
        return;
      }
      setActionError("Unable to update message status right now.");
    }
  };

  const hasPrevious = page > 1;
  const hasNext = pagination ? page < pagination.totalPages : false;

  return (
    <AdminRouteGuard>
      <LandingPageShell mainClassName="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#452E5A]/15 bg-white/85 p-6 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-white/5 sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] dark:text-white sm:text-4xl">
            Contact Messages
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[#452E5A]/85 dark:text-white/75 sm:text-base">
            Review inquiries submitted through the website contact form.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex w-full max-w-xl gap-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, email, phone or message"
                className="h-10"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            <NativeSelect value={status} onChange={(event) => handleStatusChange(event.target.value)}>
              {statusFilters.map((item) => (
                <NativeSelectOption key={item.label} value={item.value}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="mt-5 space-y-3">
            {actionError ? <p className="text-sm text-[#b42318]">{actionError}</p> : null}
            {isLoading ? (
              <p className="text-sm text-[#452E5A]/80 dark:text-white/70">Loading messages...</p>
            ) : null}
            {isError ? (
              <p className="text-sm text-[#b42318]">
                {error.message || "Unable to load contact messages."}
              </p>
            ) : null}
            {!isLoading && !isError && messages.length === 0 ? (
              <p className="rounded-2xl border border-[#452E5A]/15 bg-white/80 px-4 py-5 text-sm text-[#452E5A]/80 dark:border-white/10 dark:bg-white/5 dark:text-white/75">
                No contact messages found for current filters.
              </p>
            ) : null}
          </div>

          {!isLoading && !isError && messages.length > 0 ? (
            <>
              <div className="mt-5 overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white/85 dark:border-white/10 dark:bg-white/5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p>{item.email}</p>
                            <p className="text-xs text-[#452E5A]/75 dark:text-white/70">{item.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClassMap[item.status]}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/contact-messages/${item.id}`}>View</Link>
                            </Button>
                            <NativeSelect
                              size="sm"
                              value={item.status}
                              onChange={(event) =>
                                handleQuickStatusUpdate(
                                  item.id,
                                  event.target.value as ContactMessageStatus,
                                )
                              }
                              className="w-[140px]"
                              disabled={statusMutation.isPending}
                            >
                              <NativeSelectOption value="NEW">NEW</NativeSelectOption>
                              <NativeSelectOption value="IN_REVIEW">IN_REVIEW</NativeSelectOption>
                              <NativeSelectOption value="RESOLVED">RESOLVED</NativeSelectOption>
                              <NativeSelectOption value="SPAM">SPAM</NativeSelectOption>
                            </NativeSelect>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#452E5A]/80 dark:text-white/70">
                  Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1}
                  {isFetching ? " • Updating..." : ""}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={!hasPrevious || isFetching}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!hasNext || isFetching}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </LandingPageShell>
    </AdminRouteGuard>
  );
}
