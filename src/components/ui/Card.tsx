import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, shadow, spacing } from "@/theme";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  /** elevated = soft shadow (default) · outlined = hairline border, no shadow · flat = tinted, no shadow */
  variant?: "elevated" | "outlined" | "flat";
  accessibilityLabel?: string;
};

export function Card({
  children,
  onPress,
  style,
  padded = true,
  variant = "elevated",
  accessibilityLabel,
}: Props) {
  const content = (
    <View
      style={[
        styles.card,
        variant === "elevated" && styles.elevated,
        variant === "outlined" && styles.outlined,
        variant === "flat" && styles.flat,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardLg,
    overflow: "hidden",
  },
  elevated: { ...shadow.card },
  outlined: { borderWidth: 1, borderColor: colors.border },
  flat: { backgroundColor: colors.backgroundAlt },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
});
