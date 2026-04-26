import { create } from "zustand";
import type { AuthUser } from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasBootstrapped: boolean;
  setAuthUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setBootstrapped: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasBootstrapped: false,
  setAuthUser: (user) =>
    set(() => ({
      user,
      isAuthenticated: true,
    })),
  clearAuth: () =>
    set(() => ({
      user: null,
      isAuthenticated: false,
    })),
  setBootstrapped: (value) =>
    set(() => ({
      hasBootstrapped: value,
    })),
}));
