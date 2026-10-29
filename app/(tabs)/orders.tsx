import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { Screen, Text, EmptyState, ErrorState, PageLoader } from "@/components/ui";
import { OrderCard } from "@/components/cards/OrderCard";
import { useOrders } from "@/hooks/useOrders";

export default function OrdersTabScreen() {
  const router = useRouter();
  const orders = useOrders();

  if (orders.isLoading) {
    return (
      <Screen edges={["top"]}>
        <Text variant="h2" style={styles.title}>
          Orders
        </Text>
        <PageLoader label="Loading orders…" />
      </Screen>
    );
  }

  if (orders.isError) {
    return (
      <Screen edges={["top"]}>
        <Text variant="h2" style={styles.title}>
          Orders
        </Text>
        <ErrorState onRetry={() => orders.refetch()} />
      </Screen>
    );
  }

  const data = [...(orders.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Screen edges={["top"]}>
      <FlatList
        data={data}
        keyExtractor={(o) => o.orderId}
        ListHeaderComponent={
          <Text variant="h2" style={styles.title}>
            Orders
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <OrderCard
              order={item}
              onPress={() => router.push(`/orders/${item.orderId}`)}
              primaryActionLabel={
                item.orderStatus === "READY_FOR_PICKUP" || item.orderStatus === "PAID"
                  ? "Show pickup code"
                  : undefined
              }
              onPrimaryAction={() => router.push(`/orders/${item.orderId}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="package"
            title="No orders yet"
            subtitle="Reserve a surprise bag and your pickups will show up here."
            actionLabel="Discover bags"
            onAction={() => router.push("/discover")}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingBottom: spacing.huge, gap: spacing.md },
  cardWrap: { paddingHorizontal: spacing.lg },
});
