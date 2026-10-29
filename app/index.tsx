import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/theme";
import { Text } from "@/components/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { isAuthenticated, useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useLocationStore } from "@/store/locationStore";

const SPLASH_MS = 700;

export default function SplashGate() {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const isGuest = useAuthStore((s) => s.isGuest);
  const onboardingCompleted = useOnboardingStore((s) => s.onboardingCompleted);
  const location = useLocationStore((s) => s.location);
  const routed = useRef(false);

  useEffect(() => {
    if (!hydrated || routed.current) return;
    const timer = setTimeout(() => {
      routed.current = true;
      const authed = isAuthenticated({ token }) || isGuest;
      if (!authed) {
        router.replace("/auth");
        return;
      }
      if (!onboardingCompleted) {
        router.replace("/onboarding");
        return;
      }
      if (!location) {
        router.replace("/location");
        return;
      }
      router.replace("/discover");
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [hydrated, token, isGuest, onboardingCompleted, location, router]);

  return (
    <View style={styles.splash}>
      <Text variant="h1" tone="inverse" weight="bold">
        RescueBite
      </Text>
      <Text variant="body" style={styles.tagline}>
        Save food. Save money.
      </Text>
      <ActivityIndicator color={colors.white} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  tagline: { color: "rgba(255,255,255,0.85)" },
  loader: { marginTop: spacing.xl },
});
