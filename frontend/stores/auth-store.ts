import { create } from "zustand";
import type { AuthUser } from "@/lib/api/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasBootstrapped: boolean;
  setAuthSession: (user: AuthUser, accessToken: string) => void;
  setAuthUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setBootstrapped: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
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
  setAuthUser: (user) =>
    set((state) => ({
      user,
      accessToken: state.accessToken,
      isAuthenticated: true,
    })),
  clearAuth: () =>
    set(() => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })),
  setBootstrapped: (value) =>
    set(() => ({
      hasBootstrapped: value,
    })),
}));
