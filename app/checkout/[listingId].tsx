import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import {
  Screen,
  Text,
  PrimaryButton,
  ScreenHeader,
  ErrorState,
  QuantityStepper,
} from "@/components/ui";
import { PaymentMethodSheet, type SelectedMethod } from "@/components/PaymentMethodSheet";
import { useListing } from "@/hooks/useListings";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCheckoutDraftStore } from "@/store/checkoutDraftStore";
import { formatPickupWindow, formatPrice } from "@/utils/format";
import { selectionTotals } from "@/utils/order";
import { ApiError } from "@/services";

const DEFAULT_METHOD: SelectedMethod = { kind: "google_pay", label: "Google Pay" };

export default function CheckoutScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const id = listingId ?? "";
  const router = useRouter();
  const listing = useListing(id);
  const createOrder = useCreateOrder();
  const draft = useCheckoutDraftStore();
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<SelectedMethod>(DEFAULT_METHOD);
  const [sheet, setSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (draft.listingId === id) {
      setQuantity(Math.max(0, draft.bagQty));
    }
  }, [draft.listingId, draft.bagQty, id]);

  const items = draft.listingId === id ? draft.items : {};
  const l = listing.data;
  const totals = useMemo(
    () => (l ? selectionTotals(l, quantity, items) : null),
    [l, quantity, items],
  );

  if (listing.isLoading) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Checkout" />
        <View style={styles.center}>
          <Text variant="body" tone="secondary">
            Loading…
          </Text>
        </View>
      </Screen>
    );
  }

  if (listing.isError || !l) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Checkout" />
        <ErrorState onRetry={() => listing.refetch()} />
      </Screen>
    );
  }

  const lineItems = totals?.lineItems ?? [];

  const pay = async () => {
    setError(null);
    try {
      const order = await createOrder.mutateAsync({
        listingId: l.listingId,
        quantity,
        customItems: lineItems.map((li) => ({
          itemId: li.itemId!,
          name: li.name,
          price: li.unitPrice,
          quantity: li.quantity,
        })),
        paymentMethodLabel: method.label,
      });
      draft.clear();
      router.replace(`/orders/${order.orderId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Payment failed. Try again.");
    }
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScreenHeader title="Checkout" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="h3">{l.title}</Text>
        <Text variant="bodySm" tone="secondary">
          {l.restaurantName} · {l.branchName}
        </Text>
        <Text variant="bodySm" tone="secondary">
          Pickup {formatPickupWindow(l.pickupStart, l.pickupEnd, l.timezone)}
        </Text>

        <View style={styles.row}>
          <Text variant="label">Surprise bags</Text>
          <QuantityStepper
            value={quantity}
            min={0}
            max={Math.max(0, l.quantityAvailable)}
            onChange={setQuantity}
          />
        </View>

        {lineItems.length > 0 ? (
          <View style={styles.itemsBlock}>
            <Text variant="label">Chosen items</Text>
            {lineItems.map((li) => (
              <View key={li.itemId} style={styles.itemRow}>
                <Text variant="bodySm" style={styles.flex}>
                  {li.quantity}× {li.name}
                </Text>
                <Text variant="bodySm">
                  {formatPrice(li.unitPrice * li.quantity, l.currency)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.payBlock}>
          <Text variant="caption" weight="semibold" tone="tertiary" style={styles.payLabel}>
            PAYMENT METHOD
          </Text>
          <View style={styles.payRow}>
            <View style={styles.payIcon}>
              <Feather name="credit-card" size={16} color={colors.textPrimary} />
            </View>
            <Text variant="body" style={styles.flex}>
              {method.label}
            </Text>
            <Pressable onPress={() => setSheet(true)} hitSlop={8}>
              <Text variant="bodySm" weight="semibold" tone="brand">
                Change
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text variant="h3">Total</Text>
          <Text variant="h2">{formatPrice(totals?.subtotal ?? 0, l.currency)}</Text>
        </View>

        <Text variant="caption" tone="secondary" center>
          By reserving this meal you agree to RescueBite’s{" "}
          <Text variant="caption" weight="semibold" tone="brand" onPress={() => router.push("/legal/terms")}>
            Terms & conditions
          </Text>
        </Text>

        {error ? (
          <Text variant="bodySm" tone="error">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Pay & reserve"
          loading={createOrder.isPending}
          disabled={!totals || totals.count < 1}
          onPress={pay}
          advanceFeedback
        />
      </View>

      <PaymentMethodSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        selected={method}
        onSelect={(m) => {
          setMethod(m);
          setSheet(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  itemsBlock: { gap: spacing.sm },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  flex: { flex: 1 },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  payBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  payLabel: { letterSpacing: 0.6 },
  payRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  payIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { padding: spacing.lg },
});
