import { StyleSheet, Switch, View } from "react-native";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";

export function SettingsToggle({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text variant="label">{label}</Text>
        {description ? (
          <Text variant="bodySm" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.disabledBg, true: colors.primary }}
        thumbColor={colors.white}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: { flex: 1, gap: 2 },
});
