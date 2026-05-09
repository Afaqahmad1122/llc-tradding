import { create } from "zustand";

import type { AuthUser, StaffPermissions } from "@/lib/api/auth";

type AdminAuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasBootstrapped: boolean;
  setAuthSession: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setBootstrapped: (value: boolean) => void;
  hasPermission: (field: keyof StaffPermissions) => boolean;
  isAdmin: () => boolean;
};

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  hasBootstrapped: false,
  setAuthSession: (user, accessToken) =>
    set(() => ({
      user,
      accessToken,
      isAuthenticated: true,
    })),
  clearAuth: () =>
    set(() => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })),
  setBootstrapped: (value) => set(() => ({ hasBootstrapped: value })),
  isAdmin: () => get().user?.role === "ADMIN",
  hasPermission: (field) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return Boolean(user.permissions?.[field]);
  },
}));
