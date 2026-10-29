import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, radii, HIT_TARGET } from "@/theme";
import { Text } from "../ui/Text";
import { useUnreadCount } from "@/hooks/useNotifications";

export function NotificationBell() {
  const router = useRouter();
  const unread = useUnreadCount();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Notifications${unread ? `, ${unread} unread` : ""}`}
      onPress={() => router.push("/notifications")}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
    >
      <Feather name="bell" size={22} color={colors.textPrimary} />
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text variant="caption" tone="inverse">
            {unread > 9 ? "9+" : unread}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: HIT_TARGET,
    height: HIT_TARGET,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
