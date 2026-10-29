import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing, HIT_TARGET } from "@/theme";
import { triggerAdvanceFeedback } from "@/utils/actionFeedback";
import { Text } from "./Text";

type ButtonTone = "primary" | "brand" | "danger";
type ButtonSize = "md" | "sm";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  iconRight?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
  /** primary = deep green fill · brand = lime fill w/ ink text · danger = red */
  tone?: ButtonTone;
  size?: ButtonSize;
  testID?: string;
  /** Haptic feedback for Next / Continue-style actions. */
  advanceFeedback?: boolean;
};

const FILL: Record<ButtonTone, { bg: string; fg: string; pressed: string }> = {
  primary: { bg: colors.primaryDark, fg: colors.white, pressed: "#0B3D2A" },
  brand: { bg: colors.brandLime, fg: colors.brandInk, pressed: "#8FDB60" },
  danger: { bg: colors.error, fg: colors.white, pressed: "#B91C1C" },
};

const OUTLINE: Record<ButtonTone, { border: string; fg: string; pressedBg: string }> = {
  primary: { border: colors.primaryDark, fg: colors.primaryDark, pressedBg: colors.primarySoft },
  brand: { border: colors.brandInk, fg: colors.brandInk, pressedBg: "#EAF7DF" },
  danger: { border: colors.error, fg: colors.error, pressedBg: colors.errorSoft },
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  iconRight,
  fullWidth = true,
  style,
  tone = "primary",
  size = "md",
  testID,
  advanceFeedback = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const c = FILL[tone];
  const handlePress = () => {
    if (advanceFeedback) triggerAdvanceFeedback();
    onPress?.();
  };
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.baseSm,
        { backgroundColor: isDisabled ? colors.disabledBg : pressed ? c.pressed : c.bg },
        !isDisabled && styles.raised,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Feather
              name={icon}
              size={size === "sm" ? 16 : 18}
              color={isDisabled ? colors.textTertiary : c.fg}
            />
          ) : null}
          <Text
            variant={size === "sm" ? "bodySm" : "label"}
            weight="semibold"
            style={{ color: isDisabled ? colors.textTertiary : c.fg }}
          >
            {label}
          </Text>
          {iconRight ? (
            <Feather
              name={iconRight}
              size={size === "sm" ? 16 : 18}
              color={isDisabled ? colors.textTertiary : c.fg}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  iconRight,
  fullWidth = true,
  style,
  tone = "primary",
  size = "md",
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const c = OUTLINE[tone];
  const fg = isDisabled ? colors.textTertiary : c.fg;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.baseSm,
        styles.secondary,
        {
          borderColor: isDisabled ? colors.border : c.border,
          backgroundColor: pressed && !isDisabled ? c.pressedBg : colors.surface,
        },
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Feather name={icon} size={size === "sm" ? 16 : 18} color={fg} /> : null}
          <Text
            variant={size === "sm" ? "bodySm" : "label"}
            weight="semibold"
            style={{ color: fg }}
          >
            {label}
          </Text>
          {iconRight ? (
            <Feather name={iconRight} size={size === "sm" ? 16 : 18} color={fg} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

export function TextButton({
  label,
  onPress,
  disabled,
  tone = "primary",
  icon,
  iconRight,
  style,
}: Pick<ButtonProps, "label" | "onPress" | "disabled" | "tone" | "style" | "icon" | "iconRight">) {
  const fg = disabled
    ? colors.textTertiary
    : tone === "danger"
      ? colors.error
      : colors.primaryDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.textBtn, pressed && { opacity: 0.55 }, style]}
    >
      <View style={styles.rowTight}>
        {icon ? <Feather name={icon} size={16} color={fg} /> : null}
        <Text variant="label" weight="semibold" style={{ color: fg }}>
          {label}
        </Text>
        {iconRight ? <Feather name={iconRight} size={16} color={fg} /> : null}
      </View>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = colors.textPrimary,
  background = colors.surface,
  size = 20,
  disabled,
  badge,
  raised = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  accessibilityLabel: string;
  color?: string;
  background?: string;
  size?: number;
  disabled?: boolean;
  badge?: boolean;
  /** Adds a soft shadow (use on top of imagery). */
  raised?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconBtn,
        { backgroundColor: background },
        raised && styles.iconRaised,
        pressed && styles.pressed,
        disabled && { opacity: 0.4 },
      ]}
    >
      <Feather name={icon} size={size} color={color} />
      {badge ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  baseSm: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  raised: { ...shadow.button },
  fullWidth: { alignSelf: "stretch" },
  secondary: {
    borderWidth: 1.5,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowTight: { flexDirection: "row", alignItems: "center", gap: 6 },
  textBtn: {
    minHeight: HIT_TARGET,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  iconBtn: {
    width: HIT_TARGET,
    height: HIT_TARGET,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRaised: { ...shadow.soft },
  dot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
