import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing, HIT_TARGET } from "@/theme";
import { Text } from "./ui/Text";

export function ProfileMenuItem({
  icon,
  label,
  value,
  onPress,
  tone = "default",
  badge,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  tone?: "default" | "danger";
  badge?: number;
}) {
  const color = tone === "danger" ? colors.error : colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.backgroundAlt }]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: tone === "danger" ? colors.errorSoft : colors.primarySoft },
        ]}
      >
        <Feather name={icon} size={18} color={tone === "danger" ? colors.error : colors.primary} />
      </View>
      <Text variant="body" style={[styles.label, { color }]}>
        {label}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text variant="caption" tone="inverse">
            {badge}
          </Text>
        </View>
      ) : null}
      {value ? (
        <Text variant="bodySm" tone="secondary" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      <Feather name="chevron-right" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: HIT_TARGET,
    borderRadius: radii.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1 },
  value: { maxWidth: 120 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
});
