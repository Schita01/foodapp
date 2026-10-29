import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { radii, shadow, spacing } from "@/theme";
import { Screen, Text, PrimaryButton, SecondaryButton, ScreenHeader } from "@/components/ui";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function EmailUpdatesScreen() {
  const router = useRouter();
  const setMarketingOptIn = useOnboardingStore((s) => s.setMarketingOptIn);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const PALETTE = {
    bg: "#FFFFFF",
    primary: "#0E6B50",
    accent: "#7CCB3D",
    text: "#143A2D",
    sub: "#666666",
    inactive: "#D9D9D9",
  } as const;

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [enter]);

  const next = () => {
    setMarketingOptIn(true);
    completeOnboarding();
    router.replace("/location");
  };

  return (
    <Screen edges={["top", "bottom"]} background={PALETTE.bg}>
      <ScreenHeader transparent onBack={() => router.back()} />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: enter,
            transform: [
              {
                translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
              },
            ],
          },
        ]}
      >
        <View style={styles.heroIcon}>
          <View style={styles.heroGlow} />
          <Feather name="mail" size={30} color={PALETTE.primary} />
        </View>

        <Text style={styles.title} center>
          Want to receive{"\n"}
          <Text style={styles.titleAccent}>email updates?</Text>
        </Text>

        <Text style={styles.subtitle} center>
          By tapping Next, you agree to receive personalised recommendations, exclusive offers,
          notifications about unfinished reservations, and promotions. You can withdraw your
          consent at any time.
        </Text>

        <View style={styles.infoCard}>
          <Feather name="mail" size={18} color={PALETTE.primary} />
          <Text style={styles.infoText}>
            I'd like to receive email updates from RescueBite and its local affiliates.
          </Text>
        </View>

        <PageDots />

        <View style={styles.footerRow}>
          <SecondaryButton label="Back" onPress={() => router.back()} />
          <PrimaryButton label="Next" iconRight="arrow-right" onPress={next} advanceFeedback />
        </View>
      </Animated.View>
    </Screen>
  );
}

function PageDots() {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i === 2 ? "#0E6B50" : "#D9D9D9" }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: "center", padding: spacing.xl, gap: spacing.md },
  heroIcon: {
    width: 86,
    height: 86,
    borderRadius: radii.pill,
    backgroundColor: "rgba(124,203,61,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    ...shadow.soft,
  },
  heroGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: radii.pill,
    backgroundColor: "rgba(124,203,61,0.18)",
  },
  title: { fontSize: 32, lineHeight: 38, fontWeight: "800", color: "#143A2D" },
  titleAccent: { color: "#7CCB3D", fontWeight: "900" },
  subtitle: { maxWidth: 340, color: "#666666", fontSize: 13, lineHeight: 20 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(124,203,61,0.10)",
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignSelf: "stretch",
    marginTop: spacing.md,
  },
  infoText: { flex: 1, color: "#143A2D", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footerRow: { flexDirection: "row", gap: spacing.md, alignSelf: "stretch" },
});
