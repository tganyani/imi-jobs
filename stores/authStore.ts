// stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  email: string | null;
  name: string | null;
  userId: string | null;
  isLoggedIn: boolean;
  role: string | null;
  login: (email: string, userId: string, role: string, name: string) => void;
  logout: () => void;
  setRole: (role: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      userId: null,
      isLoggedIn: false,
      role: null,
      login: (email, userId, role, name) =>
        set({ email, userId, isLoggedIn: true, role, name }),
      logout: () =>
        set({ email: null, userId: null, isLoggedIn: false, name: null }),
      setRole: (role) => set({ role }),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
