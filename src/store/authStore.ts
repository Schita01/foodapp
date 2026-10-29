import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "./persist";
import { useOnboardingStore } from "./onboardingStore";

type AuthState = {
  token: string | null;
  customerId: string | null;
  /** Email pending verification (between /auth/email/start and verify). */
  pendingEmail: string | null;
  hydrated: boolean;
  isGuest: boolean;
  signIn: (token: string, customerId: string) => void;
  signOut: () => void;
  continueAsGuest: () => void;
  setPendingEmail: (email: string | null) => void;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customerId: null,
      pendingEmail: null,
      hydrated: false,
      isGuest: false,
      signIn: (token, customerId) => {
        set({ token, customerId, isGuest: false, pendingEmail: null });
        // Guide every freshly authenticated user through Terms & onboarding before Discover.
        useOnboardingStore.getState().requireOnboarding();
      },
      signOut: () => {
        set({ token: null, customerId: null, isGuest: false });
        // Clear onboarding progress so the next registration runs the full
        // guided flow (Terms -> onboarding -> area selection) again.
        useOnboardingStore.getState().reset();
      },
      continueAsGuest: () => {
        set({ isGuest: true });
        useOnboardingStore.getState().requireOnboarding();
      },
      setPendingEmail: (pendingEmail) => set({ pendingEmail }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "rb-auth",
      storage: zustandStorage,
      partialize: (s) => ({
        token: s.token,
        customerId: s.customerId,
        isGuest: s.isGuest,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export const isAuthenticated = (s: Pick<AuthState, "token">) => !!s.token;
