import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./ui/Text";

type Stat = { icon: keyof typeof Feather.glyphMap; value: string; label: string };

export function ImpactCard({
  mealsRescued,
  moneySaved,
  co2SavedKg,
  currencySymbol = "₾",
  title = "Your rescue impact",
}: {
  mealsRescued: number;
  moneySaved: number;
  co2SavedKg: number;
  currencySymbol?: string;
  title?: string;
}) {
  const stats: Stat[] = [
    { icon: "shopping-bag", value: String(mealsRescued), label: "Meals saved" },
    { icon: "dollar-sign", value: `${currencySymbol}${moneySaved.toFixed(0)}`, label: "Money saved" },
    { icon: "wind", value: `${co2SavedKg.toFixed(1)}kg`, label: "CO₂ avoided" },
  ];
  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.card}>
      <View style={styles.titleRow}>
        <Feather name="award" size={16} color={colors.white} />
        <Text variant="label" tone="inverse">
          {title}
        </Text>
      </View>
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Feather name={s.icon} size={18} color={colors.white} style={styles.statIcon} />
            <Text variant="h1" tone="inverse">
              {s.value}
            </Text>
            <Text variant="caption" tone="inverse" style={styles.statLabel}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.cardLg, padding: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statIcon: { opacity: 0.9, marginBottom: 2 },
  statLabel: { opacity: 0.9 },
});
