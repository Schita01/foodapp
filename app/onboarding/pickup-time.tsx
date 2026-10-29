import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, Text, PrimaryButton, SecondaryButton, ScreenHeader } from "@/components/ui";
import { useOnboardingStore } from "@/store/onboardingStore";

const PALETTE = {
  bg: "#FFFFFF",
  primary: "#0E6B50",
  accent: "#7CCB3D",
  text: "#143A2D",
  sub: "#666666",
  inactive: "#D9D9D9",
} as const;

type Slot = {
  key: string;
  label: string;
  range: string;
  icon: keyof typeof Feather.glyphMap;
};

export default function PickupTimeScreen() {
  const router = useRouter();
  const saved = useOnboardingStore((s) => s.preferredPickupWindows);
  const setWindows = useOnboardingStore((s) => s.setPreferredPickupWindows);
  const [selected, setSelected] = useState<string[]>(saved);

  const SLOTS: Slot[] = useMemo(
    () => [
      { key: "Early morning", label: "Early morning", range: "(06:00 — 09:00)", icon: "sunrise" },
      { key: "Late morning", label: "Late morning", range: "(09:00 — 12:00)", icon: "sun" },
      { key: "Midday", label: "Midday", range: "(12:00 — 15:00)", icon: "sun" },
      { key: "Afternoon", label: "Afternoon", range: "(15:00 — 18:00)", icon: "sun" },
      { key: "Evening", label: "Evening", range: "(18:00 — 21:00)", icon: "moon" },
      { key: "Late night", label: "Late night", range: "(21:00 — 00:00)", icon: "moon" },
    ],
    [],
  );

  const toggle = (m: string) =>
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const next = () => {
    setWindows(selected);
    router.push("/onboarding/email-updates");
  };

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [enter]);

  return (
    <Screen edges={["top", "bottom"]} background={PALETTE.bg}>
      <ScreenHeader transparent onBack={() => router.back()} />
      <Animated.View
        style={[
          styles.body,
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headIconRow}>
            <View style={styles.headBadge}>
              <Feather name="clock" size={18} color={PALETTE.primary} />
            </View>
          </View>

          <Text style={styles.title}>
            <Text style={styles.titlePrimary}>When do you prefer{"\n"}to </Text>
            <Text style={styles.titleAccent}>collect?</Text>
          </Text>
          <Text style={styles.subtitle}>
            Let us know your preferred collection window, and we'll recommend Surprise Bags that
            fit your routine.
          </Text>

          <View style={styles.list}>
            {SLOTS.map((s) => (
              <SlotCard
                key={s.key}
                icon={s.icon}
                label={s.label}
                range={s.range}
                selected={selected.includes(s.key)}
                onPress={() => toggle(s.key)}
              />
            ))}
          </View>
        </ScrollView>

        <PageDots active={1} />

        <View style={styles.footer}>
          <SecondaryButton label="Back" onPress={() => router.back()} />
          <PrimaryButton
            label="Next"
            iconRight="arrow-right"
            onPress={next}
            disabled={selected.length === 0}
            advanceFeedback
          />
        </View>
      </Animated.View>
    </Screen>
  );
}

function SlotCard({
  icon,
  label,
  range,
  selected,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  range: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={18} color={PALETTE.text} />
        </View>
        <View style={styles.cardText}>
          <Text variant="body" style={styles.cardTitle}>
            {label} <Text style={styles.cardRange}>{range}</Text>
          </Text>
        </View>
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

function PageDots({ active }: { active: 0 | 1 | 2 }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === active ? PALETTE.primary : PALETTE.inactive },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  headIconRow: { marginTop: spacing.sm, marginBottom: spacing.md },
  headBadge: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: "rgba(124,203,61,0.18)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  title: { fontSize: 32, lineHeight: 38, marginBottom: spacing.sm, textAlign: "center" },
  titlePrimary: { color: PALETTE.text, fontWeight: "800" },
  titleAccent: { color: PALETTE.accent, fontWeight: "900" },
  subtitle: {
    color: PALETTE.sub,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.lg,
    maxWidth: 340,
    textAlign: "center",
    alignSelf: "center",
  },
  list: { gap: spacing.md, marginTop: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(20,58,45,0.08)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.soft,
  },
  cardSelected: { borderColor: "rgba(14,107,80,0.55)" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: "rgba(124,203,61,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: { color: PALETTE.text },
  cardRange: { color: PALETTE.sub, fontWeight: "600" },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(20,58,45,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterOn: { borderColor: PALETTE.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: PALETTE.primary },
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
});
