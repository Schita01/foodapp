import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useLocationStore } from "@/store/locationStore";

/** True once all persisted stores have rehydrated from AsyncStorage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useAuthStore.persist.hasHydrated() &&
      useOnboardingStore.persist.hasHydrated() &&
      useLocationStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const check = () =>
      useAuthStore.persist.hasHydrated() &&
      useOnboardingStore.persist.hasHydrated() &&
      useLocationStore.persist.hasHydrated();

    if (check()) {
      setHydrated(true);
      return;
    }
    const unsubs = [
      useAuthStore.persist.onFinishHydration(() => check() && setHydrated(true)),
      useOnboardingStore.persist.onFinishHydration(() => check() && setHydrated(true)),
      useLocationStore.persist.onFinishHydration(() => check() && setHydrated(true)),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  return hydrated;
}
