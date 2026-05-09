"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminAuthStore } from "@/stores/auth-store";
import { ForbiddenPage } from "@/components/auth/permission-guard";
import { format } from "date-fns";
import {
  Check,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/client";
import type { StaffPermissions } from "@/lib/api/auth";
import {
  createStaffUser,
  deleteStaffUser,
  fetchStaffUsers,
  updateStaffPermissions,
  updateStaffUser,
  type StaffUser,
} from "@/lib/api/staff";

type PermissionSection = {
  label: string;
  keys: {
    create: keyof StaffPermissions;
    read: keyof StaffPermissions;
    update: keyof StaffPermissions;
    delete: keyof StaffPermissions;
  };
};

const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    label: "Cars",
    keys: {
      create: "carsCreate",
      read: "carsRead",
      update: "carsUpdate",
      delete: "carsDelete",
    },
  },
  {
    label: "Shipping",
    keys: {
      create: "shippingCreate",
      read: "shippingRead",
      update: "shippingUpdate",
      delete: "shippingDelete",
    },
  },
  {
    label: "Reviews",
    keys: {
      create: "reviewsCreate",
      read: "reviewsRead",
      update: "reviewsUpdate",
      delete: "reviewsDelete",
    },
  },
  {
    label: "Contact Messages",
    keys: {
      create: "contactCreate",
      read: "contactRead",
      update: "contactUpdate",
      delete: "contactDelete",
    },
  },
  {
    label: "Careers",
    keys: {
      create: "careersCreate",
      read: "careersRead",
      update: "careersUpdate",
      delete: "careersDelete",
    },
  },
];

const emptyPermissions = (): StaffPermissions => ({
  carsCreate: false,
  carsRead: false,
  carsUpdate: false,
  carsDelete: false,
  shippingCreate: false,
  shippingRead: false,
  shippingUpdate: false,
  shippingDelete: false,
  reviewsCreate: false,
  reviewsRead: false,
  reviewsUpdate: false,
  reviewsDelete: false,
  contactCreate: false,
  contactRead: false,
  contactUpdate: false,
  contactDelete: false,
  careersCreate: false,
  careersRead: false,
  careersUpdate: false,
  careersDelete: false,
});

function formatErrorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}

function PermissionsMatrix({
  permissions,
  onChange,
}: {
  permissions: StaffPermissions;
  onChange: (updated: StaffPermissions) => void;
}) {
  const toggle = (field: keyof StaffPermissions) => {
    onChange({ ...permissions, [field]: !permissions[field] });
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Section
            </th>
            {(["Create", "Read", "Update", "Delete"] as const).map((action) => (
              <th
                key={action}
                className="px-3 py-2.5 text-center font-medium text-muted-foreground"
              >
                {action}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {PERMISSION_SECTIONS.map((section) => (
            <tr key={section.label} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-medium">{section.label}</td>
              {(
                [
                  section.keys.create,
                  section.keys.read,
                  section.keys.update,
                  section.keys.delete,
                ] as (keyof StaffPermissions)[]
              ).map((key) => (
                <td key={key} className="px-3 py-3 text-center">
                  <Checkbox
                    checked={permissions[key]}
                    onCheckedChange={() => toggle(key)}
                    className="mx-auto"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createStaffUser({ name, email, password }),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      setName("");
      setEmail("");
      setPassword("");
      setError(null);
    },
    onError: (e) => setError(formatErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add staff user</DialogTitle>
          <DialogDescription>
            Create a new staff account. You can set permissions after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-name">Name</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-password">Password</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Strong password"
              autoComplete="new-password"
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setError(null);
              mutation.mutate();
            }}
            disabled={mutation.isPending || !name.trim() || !email.trim() || !password}
          >
            {mutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            Create user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: StaffUser | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("No user");
      const body: Record<string, unknown> = {};
      if (name !== user.name) body.name = name;
      if (email !== user.email) body.email = email;
      if (password) body.password = password;
      if (isActive !== user.isActive) body.isActive = isActive;
      return updateStaffUser(user.id, body);
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      setError(null);
    },
    onError: (e) => setError(formatErrorMessage(e)),
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit staff user</DialogTitle>
          <DialogDescription>
            Update name, email, password, or active status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-password">
              New password{" "}
              <span className="text-muted-foreground font-normal">(leave blank to keep)</span>
            </Label>
            <Input
              id="edit-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="edit-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="edit-active">Active account</Label>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setError(null);
              mutation.mutate();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Spinner className="size-4" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsDialog({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: StaffUser | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [permissions, setPermissions] = useState<StaffPermissions>(
    user?.staffPermission ?? emptyPermissions(),
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("No user");
      return updateStaffPermissions(user.id, permissions);
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      setError(null);
    },
    onError: (e) => setError(formatErrorMessage(e)),
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit permissions — {user?.name}</DialogTitle>
          <DialogDescription>
            Toggle which sections this staff member can access and what actions
            they can perform.
          </DialogDescription>
        </DialogHeader>

        <PermissionsMatrix permissions={permissions} onChange={setPermissions} />

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setError(null);
              mutation.mutate();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Spinner className="size-4" /> : <Check className="size-4" />}
            Save permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: StaffUser | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("No user");
      return deleteStaffUser(user.id);
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      setError(null);
    },
    onError: (e) => setError(formatErrorMessage(e)),
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete staff user</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{user?.name}</span>? This action
            cannot be undone and will revoke all their access immediately.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setError(null);
              mutation.mutate();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
            Delete user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function grantedCount(perms: StaffPermissions | null): number {
  if (!perms) return 0;
  return Object.values(perms).filter(Boolean).length;
}

export default function AdminUsersPage() {
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  if (!isAdmin()) return <ForbiddenPage />;
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<StaffUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<StaffUser | null>(null);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin-staff-users"],
    queryFn: fetchStaffUsers,
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin-staff-users"] });

  const users = data?.users ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pb-12 pt-8 sm:px-7 sm:pt-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div
            className="bg-primary/12 text-primary ring-primary/15 flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1"
            aria-hidden
          >
            <Users className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Staff Users</h1>
            <p className="text-muted-foreground max-w-xl text-pretty text-sm leading-relaxed">
              Create staff accounts and control which sections and actions they
              can access in the dashboard.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="default"
          className="gap-2 self-start sm:self-center"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          Add user
        </Button>
      </header>

      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm ring-1 ring-border/60">
        {isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertTitle>Could not load staff users</AlertTitle>
              <AlertDescription>
                {error instanceof ApiError
                  ? error.message
                  : "Something went wrong. Try refreshing."}
              </AlertDescription>
            </Alert>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <Shield className="text-muted-foreground size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No staff users yet</p>
              <p className="text-muted-foreground text-sm">
                Click &ldquo;Add user&rdquo; to create your first staff account.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium leading-snug">{user.name}</span>
                    <Badge
                      variant={user.isActive ? "default" : "outline"}
                      className="shrink-0 text-[10px]"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-sm">{user.email}</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {grantedCount(user.staffPermission) === 0 ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <X className="size-3" />
                        No permissions granted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" />
                        {grantedCount(user.staffPermission)} of 20 permissions
                      </span>
                    )}
                    <Separator orientation="vertical" className="h-3" />
                    <span className="text-muted-foreground text-xs">
                      Added {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPermissionsUser(user);
                    }}
                    className="gap-1.5"
                  >
                    <Shield className="size-3.5" />
                    Permissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditUser(user)}
                    className="gap-1.5"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteUser(user)}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={invalidate}
      />

      <EditUserDialog
        user={editUser}
        onOpenChange={(open) => { if (!open) setEditUser(null); }}
        onSuccess={invalidate}
      />

      <PermissionsDialog
        user={permissionsUser}
        onOpenChange={(open) => { if (!open) setPermissionsUser(null); }}
        onSuccess={invalidate}
      />

      <DeleteUserDialog
        user={deleteUser}
        onOpenChange={(open) => { if (!open) setDeleteUser(null); }}
        onSuccess={invalidate}
      />
    </div>
  );
}
