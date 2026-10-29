import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import type { Restaurant } from "@/types";
import { formatDistance } from "@/utils/format";
import { Text } from "../ui/Text";

export function RestaurantCard({
  restaurant,
  onPress,
  favourite,
  onToggleFavourite,
  width,
}: {
  restaurant: Restaurant;
  onPress: () => void;
  favourite?: boolean;
  onToggleFavourite?: () => void;
  width?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        width ? { width } : styles.full,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: restaurant.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.ratingBadge}>
          <Feather name="star" size={12} color={colors.accent} />
          <Text variant="caption" weight="bold">
            {restaurant.rating.toFixed(1)}
          </Text>
        </View>
        {onToggleFavourite ? (
          <Pressable
            onPress={onToggleFavourite}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={favourite ? "Remove favourite" : "Add favourite"}
            style={({ pressed }) => [styles.heart, pressed && { opacity: 0.8 }]}
          >
            <Feather
              name="heart"
              size={18}
              color={favourite ? colors.error : colors.textPrimary}
            />
          </Pressable>
        ) : null}
        <View style={styles.logoWrap}>
          <Image source={{ uri: restaurant.logoUrl }} style={styles.logo} contentFit="cover" />
        </View>
      </View>
      <View style={styles.body}>
        <Text variant="h3" weight="bold" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={13} color={colors.textSecondary} />
          <Text variant="bodySm" tone="secondary" numberOfLines={1}>
            {formatDistance(restaurant.distanceKm)}
          </Text>
          <Text variant="bodySm" tone="tertiary">
            ·
          </Text>
          <Text variant="bodySm" tone="secondary" numberOfLines={1} style={styles.flex}>
            {restaurant.reviewCount} reviews
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardLg,
    overflow: "hidden",
    ...shadow.card,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  full: { width: "100%" },
  imageWrap: { position: "relative" },
  image: { width: "100%", height: 110, backgroundColor: colors.disabledBg },
  ratingBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  logoWrap: {
    position: "absolute",
    bottom: -20,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.surface,
    overflow: "hidden",
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  logo: { width: "100%", height: "100%" },
  heart: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  body: {
    paddingTop: spacing.xxl + spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  flex: { flex: 1 },
});
