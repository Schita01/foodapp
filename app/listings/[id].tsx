import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, Text, PageLoader, ErrorState } from "@/components/ui";
import { MapPreview } from "@/components/MapPreview";
import {
  useListing,
  useFavouriteIds,
  useToggleRestaurantFavourite,
} from "@/hooks/useListings";
import { useRestaurant, useRestaurantReviews } from "@/hooks/useRestaurant";
import { useCheckoutDraftStore } from "@/store/checkoutDraftStore";
import type { ListingCategory, StoreItem } from "@/types";
import { openDirections } from "@/utils/maps";
import {
  discountPercent,
  formatDistance,
  formatPrice,
  formatTime,
  isToday,
} from "@/utils/format";
import { selectionTotals, type ItemSelection } from "@/utils/order";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INK = "#005045";
const H_PAD = spacing.lg;
const ITEM_GAP = 8;
const ITEM_COLS = 4;
const SCREEN_W = Dimensions.get("window").width;
const ITEM_W = (SCREEN_W - H_PAD * 2 - ITEM_GAP * (ITEM_COLS - 1)) / ITEM_COLS;

const CATEGORY_LABEL: Record<ListingCategory, string> = {
  meals: "Meals",
  bakery: "Bread & pastries",
  groceries: "Groceries",
  drinks: "Drinks",
  other: "Other",
};

const GOOD_TO_KNOW = [
  "Remember to bring your own bag",
  "Show your reservation in the app at pickup",
  "Contents vary — it's a surprise!",
  "Food may contain allergens listed below",
];

type Tab = "bags" | "items";

function leftBadgeColors(qty: number): { bg: string; fg: string } {
  if (qty <= 2) return { bg: "#FDECEC", fg: "#DC2626" };
  if (qty <= 5) return { bg: "#FEF3C7", fg: "#D97706" };
  return { bg: "#E4F3EA", fg: INK };
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listingId = id ?? "";
  const query = useListing(listingId);
  const restaurant = useRestaurant(query.data?.restaurantId ?? "");
  const reviewsQ = useRestaurantReviews(query.data?.restaurantId ?? "");
  const favs = useFavouriteIds();
  const toggleRestFav = useToggleRestaurantFavourite();
  const setDraft = useCheckoutDraftStore((s) => s.setDraft);
  const scrollRef = useRef<ScrollView>(null);
  const bagsY = useRef(0);
  const itemsY = useRef(0);

  const [tab, setTab] = useState<Tab>("bags");
  const [bagQty, setBagQty] = useState(0);
  const [items, setItems] = useState<ItemSelection>({});
  const [showAllItems, setShowAllItems] = useState(false);
  const [openRow, setOpenRow] = useState<"instructions" | "packaging" | "allergens" | null>(null);

  const listing = query.data;
  const storeItems = listing?.items ?? [];
  const visibleItems = showAllItems ? storeItems : storeItems.slice(0, 4);

  const totals = useMemo(
    () => (listing ? selectionTotals(listing, bagQty, items) : null),
    [listing, bagQty, items],
  );

  const savings = useMemo(() => {
    if (!listing) return 0;
    const bagSave = Math.max(0, listing.originalValue - listing.price) * bagQty;
    const itemSave = (listing.items ?? []).reduce((sum, it) => {
      const q = items[it.itemId] ?? 0;
      return sum + Math.max(0, (it.originalPrice ?? it.price) - it.price) * q;
    }, 0);
    return +(bagSave + itemSave).toFixed(2);
  }, [listing, bagQty, items]);

  const ratingBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviewsQ.data ?? []) {
      const i = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      counts[i] += 1;
    }
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    return [5, 4, 3, 2, 1].map((star) => ({ star, pct: counts[star - 1] / total }));
  }, [reviewsQ.data]);

  const restFav =
    !!listing && (favs.data?.restaurants.includes(listing.restaurantId) ?? false);

  if (query.isLoading) {
    return (
      <Screen edges={["top"]} background={colors.surface}>
        <PageLoader />
      </Screen>
    );
  }

  if (query.isError || !listing) {
    return (
      <Screen edges={["top"]} background={colors.surface}>
        <ErrorState onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  const reservable = listing.status === "ACTIVE" || listing.status === "EXPIRING_SOON";
  const logoUrl = restaurant.data?.logoUrl;
  const start = new Date(listing.pickupStart);
  const end = new Date(listing.pickupEnd);
  const timeRange = `${formatTime(start)} - ${formatTime(end)}`;
  const collectDay = isToday(start) ? "Today" : "Later";
  const reviews = reviewsQ.data ?? [];
  const bagDiscount = discountPercent(listing.price, listing.originalValue);

  const setItemQty = (itemId: string, qty: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  };

  const selectTab = (next: Tab) => {
    setTab(next);
    scrollRef.current?.scrollTo({
      y: Math.max(0, (next === "bags" ? bagsY.current : itemsY.current) - 12),
      animated: true,
    });
  };

  const toggleRow = (key: typeof openRow) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenRow((v) => (v === key ? null : key));
  };

  const goCheckout = () => {
    if (!totals || totals.count < 1) return;
    setDraft(listing.listingId, bagQty, items);
    router.push(`/checkout/${listing.listingId}`);
  };

  return (
    <Screen edges={["top", "bottom"]} padded={false} background="#F5F5F5">
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: listing.imageUrl }} style={styles.hero} contentFit="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroNav}>
            <CircleBtn
              icon="arrow-left"
              label="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/discover"))}
            />
            <View style={styles.heroNavRight}>
              <CircleBtn icon="share-2" label="Share" onPress={() => {}} />
              <CircleBtn
                icon="heart"
                label={restFav ? "Unfavourite" : "Favourite"}
                color={restFav ? colors.error : colors.black}
                onPress={() =>
                  toggleRestFav.mutate({ id: listing.restaurantId, favourite: restFav })
                }
              />
            </View>
          </View>

          <View style={styles.heroContent}>
            {listing.quantityAvailable > 0 ? (
              <View style={styles.leftToday}>
                <Text variant="caption" weight="semibold" style={styles.leftTodayText}>
                  {listing.quantityAvailable} left today
                </Text>
              </View>
            ) : null}
            <Text variant="h1" tone="inverse" style={styles.heroTitle} numberOfLines={2}>
              {listing.restaurantName} – {listing.branchName}
            </Text>
            <View style={styles.heroMetaRow}>
              <Feather name="map-pin" size={13} color="rgba(255,255,255,0.9)" />
              <Text variant="bodySm" tone="inverse" numberOfLines={1} style={styles.flex}>
                {listing.branchAddress}
              </Text>
            </View>
            <View style={styles.heroMetaRow}>
              <Feather name="clock" size={13} color="rgba(255,255,255,0.9)" />
              <Text variant="bodySm" tone="inverse">
                Collect: {timeRange}
              </Text>
              <View style={styles.todayBadge}>
                <Text variant="caption" weight="semibold" tone="inverse">
                  {collectDay}
                </Text>
              </View>
            </View>
          </View>

          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="cover" />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text variant="h3" tone="inverse">
                {listing.restaurantName.slice(0, 1)}
              </Text>
            </View>
          )}
        </View>

        {/* White sheet overlapping hero */}
        <View style={styles.sheet}>
          {/* Stats */}
          <View style={styles.statsBar}>
            <StatCol
              icon="star"
              iconColor={colors.accent}
              label={`${listing.rating.toFixed(1)} (${listing.reviewCount} reviews)`}
            />
            <View style={styles.statDivider} />
            <StatCol
              icon="navigation"
              iconColor={INK}
              label={`${formatDistance(listing.distanceKm)} from you`}
            />
            <View style={styles.statDivider} />
            <StatCol icon="clock" iconColor={INK} label={`${timeRange}\nCollection time`} />
            <View style={styles.statDivider} />
            <StatCol
              icon="award"
              iconColor={INK}
              label={listing.rating >= 4.5 ? "Top store\nHigh rating" : "Store\nNear you"}
            />
          </View>

          {/* Segmented tabs */}
          <View style={styles.tabWrap}>
            <Pressable
              onPress={() => selectTab("bags")}
              style={[styles.tabSeg, tab === "bags" && styles.tabSegOn]}
            >
              <Feather name="gift" size={16} color={tab === "bags" ? colors.white : INK} />
              <Text
                variant="label"
                style={{ color: tab === "bags" ? colors.white : INK }}
              >
                Surprise Bags
              </Text>
            </Pressable>
            <Pressable
              onPress={() => selectTab("items")}
              style={[styles.tabSeg, tab === "items" && styles.tabSegOn]}
            >
              <Feather name="shopping-bag" size={16} color={tab === "items" ? colors.white : INK} />
              <Text
                variant="label"
                style={{ color: tab === "items" ? colors.white : INK }}
              >
                Items
              </Text>
              {storeItems.length > 0 ? (
                <View style={styles.newPill}>
                  <Text variant="caption" weight="bold" style={styles.newPillText}>
                    New
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          {/* Promo */}
          <View style={styles.promo}>
            <View style={styles.promoIcon}>
              <Feather name="heart" size={16} color={INK} />
            </View>
            <View style={styles.flex}>
              <Text variant="label" style={{ color: INK }}>
                Save good food
              </Text>
              <Text variant="bodySm" tone="secondary">
                Help reduce food waste and get something delicious at a great price.
              </Text>
            </View>
            <View style={styles.promoPlanet}>
              <Feather name="globe" size={28} color={colors.primary} />
            </View>
          </View>

          {/* Surprise Bag — horizontal card */}
          <View
            style={styles.block}
            onLayout={(e) => {
              bagsY.current = e.nativeEvent.layout.y;
            }}
          >
            <Text variant="h3" style={styles.sectionTitle}>
              Surprise Bag
            </Text>
            <Text variant="bodySm" tone="secondary" style={styles.sectionSub}>
              A great mix of our tasty items.
            </Text>

            <View style={styles.bagCard}>
              <Image source={{ uri: listing.imageUrl }} style={styles.bagImg} contentFit="cover" />
              <View style={styles.bagMid}>
                <Text variant="label" numberOfLines={2} style={{ color: INK }}>
                  {listing.title}
                </Text>
                <Text variant="caption" tone="secondary" numberOfLines={2}>
                  {listing.description}
                </Text>
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text variant="caption" style={styles.tagText}>
                      {CATEGORY_LABEL[listing.category]}
                    </Text>
                  </View>
                  {listing.isVegetarian ? (
                    <View style={styles.tag}>
                      <Text variant="caption" style={styles.tagText}>
                        Vegetarian
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.bagRight}>
                <Text variant="h3" style={{ color: INK }}>
                  {formatPrice(listing.price, listing.currency)}
                </Text>
                <Text variant="caption" tone="tertiary" style={styles.strike}>
                  {formatPrice(listing.originalValue, listing.currency)}
                </Text>
                {bagDiscount > 0 ? (
                  <View style={styles.savePct}>
                    <Text variant="caption" weight="semibold" style={styles.savePctText}>
                      Save {bagDiscount}%
                    </Text>
                  </View>
                ) : null}
                {reservable ? (
                  <MiniStepper
                    value={bagQty}
                    min={0}
                    max={Math.max(0, listing.quantityAvailable)}
                    onChange={setBagQty}
                  />
                ) : null}
              </View>
            </View>
          </View>

          {/* Choose Your Items — 4 across */}
          {storeItems.length > 0 ? (
            <View
              style={styles.block}
              onLayout={(e) => {
                itemsY.current = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.chooseHead}>
                <View style={styles.flex}>
                  <Text variant="h3" style={styles.sectionTitle}>
                    Choose Your Items
                  </Text>
                  <Text variant="bodySm" tone="secondary">
                    Pick exactly what you want to rescue.
                  </Text>
                </View>
                <Pressable style={styles.howLink}>
                  <Feather name="info" size={14} color={INK} />
                  <Text variant="caption" weight="semibold" style={{ color: INK }}>
                    How it works
                  </Text>
                </Pressable>
              </View>

              <View style={styles.itemGrid}>
                {visibleItems.map((item) => (
                  <ItemCard
                    key={item.itemId}
                    item={item}
                    currency={listing.currency}
                    qty={items[item.itemId] ?? 0}
                    onChange={(q) => setItemQty(item.itemId, q)}
                  />
                ))}
              </View>

              {storeItems.length > 4 ? (
                <Pressable
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowAllItems((v) => !v);
                  }}
                  style={styles.moreBtn}
                >
                  <Text variant="label" style={{ color: INK }}>
                    {showAllItems ? "Show less" : `See ${storeItems.length - 4} more items`}
                  </Text>
                  <Feather
                    name={showAllItems ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={INK}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Info trio */}
          <View style={styles.infoRow}>
            <InfoCol icon="help-circle" title="What's inside?" sub="It's a surprise" />
            <InfoCol icon="tag" title="Great value" sub="Usually 1/3 of retail" />
            <InfoCol icon="sunrise" title="Always fresh" sub="Collected today" />
          </View>

          {/* Pick up */}
          <View style={styles.block}>
            <Text variant="h3" style={styles.sectionTitle}>
              Pick up here
            </Text>
            <Text variant="body" weight="semibold" style={{ color: INK }}>
              {listing.branchName}
            </Text>
            <Text variant="bodySm" tone="secondary">
              {listing.branchAddress}
            </Text>
            {listing.branchLatitude != null && listing.branchLongitude != null ? (
              <MapPreview
                height={150}
                pins={[
                  {
                    id: "branch",
                    latitude: listing.branchLatitude,
                    longitude: listing.branchLongitude,
                    active: true,
                  },
                ]}
              />
            ) : null}
            <Pressable
              style={styles.directionsBtn}
              onPress={() =>
                openDirections(
                  listing.branchLatitude,
                  listing.branchLongitude,
                  listing.branchAddress,
                )
              }
            >
              <Feather name="navigation" size={16} color={INK} />
              <Text variant="label" style={{ color: INK }}>
                Get directions
              </Text>
            </Pressable>
          </View>

          {/* Menu rows */}
          <View style={styles.menuBlock}>
            <MenuRow
              icon="clipboard"
              title="Collection instructions"
              open={openRow === "instructions"}
              onPress={() => toggleRow("instructions")}
            >
              <Text variant="bodySm" tone="secondary">
                {listing.pickupInstructions ??
                  "Show your reservation code at the counter when you arrive."}
              </Text>
            </MenuRow>
            <MenuRow
              icon="package"
              title="Packaging"
              open={openRow === "packaging"}
              onPress={() => toggleRow("packaging")}
            >
              <Text variant="bodySm" tone="secondary">
                Container: {listing.packaging?.containerProvided ? "Provided" : "Not included"}
                {"\n"}
                Carrier bag:{" "}
                {listing.packaging?.carrierBagProvided ? "Provided" : "Not included"}
                {listing.packaging?.note ? `\n${listing.packaging.note}` : ""}
              </Text>
            </MenuRow>
          </View>

          {/* Reviews */}
          <View style={styles.block}>
            <Text variant="h3" style={styles.sectionTitle}>
              What others say
            </Text>
            <View style={styles.ratingBlock}>
              <View style={styles.ratingLeft}>
                <Text variant="display" style={{ color: INK }}>
                  {listing.rating.toFixed(1)}
                </Text>
                <View style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Feather
                      key={i}
                      name="star"
                      size={14}
                      color={i < Math.round(listing.rating) ? colors.accent : colors.border}
                    />
                  ))}
                </View>
                <Text variant="caption" tone="secondary">
                  {listing.reviewCount} reviews
                </Text>
              </View>
              <View style={styles.bars}>
                {ratingBars.map((b) => (
                  <View key={b.star} style={styles.barRow}>
                    <Text variant="caption">{b.star}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.round(b.pct * 100)}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {reviews.slice(0, 2).map((r) => (
              <View key={r.reviewId} style={styles.reviewCard}>
                <View style={styles.reviewHead}>
                  <View style={styles.avatar}>
                    <Text variant="caption" weight="bold">
                      {r.customerName.slice(0, 1)}
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text variant="label">{r.customerName}</Text>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Feather
                          key={i}
                          name="star"
                          size={11}
                          color={i < r.rating ? colors.accent : colors.border}
                        />
                      ))}
                    </View>
                  </View>
                </View>
                {r.comment ? (
                  <Text variant="bodySm" tone="secondary">
                    {r.comment}
                  </Text>
                ) : null}
              </View>
            ))}
            {listing.reviewCount > 0 ? (
              <Pressable style={styles.seeAllReviews}>
                <Text variant="label" style={{ color: INK }}>
                  See all {listing.reviewCount} reviews
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Good to know */}
          <View style={styles.block}>
            <Text variant="h3" style={styles.sectionTitle}>
              Good to know
            </Text>
            {GOOD_TO_KNOW.map((line) => (
              <View key={line} style={styles.knowRow}>
                <Feather name="check" size={16} color={colors.primary} />
                <Text variant="bodySm" style={styles.flex}>
                  {line}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.menuBlock}>
            <MenuRow
              icon="alert-circle"
              title="Allergens"
              open={openRow === "allergens"}
              onPress={() => toggleRow("allergens")}
            >
              <View style={styles.allergenRow}>
                {(listing.allergens ?? ["May contain allergens — ask the store"]).map((a) => (
                  <View key={a} style={styles.allergenChip}>
                    <Text variant="caption">{a}</Text>
                  </View>
                ))}
              </View>
            </MenuRow>
          </View>

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      <View style={styles.sticky}>
        <View style={styles.stickyLeft}>
          <Text variant="label" tone="inverse">
            {totals && totals.count > 0
              ? `${totals.count} item${totals.count === 1 ? "" : "s"} selected`
              : "Nothing selected"}
          </Text>
          {savings > 0 && totals && totals.count > 0 ? (
            <Text variant="caption" style={styles.saveText}>
              You save {formatPrice(savings, listing.currency)}
            </Text>
          ) : null}
        </View>
        <Text variant="h3" tone="inverse">
          {formatPrice(totals?.subtotal ?? 0, listing.currency)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reserve"
          disabled={!reservable || !totals || totals.count < 1}
          onPress={goCheckout}
          style={({ pressed }) => [
            styles.reserveBtn,
            (!reservable || !totals || totals.count < 1) && styles.reserveOff,
            pressed && { opacity: 0.92 },
          ]}
        >
          <Text variant="label" style={styles.reserveText}>
            Reserve
          </Text>
          <Feather name="arrow-right" size={18} color={colors.brandInk} />
        </Pressable>
      </View>
    </Screen>
  );
}

function CircleBtn({
  icon,
  onPress,
  label,
  color = colors.black,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  label: string;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.85 }]}
    >
      <Feather name={icon} size={20} color={color} />
    </Pressable>
  );
}

function StatCol({
  icon,
  iconColor,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  label: string;
}) {
  return (
    <View style={styles.statCol}>
      <Feather name={icon} size={16} color={iconColor} />
      <Text variant="caption" center numberOfLines={2} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function InfoCol({
  icon,
  title,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.infoCol}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={18} color={INK} />
      </View>
      <Text variant="caption" weight="semibold" center style={{ color: INK }}>
        {title}
      </Text>
      <Text variant="caption" tone="secondary" center>
        {sub}
      </Text>
    </View>
  );
}

function MenuRow({
  icon,
  title,
  open,
  onPress,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  open: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.menuItem}>
      <Pressable onPress={onPress} style={styles.menuHead} accessibilityRole="button">
        <View style={styles.menuIcon}>
          <Feather name={icon} size={18} color={INK} />
        </View>
        <Text variant="label" style={[styles.flex, { color: INK }]}>
          {title}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-right"}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>
      {open ? <View style={styles.menuBody}>{children}</View> : null}
    </View>
  );
}

function MiniStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.step}>
      <Pressable
        onPress={() => value > min && onChange(value - 1)}
        disabled={value <= min}
        hitSlop={4}
        style={styles.stepHit}
      >
        <Feather name="minus" size={14} color={value <= min ? colors.disabled : INK} />
      </Pressable>
      <Text variant="label" style={styles.stepVal}>
        {value}
      </Text>
      <Pressable
        onPress={() => value < max && onChange(value + 1)}
        disabled={value >= max}
        hitSlop={4}
        style={styles.stepHit}
      >
        <Feather name="plus" size={14} color={value >= max ? colors.disabled : INK} />
      </Pressable>
    </View>
  );
}

function ItemCard({
  item,
  currency,
  qty,
  onChange,
}: {
  item: StoreItem;
  currency: "GEL" | "EUR" | "USD";
  qty: number;
  onChange: (q: number) => void;
}) {
  const badge = leftBadgeColors(item.quantityAvailable);
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemImg}>
        <Text style={styles.itemEmoji}>{item.emoji ?? "🥖"}</Text>
        <View style={[styles.leftBadge, { backgroundColor: badge.bg }]}>
          <Text variant="caption" weight="semibold" style={{ color: badge.fg, fontSize: 9 }}>
            {item.quantityAvailable} left
          </Text>
        </View>
      </View>
      <Text variant="caption" weight="bold" numberOfLines={2} style={{ color: INK }}>
        {item.name}
      </Text>
      {item.description ? (
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {item.description}
        </Text>
      ) : null}
      <View style={styles.itemPriceRow}>
        <Text variant="caption" weight="bold" style={{ color: INK }}>
          {formatPrice(item.price, currency)}
        </Text>
        {item.originalPrice && item.originalPrice > item.price ? (
          <Text variant="caption" tone="tertiary" style={styles.strike}>
            {formatPrice(item.originalPrice, currency)}
          </Text>
        ) : null}
      </View>
      <MiniStepper value={qty} min={0} max={item.quantityAvailable} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 0 },
  flex: { flex: 1 },

  heroWrap: {
    height: 300,
    backgroundColor: colors.disabledBg,
    position: "relative",
  },
  hero: { ...StyleSheet.absoluteFill },
  heroNav: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  heroNavRight: { flexDirection: "row", gap: spacing.sm },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  heroContent: {
    position: "absolute",
    left: H_PAD,
    right: 88,
    bottom: 36,
    gap: 6,
    zIndex: 1,
  },
  leftToday: {
    alignSelf: "flex-start",
    backgroundColor: "#D7F0C2",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  leftTodayText: { color: INK },
  heroTitle: { fontSize: 24, lineHeight: 28, fontWeight: "800" },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayBadge: {
    backgroundColor: INK,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  logo: {
    position: "absolute",
    right: H_PAD,
    bottom: -28,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.surface,
    zIndex: 3,
    ...shadow.card,
  },
  logoFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
  },

  sheet: {
    marginTop: -20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    minHeight: 400,
    zIndex: 1,
  },

  statsBar: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  statLabel: { color: colors.textSecondary, lineHeight: 14 },

  tabWrap: {
    flexDirection: "row",
    marginHorizontal: H_PAD,
    marginTop: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  tabSeg: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  tabSegOn: { backgroundColor: INK },
  newPill: {
    backgroundColor: "#D7F0C2",
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  newPillText: { color: INK, fontSize: 10 },

  promo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: H_PAD,
    marginTop: spacing.lg,
    backgroundColor: "#F2F2F2",
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  promoPlanet: { paddingRight: spacing.xs },

  block: {
    paddingHorizontal: H_PAD,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: { color: INK },
  sectionSub: { marginTop: -4, marginBottom: spacing.xs },

  bagCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
    alignItems: "stretch",
  },
  bagImg: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
    backgroundColor: colors.disabledBg,
  },
  bagMid: { flex: 1, gap: 4, justifyContent: "center" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  tag: {
    backgroundColor: "#E4F3EA",
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: INK },
  bagRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
    minWidth: 86,
  },
  strike: { textDecorationLine: "line-through" },
  savePct: {
    backgroundColor: "#D7F0C2",
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  savePctText: { color: INK },

  chooseHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  howLink: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  itemGrid: { flexDirection: "row", flexWrap: "wrap", gap: ITEM_GAP },
  itemCard: {
    width: ITEM_W,
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingBottom: 4,
  },
  itemImg: {
    width: "100%",
    height: ITEM_W,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemEmoji: { fontSize: 28 },
  leftBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    borderRadius: radii.pill,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  itemPriceRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, alignItems: "center" },
  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
  },

  infoRow: {
    flexDirection: "row",
    marginHorizontal: H_PAD,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  infoCol: { flex: 1, alignItems: "center", gap: 4 },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },

  menuBlock: {
    marginTop: spacing.lg,
    marginHorizontal: H_PAD,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuItem: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBody: { paddingBottom: spacing.lg, paddingLeft: 52 },

  ratingBlock: { flexDirection: "row", gap: spacing.lg, alignItems: "center" },
  ratingLeft: { alignItems: "center", gap: 4, minWidth: 72 },
  starsRow: { flexDirection: "row", gap: 2 },
  bars: { flex: 1, gap: 4 },
  barRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F2F2F2",
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: INK, borderRadius: 3 },
  reviewCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllReviews: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
  },

  knowRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  allergenRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  allergenChip: {
    backgroundColor: "#F2F2F2",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },

  step: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  stepHit: { padding: 4 },
  stepVal: { minWidth: 16, textAlign: "center", color: INK },

  sticky: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: INK,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  stickyLeft: { flex: 1, gap: 2 },
  saveText: { color: colors.brandLime },
  reserveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLime,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  reserveOff: { opacity: 0.45 },
  reserveText: { color: colors.brandInk },
});
