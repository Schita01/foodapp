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

type Option = { key: string; title: string; icon: keyof typeof Feather.glyphMap };

export default function MotivationScreen() {
  const router = useRouter();
  const saved = useOnboardingStore((s) => s.motivations);
  const setMotivations = useOnboardingStore((s) => s.setMotivations);
  const [selected, setSelected] = useState<string[]>(saved);

  const OPTIONS: Option[] = useMemo(
    () => [
      { key: "Save money on groceries", title: "Save money on groceries", icon: "dollar-sign" },
      { key: "Rescue surplus food", title: "Rescue surplus food", icon: "heart" },
      { key: "Discover local restaurants", title: "Discover local restaurants", icon: "map-pin" },
      { key: "Find quick meals", title: "Find quick meals", icon: "zap" },
      { key: "Support local businesses", title: "Support local businesses", icon: "home" },
      { key: "Explore new cuisines", title: "Explore new cuisines", icon: "compass" },
    ],
    [],
  );

  const toggle = (m: string) =>
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const next = () => {
    setMotivations(selected);
    router.push("/onboarding/pickup-time");
  };

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [enter]);

  return (
    <Screen edges={["top", "bottom"]} background={PALETTE.bg}>
      <ScreenHeader transparent />
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
              <Feather name="heart" size={18} color={PALETTE.primary} />
            </View>
          </View>

          <Text style={styles.title}>
            <Text style={styles.titlePrimary}>What brings{"\n"}you </Text>
            <Text style={styles.titleAccent}>here?</Text>
          </Text>
          <Text style={styles.subtitle}>
            Knowing what matters most to you helps us personalise recommendations and enhance your
            experience.
          </Text>

          <View style={styles.list}>
            {OPTIONS.map((o) => (
              <SelectionCard
                key={o.key}
                icon={o.icon}
                title={o.title}
                selected={selected.includes(o.key)}
                onPress={() => toggle(o.key)}
              />
            ))}
          </View>
        </ScrollView>

        <PageDots active={0} />

        <View style={styles.footer}>
          <SecondaryButton label="Back" disabled />
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

function SelectionCard({
  icon,
  title,
  selected,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
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
        <Text variant="body" style={styles.cardTitle}>
          {title}
        </Text>
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
  title: { fontSize: 36, lineHeight: 40, marginBottom: spacing.sm },
  titlePrimary: { color: PALETTE.text, fontWeight: "800" },
  titleAccent: { color: PALETTE.accent, fontWeight: "900" },
  subtitle: { color: PALETTE.sub, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg, maxWidth: 340 },
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
  cardTitle: { color: PALETTE.text, flex: 1 },
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
