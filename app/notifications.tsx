import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { colors, spacing } from "@/theme";
import { Screen, Text, ScreenHeader, EmptyState, ErrorState, TextButton, IconButton } from "@/components/ui";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { formatDateTime } from "@/utils/format";
import type { AppNotification } from "@/types";

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const onOpen = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.notificationId);
    if (n.deepLink) {
      router.push(n.deepLink as `/orders/${string}`);
      return;
    }
    if (n.orderId) router.push(`/orders/${n.orderId}`);
    else if (n.listingId) router.push(`/listings/${n.listingId}`);
  };

  if (notifications.isLoading) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Notifications" />
        <Text variant="body" tone="secondary" style={styles.pad}>
          Loading…
        </Text>
      </Screen>
    );
  }

  if (notifications.isError) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Notifications" />
        <ErrorState onRetry={() => notifications.refetch()} />
      </Screen>
    );
  }

  const data = [...(notifications.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title="Notifications"
        right={
          <View style={styles.headerRight}>
            {data.some((n) => !n.read) ? (
              <TextButton label="Read all" onPress={() => markAll.mutate()} />
            ) : null}
            <IconButton
              icon="settings"
              accessibilityLabel="Notification settings"
              onPress={() => router.push("/profile/notification-settings" as Href)}
            />
          </View>
        }
      />
      <FlatList
        data={data}
        keyExtractor={(n) => n.notificationId}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpen(item)}
            style={[styles.row, !item.read && styles.unread]}
            accessibilityRole="button"
          >
            <View style={styles.flex}>
              <Text variant="label" weight={item.read ? undefined : "bold"}>
                {item.title}
              </Text>
              <Text variant="bodySm" tone="secondary">
                {item.body}
              </Text>
              <Text variant="caption" tone="tertiary">
                {formatDateTime(item.createdAt)}
              </Text>
            </View>
            {!item.read ? <View style={styles.dot} /> : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="No notifications"
            subtitle="Order updates and pickup reminders will appear here."
          />
        }
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg },
  list: { paddingBottom: spacing.huge },
  headerRight: { flexDirection: "row", alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unread: { backgroundColor: colors.primarySoft },
  flex: { flex: 1, gap: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
  },
});
