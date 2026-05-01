import { create } from "zustand";

type AdminAuthState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
};

/** Attach tokens after login; the API client reads from here for Bearer auth. */
export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ accessToken: null }),
}));
