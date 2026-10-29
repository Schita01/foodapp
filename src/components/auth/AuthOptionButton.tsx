import { ActivityIndicator, Image, Pressable, StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/theme";
import { authAssets, authColors } from "@/assets/auth";
import { Text } from "@/components/ui";

export type AuthOptionVariant = "google" | "facebook" | "email";

const ICONS = {
  google: authAssets.iconGoogle,
  facebook: authAssets.iconFacebook,
  email: authAssets.iconEmail,
} as const;

export function AuthOptionButton({
  variant,
  label,
  onPress,
  loading,
  disabled,
}: {
  variant: AuthOptionVariant;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  const light = variant !== "google";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "google" && styles.google,
        variant === "facebook" && styles.facebook,
        variant === "email" && styles.email,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={light ? colors.white : authColors.green} />
      ) : (
        <View style={styles.row}>
          <Image source={ICONS[variant]} style={styles.icon} resizeMode="contain" />
          <Text
            variant="label"
            weight="bold"
            style={[styles.label, { color: light ? colors.white : authColors.green }]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  google: { backgroundColor: colors.white },
  facebook: { backgroundColor: authColors.facebook },
  email: {
    backgroundColor: authColors.greenMid,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  icon: { width: 22, height: 22 },
  label: { fontSize: 16 },
});
