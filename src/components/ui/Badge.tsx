import { StyleSheet, View, ViewStyle } from "react-native";
import { radii, spacing } from "@/theme";
import { Text } from "./Text";
import { BadgeTone, badgeColors } from "@/utils/status";

export function StatusBadge({
  label,
  tone = "neutral",
  style,
  dot = true,
  size = "md",
}: {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
  /** Show a small status dot before the label. */
  dot?: boolean;
  size?: "sm" | "md";
}) {
  const c = badgeColors[tone];
  return (
    <View
      style={[styles.badge, size === "sm" && styles.badgeSm, { backgroundColor: c.bg }, style]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: c.fg }]} /> : null}
      <Text variant="caption" weight="semibold" style={{ color: c.fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  badgeSm: { paddingHorizontal: spacing.sm, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
