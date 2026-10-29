import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import type { PaymentCard } from "@/types";
import { Text } from "../ui/Text";

type WalletMethod = { type: "google_pay" | "apple_pay"; label: string };

export function PaymentMethodCard({
  card,
  wallet,
  selected,
  onPress,
  onRemove,
  showDefaultBadge,
}: {
  card?: PaymentCard;
  wallet?: WalletMethod;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  showDefaultBadge?: boolean;
}) {
  const icon: keyof typeof Feather.glyphMap = wallet
    ? wallet.type === "apple_pay"
      ? "smartphone"
      : "credit-card"
    : "credit-card";
  const title = wallet ? wallet.label : `${capitalize(card!.brand)} •••• ${card!.last4}`;
  const subtitle = wallet ? "Fast and secure" : `Expires ${card!.expiry} · ${card!.name}`;

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && onPress && { opacity: 0.9 },
      ]}
    >
      <View style={styles.iconBox}>
        <Feather name={icon} size={20} color={colors.primaryDark} />
      </View>
      <View style={styles.text}>
        <Text variant="label" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="bodySm" tone="secondary" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {showDefaultBadge && card?.isDefault ? (
        <View style={styles.defaultBadge}>
          <Text variant="caption" tone="brand">
            Default
          </Text>
        </View>
      ) : null}
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Remove card">
          <Feather name="trash-2" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : selected != null ? (
        <Feather
          name={selected ? "check-circle" : "circle"}
          size={20}
          color={selected ? colors.primary : colors.border}
        />
      ) : null}
    </Pressable>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  defaultBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
