import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "../ui/Text";
import { useLocationStore } from "@/store/locationStore";

export function LocationPill({
  variant = "default",
}: {
  /** Compact address-style control used on Discover. */
  variant?: "default" | "address";
}) {
  const router = useRouter();
  const location = useLocationStore((s) => s.location);
  const label = location?.city ?? "Set location";

  if (variant === "address") {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change location"
        onPress={() => router.push("/location")}
        style={({ pressed }) => [styles.address, pressed && { opacity: 0.75 }]}
      >
        <Feather name="map-pin" size={18} color={colors.primary} />
        <Text variant="label" numberOfLines={1} style={styles.addressText}>
          {label}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textPrimary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Change location"
      onPress={() => router.push("/location/manual")}
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.85 }]}
    >
      <Feather name="map-pin" size={15} color={colors.primary} />
      <View>
        <Text variant="caption" tone="tertiary">
          Pickup near
        </Text>
        <Text variant="label" numberOfLines={1} style={styles.city}>
          {label}
          {location ? ` · ${location.radiusKm}km` : ""}
        </Text>
      </View>
      <Feather name="chevron-down" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    maxWidth: 220,
  },
  city: { maxWidth: 150 },
  address: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    maxWidth: "92%",
    paddingVertical: spacing.xs,
  },
  addressText: { flexShrink: 1 },
});
