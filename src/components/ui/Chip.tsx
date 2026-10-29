import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";

export function FilterChip({
  label,
  selected,
  onPress,
  icon,
  count,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Feather.glyphMap;
  /** Optional numeric badge (e.g. active filter count). */
  count?: number;
}) {
  const fg = selected ? colors.white : colors.primaryDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <Feather name={icon} size={14} color={fg} /> : null}
      <Text variant="bodySm" weight="semibold" style={{ color: fg }}>
        {label}
      </Text>
      {count != null && count > 0 ? (
        <Text
          variant="caption"
          weight="bold"
          style={[styles.count, selected ? styles.countOnSelected : styles.countOnUnselected]}
        >
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 38,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  count: {
    minWidth: 18,
    height: 18,
    lineHeight: 18,
    borderRadius: 9,
    textAlign: "center",
    paddingHorizontal: 4,
    fontSize: 11,
  },
  countOnSelected: { backgroundColor: colors.brandLime, color: colors.brandInk },
  countOnUnselected: { backgroundColor: colors.primaryDark, color: colors.white },
});
