import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { PageLoader, Screen, ScreenHeader, Text } from "@/components/ui";
import { PaymentMethodCard } from "@/components/cards/PaymentMethodCard";
import { useCards, useRemoveCard } from "@/hooks/usePayments";

export default function PaymentCardsScreen() {
  const cards = useCards();
  const remove = useRemoveCard();
  const list = cards.data ?? [];

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Payment cards" />
      {cards.isLoading ? (
        <PageLoader />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {list.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text variant="h3" center>
                You can add a payment card to your account during checkout
              </Text>
              <View style={styles.emptyIcon}>
                <Feather name="credit-card" size={36} color={colors.primaryDark} />
              </View>
            </View>
          ) : (
            <View style={styles.list}>
              {list.map((card) => (
                <PaymentMethodCard
                  key={card.cardId}
                  card={card}
                  showDefaultBadge
                  onRemove={() => remove.mutate(card.cardId)}
                />
              ))}
            </View>
          )}
          <Pressable style={styles.hint} accessibilityRole="text">
            <Feather name="info" size={16} color={colors.textSecondary} />
            <Text variant="bodySm" tone="secondary" style={styles.flex}>
              Cards are saved securely when you pay for a Surprise Bag. You can remove them here any time.
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.huge },
  emptyCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.cardLg,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    gap: spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { gap: spacing.md },
  hint: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  flex: { flex: 1 },
});
