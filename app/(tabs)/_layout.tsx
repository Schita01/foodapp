import { ColorValue, Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii } from "@/theme";
import { useOrders } from "@/hooks/useOrders";
import { ACTIVE_ORDER_STATUSES } from "@/utils/status";

type IconName = keyof typeof Feather.glyphMap;

function TabIcon({
  name,
  color,
  focused,
  badge,
}: {
  name: IconName;
  color: ColorValue;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather name={name} size={22} color={color} />
      {badge ? (
        <View style={styles.badge}>
          <View style={styles.badgeInner} />
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const orders = useOrders();
  const activeOrders = (orders.data ?? []).filter((o) =>
    ACTIVE_ORDER_STATUSES.includes(o.orderStatus),
  ).length;

  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 0 : 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [styles.bar, { height: 62 + bottomPad, paddingBottom: bottomPad }],
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => <TabIcon name="compass" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => <TabIcon name="search" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="shopping-bag" color={color} focused={focused} badge={activeOrders} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Favourites",
          tabBarIcon: ({ color, focused }) => <TabIcon name="heart" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name="user" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingTop: 6,
    shadowColor: "#1F2A22",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  item: { paddingVertical: 2 },
  label: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  iconWrap: {
    width: 48,
    height: 30,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: colors.primarySoft },
  badge: {
    position: "absolute",
    top: 2,
    right: 9,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});
