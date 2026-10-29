import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import type { Order } from "@/types";
import { formatPickupWindow, formatPrice } from "@/utils/format";
import { orderStatusMeta } from "@/utils/status";
import { Text } from "../ui/Text";
import { StatusBadge } from "../ui/Badge";
import { PrimaryButton, SecondaryButton } from "../ui/Button";

export function OrderCard({
  order,
  onPress,
  primaryActionLabel,
  onPrimaryAction,
  primaryTone = "primary",
}: {
  order: Order;
  onPress: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryTone?: "primary" | "secondary";
}) {
  const meta = orderStatusMeta(order.orderStatus);
  const hasAction = Boolean(primaryActionLabel && onPrimaryAction);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${order.listingTitle}, ${meta.label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Image source={{ uri: order.listingImageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text variant="bodySm" tone="secondary" numberOfLines={1} style={styles.flex}>
              {order.restaurantName} · {order.branchName}
            </Text>
            <Feather name="chevron-right" size={18} color={colors.textTertiary} />
          </View>
          <Text variant="h3" weight="bold" numberOfLines={1}>
            {order.listingTitle}
          </Text>
          <View style={styles.row}>
            <Feather name="clock" size={13} color={colors.textSecondary} />
            <Text variant="bodySm" tone="secondary" numberOfLines={1} style={styles.flex}>
              {formatPickupWindow(order.pickupStart, order.pickupEnd)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <StatusBadge label={meta.label} tone={meta.tone} />
            <Text variant="label" weight="bold">
              {formatPrice(order.total, order.currency)}
            </Text>
          </View>
        </View>
      </View>

      {hasAction ? (
        <View style={styles.footer}>
          {primaryTone === "primary" ? (
            <PrimaryButton
              label={primaryActionLabel!}
              onPress={onPrimaryAction}
              size="sm"
              style={styles.flex}
            />
          ) : (
            <SecondaryButton
              label={primaryActionLabel!}
              onPress={onPrimaryAction}
              size="sm"
              style={styles.flex}
            />
          )}
          <SecondaryButton
            label="Details"
            onPress={onPress}
            size="sm"
            fullWidth={false}
            style={styles.detailsBtn}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardLg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.card,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  top: { flexDirection: "row", gap: spacing.md },
  image: { width: 92, height: 92, borderRadius: radii.lg, backgroundColor: colors.disabledBg },
  info: { flex: 1, gap: 3, justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  flex: { flex: 1 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailsBtn: { paddingHorizontal: spacing.lg },
});
