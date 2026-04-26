import { create } from "zustand";
import type { AuthUser } from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuthUser: (user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
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
}));
