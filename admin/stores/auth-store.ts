import { create } from "zustand";

import type { AuthUser } from "@/lib/api/auth";

type AdminAuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasBootstrapped: boolean;
  setAuthSession: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setBootstrapped: (value: boolean) => void;
};

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
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
}));
