import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  size = "md",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
  size?: "md" | "sm";
}) {
  const canDec = value > min;
  const canInc = value < max;
  const btn = size === "sm" ? 34 : 40;
  return (
    <View style={styles.row}>
      <StepBtn
        icon="minus"
        disabled={!canDec}
        onPress={() => canDec && onChange(value - 1)}
        label="Decrease quantity"
        size={btn}
      />
      <Text variant={size === "sm" ? "label" : "h3"} weight="bold" style={styles.value}>
        {value}
      </Text>
      <StepBtn
        icon="plus"
        disabled={!canInc}
        onPress={() => canInc && onChange(value + 1)}
        label="Increase quantity"
        size={btn}
        filled
      />
    </View>
  );
}

function StepBtn({
  icon,
  disabled,
  onPress,
  label,
  size,
  filled,
}: {
  icon: "minus" | "plus";
  disabled?: boolean;
  onPress: () => void;
  label: string;
  size: number;
  filled?: boolean;
}) {
  const bg = disabled ? colors.disabledBg : filled ? colors.primaryDark : colors.surface;
  const fg = disabled ? colors.textTertiary : filled ? colors.white : colors.primaryDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.btn,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderColor: disabled ? colors.border : colors.primaryDark,
        },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Feather name={icon} size={18} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.pill,
    padding: 3,
  },
  btn: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { transform: [{ scale: 0.94 }] },
  value: { minWidth: 26, textAlign: "center" },
});
