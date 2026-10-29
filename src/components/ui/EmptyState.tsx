import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";
import { PrimaryButton, SecondaryButton } from "./Button";

export function EmptyState({
  icon = "inbox",
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={28} color={colors.primary} />
      </View>
      <Text variant="h2" center>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" tone="secondary" center style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.actions}>
          <PrimaryButton label={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <SecondaryButton
          label={secondaryLabel}
          onPress={onSecondary}
          fullWidth={false}
          style={styles.secondary}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  compact: { padding: spacing.lg },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 6,
    borderColor: "#F1F8F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  subtitle: { maxWidth: 300 },
  actions: { marginTop: spacing.sm },
  secondary: { marginTop: spacing.xs },
});
