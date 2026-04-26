import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

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
