import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "./persist";

export type CookiePrefs = {
  required: true;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
};

type OnboardingState = {
  onboardingCompleted: boolean;
  termsAccepted: boolean;
  cookiePrefs: CookiePrefs | null;
  motivations: string[];
  preferredPickupWindows: string[];
  marketingEmailOptIn: boolean;
  setMotivations: (m: string[]) => void;
  setPreferredPickupWindows: (w: string[]) => void;
  setMarketingOptIn: (v: boolean) => void;
  acceptTerms: () => void;
  setCookiePrefs: (p: CookiePrefs) => void;
  completeOnboarding: () => void;
  /** Re-run the guided onboarding (Terms etc.) without discarding saved preferences. */
  requireOnboarding: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      onboardingCompleted: false,
      termsAccepted: false,
      cookiePrefs: null,
      motivations: [],
      preferredPickupWindows: [],
      marketingEmailOptIn: false,
      setMotivations: (motivations) => set({ motivations }),
      setPreferredPickupWindows: (preferredPickupWindows) => set({ preferredPickupWindows }),
      setMarketingOptIn: (marketingEmailOptIn) => set({ marketingEmailOptIn }),
      acceptTerms: () => set({ termsAccepted: true }),
      setCookiePrefs: (cookiePrefs) => set({ cookiePrefs }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      requireOnboarding: () => set({ onboardingCompleted: false }),
      reset: () =>
        set({
          onboardingCompleted: false,
          termsAccepted: false,
          cookiePrefs: null,
          motivations: [],
          preferredPickupWindows: [],
          marketingEmailOptIn: false,
        }),
    }),
    { name: "rb-onboarding", storage: zustandStorage },
  ),
);
