import { create } from "zustand";
import { persist } from "zustand/middleware";

type ResendStore = {
  lastResend: number | null;
  triggerOnMount: boolean;
  hasHydrated: boolean;
  setLastResend: (timestamp: number) => void;
  setTriggerOnMount: (trigger: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
};

export const useResendStore = create<ResendStore>()(
  persist(
    (set) => ({
      lastResend: null,
      triggerOnMount: true,
      hasHydrated: false,
      setLastResend: (timestamp) => set({ lastResend: timestamp }),
      setTriggerOnMount: (trigger) => set({ triggerOnMount: trigger }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      reset: () =>
        set({
          lastResend: null,
          triggerOnMount: false,
          hasHydrated: true,
        }),
    }),
    {
      name: "resend-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true); // <- ensures hydration is flagged
      },
    }
  )
);