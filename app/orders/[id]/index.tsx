import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import {
  Screen,
  Text,
  ScreenHeader,
  ErrorState,
  QRCodeDisplay,
  StatusBadge,
  SecondaryButton,
  PrimaryButton,
  PageLoader,
  BottomSheet,
  ConfirmDialog,
} from "@/components/ui";
import { MapPreview } from "@/components/MapPreview";
import { OrderPackaging } from "@/components/OrderPackaging";
import { useCancelOrder, useOrder } from "@/hooks/useOrders";
import { openDirections } from "@/utils/maps";
import {
  formatDate,
  formatPickupWindow,
  formatPrice,
  formatTime,
  isToday,
  isWithinPickupWindow,
} from "@/utils/format";
import { ACTIVE_ORDER_STATUSES, orderStatusMeta } from "@/utils/status";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = id ?? "";
  const router = useRouter();
  const orderQuery = useOrder(orderId);
  const cancel = useCancelOrder();
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (orderQuery.isLoading) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Your order" />
        <PageLoader label="Loading your order…" />
      </Screen>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Your order" />
        <ErrorState onRetry={() => orderQuery.refetch()} />
      </Screen>
    );
  }

  const order = orderQuery.data;
  const meta = orderStatusMeta(order.orderStatus);
  const isActive = ACTIVE_ORDER_STATUSES.includes(order.orderStatus);
  const pickupOpen = isWithinPickupWindow(order.pickupStart, order.pickupEnd);
  const locked = !pickupOpen && order.orderStatus !== "READY_FOR_PICKUP";
  const canCancel = order.orderStatus === "PAID" || order.orderStatus === "PREPARING";
  const start = new Date(order.pickupStart);
  const dayLabel = isToday(start) ? "Today" : formatDate(order.pickupStart);
  const bagTotal = order.unitPrice * order.quantity;
  const itemsTotal = (order.customItems ?? []).reduce(
    (sum, li) => sum + li.unitPrice * li.quantity,
    0,
  );
  const lat = order.branchLatitude ?? order.latitude;
  const lng = order.branchLongitude ?? order.longitude;

  return (
    <Screen edges={["top", "bottom"]}>
      <ScreenHeader title="Your order" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={styles.card}>
          <Text variant="caption" weight="semibold" tone="tertiary" style={styles.kicker}>
            ORDER STATUS
          </Text>
          <View style={styles.statusRow}>
            <StatusBadge label={meta.label} tone={meta.tone} />
            {isActive ? (
              <Text variant="bodySm" tone="secondary">
                {pickupOpen ? "Collection window is open" : "Pickup not open yet"}
              </Text>
            ) : null}
          </View>
          <View style={styles.idRow}>
            <Text variant="bodySm" tone="secondary">
              Order ID
            </Text>
            <View style={styles.idPill}>
              <Text variant="label" weight="bold" style={styles.idText}>
                {order.orderId.replace(/^ord-/, "").slice(-6).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <View style={styles.qtyBadge}>
              <Text variant="caption" weight="bold" tone="inverse">
                {order.quantity}x
              </Text>
            </View>
            <Image source={{ uri: order.listingImageUrl }} style={styles.thumb} contentFit="cover" />
            <View style={styles.flex}>
              <Text variant="label" numberOfLines={1}>
                {order.listingTitle}
              </Text>
              <Text variant="bodySm" tone="secondary" numberOfLines={1}>
                {order.restaurantName}
              </Text>
            </View>
            <Text variant="label">{formatPrice(bagTotal, order.currency)}</Text>
          </View>
          {(order.customItems ?? []).map((li) => (
            <View key={`${li.itemId ?? li.name}`} style={styles.lineRow}>
              <Text variant="bodySm" tone="secondary" style={styles.flex}>
                {li.quantity}× {li.name}
              </Text>
              <Text variant="bodySm">{formatPrice(li.unitPrice * li.quantity, order.currency)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Row label="Subtotal" value={formatPrice(bagTotal + itemsTotal, order.currency)} muted />
          <Row label="Service fee" value={formatPrice(0, order.currency)} muted />
          <Row label="Total" value={formatPrice(order.total, order.currency)} bold />
          <Text variant="caption" tone="tertiary">
            Paid with {order.paymentMethodLabel}
          </Text>
        </View>

        {/* Store */}
        <View style={styles.card}>
          <Pressable
            style={styles.storeRow}
            onPress={() => router.push(`/restaurants/${order.restaurantId}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${order.restaurantName}`}
          >
            <View style={styles.flex}>
              <Text variant="label">
                {order.restaurantName} · {order.branchName}
              </Text>
              <Text variant="bodySm" tone="secondary">
                {order.branchAddress}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textTertiary} />
          </Pressable>
          {lat != null && lng != null ? (
            <MapPreview
              height={130}
              pins={[{ id: "branch", latitude: lat, longitude: lng, active: true }]}
            />
          ) : null}
          <SecondaryButton
            label="Get directions"
            icon="navigation"
            size="sm"
            onPress={() => openDirections(lat, lng, order.branchAddress)}
          />
        </View>

        {/* Pickup */}
        <View style={styles.card}>
          <InfoRow
            icon="clock"
            title={`Pick up: ${dayLabel}`}
            body={`between ${formatTime(start, order.timezone)} and ${formatTime(new Date(order.pickupEnd), order.timezone)}`}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="shopping-bag"
            title="Bring your own bag"
            body="This store will ensure your food is packed and ready for collection, but we encourage you to bring your own bag."
          />
        </View>

        <OrderPackaging
          collectionInstructions={order.pickupInstructions}
          packaging={order.packaging}
          allergens={order.allergens}
          ingredientsNote={order.ingredientsNote}
        />

        <SecondaryButton
          label="Need help?"
          icon="help-circle"
          onPress={() => router.push("/profile/support" as Href)}
          fullWidth={false}
          style={styles.help}
        />

        {canCancel ? (
          <Pressable onPress={() => setConfirmCancel(true)} style={styles.cancelLink}>
            <Text variant="bodySm" weight="semibold" tone="error">
              Cancel order
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {isActive ? (
        <View style={styles.footer}>
          <View style={styles.footerText}>
            <Text variant="caption" weight="semibold" tone="tertiary">
              WHAT YOU NEED TO KNOW
            </Text>
            <Text variant="bodySm" tone="secondary">
              {formatPickupWindow(order.pickupStart, order.pickupEnd, order.timezone)}
            </Text>
          </View>
          <PrimaryButton
            label={locked ? "Show pickup code" : "Tap to collect"}
            icon={locked ? "lock" : "maximize"}
            fullWidth={false}
            onPress={() => setQrOpen(true)}
          />
        </View>
      ) : null}

      <BottomSheet
        visible={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Show this to the store"
        closeInCircle
      >
        <View style={styles.qrWrap}>
          <QRCodeDisplay value={order.pickupQrValue} code={order.pickupCode} locked={locked} />
          <Text variant="bodySm" tone="secondary" center>
            {locked
              ? "Your code unlocks when the collection window opens."
              : "Staff will scan this code or type in your pickup code."}
          </Text>
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={confirmCancel}
        title="Cancel this order?"
        message="You’ll be refunded to your original payment method. The bag goes back on sale for someone else to rescue."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        icon="x-circle"
        loading={cancel.isPending}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={async () => {
          await cancel.mutateAsync(order.orderId);
          setConfirmCancel(false);
          router.back();
        }}
      />
    </Screen>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <View style={styles.lineRow}>
      <Text variant={bold ? "label" : "bodySm"} tone={muted ? "secondary" : "primary"} style={styles.flex}>
        {label}
      </Text>
      <Text variant={bold ? "label" : "bodySm"} tone={muted ? "secondary" : "primary"} weight={bold ? "bold" : undefined}>
        {value}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={18} color={colors.primaryDark} />
      </View>
      <View style={styles.flex}>
        <Text variant="label">{title}</Text>
        <Text variant="bodySm" tone="secondary">
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  kicker: { letterSpacing: 0.6 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, flexWrap: "wrap" },
  idRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  idPill: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  idText: { letterSpacing: 2 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  qtyBadge: {
    position: "absolute",
    left: -6,
    top: -6,
    zIndex: 1,
    backgroundColor: colors.primaryDark,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  thumb: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.disabledBg },
  flex: { flex: 1 },
  lineRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  storeRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  infoRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  help: { alignSelf: "center", marginTop: spacing.xs },
  cancelLink: { alignSelf: "center", paddingVertical: spacing.sm },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerText: { flex: 1, gap: 2 },
  qrWrap: { alignItems: "center", gap: spacing.lg, paddingVertical: spacing.md },
});
