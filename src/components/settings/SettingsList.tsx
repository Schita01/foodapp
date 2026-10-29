import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing, HIT_TARGET } from "@/theme";
import { Text } from "../ui/Text";

export function SettingsSectionLabel({ label }: { label: string }) {
  return (
    <Text variant="caption" weight="semibold" tone="tertiary" style={styles.sectionLabel}>
      {label.toUpperCase()}
    </Text>
  );
}

export function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  last,
  danger,
  placeholder = "Tap to select",
}: {
  icon?: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  danger?: boolean;
  placeholder?: string;
}) {
  const fg = danger ? colors.error : colors.textPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && styles.pressed,
      ]}
    >
      {icon ? (
        <Feather name={icon} size={20} color={danger ? colors.error : colors.textPrimary} />
      ) : null}
      <Text variant="body" style={[styles.label, { color: fg }]}>
        {label}
      </Text>
      {value ? (
        <Text variant="body" tone="secondary" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : !icon && !danger ? (
        <Text variant="body" tone="tertiary" style={styles.value}>
          {placeholder}
        </Text>
      ) : null}
      <Feather name="chevron-right" size={20} color={danger ? colors.error : colors.textTertiary} />
    </Pressable>
  );
}

export function CheckSettingRow({
  label,
  description,
  checked,
  onToggle,
  last,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  last?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      onPress={disabled ? undefined : onToggle}
      style={({ pressed }) => [
        styles.checkRow,
        !last && styles.rowBorder,
        pressed && !disabled && styles.pressed,
        disabled && { opacity: 0.45 },
      ]}
    >
      <View style={styles.checkText}>
        <Text variant="label">{label}</Text>
        {description ? (
          <Text variant="bodySm" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.check, checked && styles.checkOn]}>
        {checked ? <Feather name="check" size={14} color={colors.white} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    letterSpacing: 0.6,
  },
  group: {
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: HIT_TARGET + 8,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.backgroundAlt },
  label: { flex: 1 },
  value: { maxWidth: "46%", textAlign: "right" },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkText: { flex: 1, gap: 3 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
});
