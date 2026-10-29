import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import type { Listing } from "@/types";
import { formatDistance, formatPickupWindow, formatPrice, formatTime, isToday } from "@/utils/format";
import { listingStatusMeta } from "@/utils/status";
import { Text } from "../ui/Text";
import { StatusBadge } from "../ui/Badge";
import { PriceTag } from "../ui/PriceTag";
import { RatingStars } from "../ui/RatingStars";

function collectLabel(listing: Listing): string {
  const start = new Date(listing.pickupStart);
  const end = new Date(listing.pickupEnd);
  const day = isToday(start) ? "today" : "later";
  return `Collect ${day}: ${formatTime(start)} - ${formatTime(end)}`;
}

export function ListingCard({
  listing,
  onPress,
  favourite,
  onToggleFavourite,
  width,
  variant = "feed",
  logoUrl,
}: {
  listing: Listing;
  onPress: () => void;
  favourite?: boolean;
  onToggleFavourite?: () => void;
  width?: number;
  variant?: "feed" | "full" | "discover" | "browse";
  /** Optional store logo shown on discover cards. */
  logoUrl?: string;
}) {
  const soldOut = listing.status === "SOLD_OUT";
  const meta = listingStatusMeta(listing.status);
  const showStatus =
    listing.status === "SOLD_OUT" || listing.status === "EXPIRING_SOON";
  const popular = listing.rating >= 4.5 && listing.reviewCount >= 50;

  const localHero = listing.rating >= 4.5;
  const discountPct =
    listing.originalValue > listing.price
      ? Math.round((1 - listing.price / listing.originalValue) * 100)
      : 0;

  if (variant === "discover" || variant === "browse") {
    const isBrowse = variant === "browse";
    const disabled = soldOut;
    const hasImage = Boolean(listing.imageUrl) && !disabled;
    const textTone = disabled ? "tertiary" : undefined;
    const leftBadge = (() => {
      if (disabled) return <View />;
      if (listing.quantityAvailable === 1) {
        return (
          <View style={styles.leftBadge}>
            <Text variant="caption" weight="semibold">
              1 left
            </Text>
          </View>
        );
      }
      if (listing.reviewCount > 0 && listing.reviewCount < 80 && listing.rating >= 4) {
        return (
          <View style={styles.gemBadge}>
            <Text variant="caption" weight="semibold" style={styles.gemBadgeText}>
              Hidden gem
            </Text>
          </View>
        );
      }
      if (popular) {
        return (
          <View style={styles.popularBadge}>
            <Text variant="caption" weight="semibold">
              Popular
            </Text>
          </View>
        );
      }
      if (listing.isVegan) {
        return (
          <View style={styles.popularBadge}>
            <Text variant="caption" weight="semibold">
              Vegan
            </Text>
          </View>
        );
      }
      if (listing.isVegetarian) {
        return (
          <View style={styles.popularBadge}>
            <Text variant="caption" weight="semibold">
              Vegetarian
            </Text>
          </View>
        );
      }
      if (localHero) {
        return (
          <View style={styles.heroBadge}>
            <Text variant="caption" weight="semibold" style={styles.heroBadgeText}>
              Local Hero
            </Text>
          </View>
        );
      }
      if (showStatus) return <StatusBadge label={meta.label} tone={meta.tone} />;
      return <View />;
    })();

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${listing.title} from ${listing.restaurantName}`}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.discoverCard,
          isBrowse ? styles.full : { width: width ?? 280 },
          disabled && styles.disabledCard,
          pressed && !disabled && { opacity: 0.95 },
        ]}
      >
        <View style={styles.discoverImageWrap}>
          {hasImage ? (
            <Image
              source={{ uri: listing.imageUrl }}
              style={[isBrowse ? styles.browseImage : styles.discoverImage]}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={[isBrowse ? styles.browseImage : styles.discoverImage, styles.imagePlaceholder]} />
          )}
          <View style={styles.discoverBadges}>
            {leftBadge}
            <View style={[styles.ratingBadge, disabled && styles.ratingBadgeDisabled]}>
              <Feather name="star" size={12} color={disabled ? colors.textTertiary : colors.primary} />
              <Text variant="caption" weight="semibold" tone={textTone}>
                {listing.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          {logoUrl && !disabled ? (
            <View style={styles.logoBadge}>
              <Image source={{ uri: logoUrl }} style={styles.logoImg} contentFit="cover" />
            </View>
          ) : (
            <View style={[styles.logoBadge, disabled ? styles.logoDisabled : styles.logoFallback]}>
              {!disabled ? (
                <Text variant="caption" tone="inverse" weight="bold">
                  {listing.restaurantName.slice(0, 1).toUpperCase()}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.discoverBody}>
          <View style={styles.titleRow}>
            <Text variant="label" numberOfLines={1} style={styles.flex} tone={textTone}>
              {listing.restaurantName} - {listing.branchName}
            </Text>
            {onToggleFavourite ? (
              <Pressable
                onPress={onToggleFavourite}
                hitSlop={8}
                accessibilityLabel={favourite ? "Remove favourite" : "Add favourite"}
              >
                <Feather
                  name="heart"
                  size={20}
                  color={
                    disabled
                      ? colors.textTertiary
                      : favourite
                        ? colors.error
                        : colors.primaryDark
                  }
                />
              </Pressable>
            ) : null}
          </View>
          <Text variant="bodySm" tone={disabled ? "tertiary" : "secondary"} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text variant="bodySm" tone={textTone} numberOfLines={1}>
            {collectLabel(listing)}
            {"  |  "}
            {formatDistance(listing.distanceKm)}
          </Text>
          <View style={styles.dottedLine} />
          <View style={styles.priceRow}>
            {listing.originalValue > listing.price ? (
              <Text variant="bodySm" tone="tertiary" style={styles.strike}>
                {formatPrice(listing.originalValue, listing.currency)}
              </Text>
            ) : null}
            <Text variant="h3" weight="bold" tone={textTone}>
              {formatPrice(listing.price, listing.currency)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title} from ${listing.restaurantName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        variant === "feed" ? { width: width ?? 240 } : styles.full,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: listing.imageUrl }}
          style={[styles.image, soldOut && styles.dim]}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.imageTop}>
          {showStatus ? <StatusBadge label={meta.label} tone={meta.tone} /> : <View />}
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
        </View>
        {listing.quantityAvailable > 0 && !soldOut ? (
          <View style={styles.qtyBadge}>
            <Text variant="caption" weight="semibold" style={styles.qtyBadgeText}>
              {listing.quantityAvailable} left
            </Text>
          </View>
        ) : null}
        {logoUrl ? (
          <View style={styles.feedLogo}>
            <Image source={{ uri: logoUrl }} style={styles.logoImg} contentFit="cover" />
          </View>
        ) : null}
      </View>

      <View style={[styles.body, logoUrl && styles.bodyWithLogo]}>
        <Text variant="bodySm" tone="secondary" numberOfLines={1}>
          {listing.restaurantName} · {listing.branchName}
        </Text>
        <Text variant="h3" weight="bold" numberOfLines={1}>
          {listing.title}
        </Text>
        <View style={styles.metaRow}>
          <RatingStars rating={listing.rating} reviewCount={listing.reviewCount} />
          <Text variant="bodySm" tone="secondary">
            · {formatDistance(listing.distanceKm)}
          </Text>
        </View>
        <View style={styles.pickupRow}>
          <Feather name="clock" size={13} color={colors.textSecondary} />
          <Text variant="bodySm" tone="secondary" numberOfLines={1} style={styles.pickup}>
            {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
          </Text>
        </View>
        <View style={styles.feedPriceRow}>
          <PriceTag
            price={listing.price}
            originalValue={listing.originalValue}
            currency={listing.currency}
          />
          {!soldOut && discountPct >= 30 ? (
            <View style={styles.savePill}>
              <Text variant="caption" weight="bold" style={styles.savePillText}>
                -{discountPct}%
              </Text>
            </View>
          ) : null}
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
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  full: { width: "100%" },
  imageWrap: { position: "relative" },
  image: { width: "100%", height: 150, backgroundColor: colors.disabledBg },
  dim: { opacity: 0.55 },
  imageTop: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heart: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  qtyBadge: {
    position: "absolute",
    top: spacing.sm + 40,
    left: spacing.sm,
    backgroundColor: "#F5E6A8",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  qtyBadgeText: { color: colors.brandInk },
  feedLogo: {
    position: "absolute",
    left: spacing.md,
    bottom: -18,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.surface,
    overflow: "hidden",
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  body: { padding: spacing.md, gap: 4 },
  bodyWithLogo: { paddingTop: spacing.xxl },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  pickupRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  pickup: { flex: 1 },
  feedPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  savePill: {
    backgroundColor: colors.brandLime,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  savePillText: { color: colors.brandInk },

  discoverCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: "hidden",
    alignSelf: "stretch",
    ...shadow.card,
  },
  disabledCard: {
    opacity: 1,
  },
  imagePlaceholder: {
    backgroundColor: colors.disabledBg,
  },
  discoverImageWrap: { position: "relative" },
  discoverImage: { width: "100%", height: 168, backgroundColor: colors.disabledBg },
  browseImage: { width: "100%", height: 172, backgroundColor: colors.disabledBg },
  discoverBadges: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  popularBadge: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    ...shadow.soft,
  },
  leftBadge: {
    backgroundColor: "#F5E6A8",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  gemBadge: {
    backgroundColor: "#E8F5E1",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  gemBadgeText: { color: colors.primaryDark },
  heroBadge: {
    backgroundColor: "#D7F0C2",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  heroBadgeText: { color: colors.primaryDark },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  ratingBadgeDisabled: {
    backgroundColor: "#F3F3F3",
  },
  logoBadge: {
    position: "absolute",
    left: spacing.md,
    bottom: -18,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.surface,
    overflow: "hidden",
    backgroundColor: colors.primaryDark,
    ...shadow.soft,
  },
  logoFallback: { alignItems: "center", justifyContent: "center" },
  logoDisabled: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EEEEEE",
    ...shadow.soft,
  },
  logoImg: { width: "100%", height: "100%" },
  discoverBody: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  flex: { flex: 1 },
  dottedLine: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  strike: { textDecorationLine: "line-through" },
});
