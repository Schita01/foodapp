import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { colors, radii, shadow, spacing } from "@/theme";
import {
  Screen,
  Text,
  SearchBar,
  EmptyState,
  ErrorState,
  PageLoader,
} from "@/components/ui";
import { ListingCard } from "@/components/cards/ListingCard";
import { LocationSheet } from "@/components/LocationSheet";
import { MapPreview } from "@/components/MapPreview";
import {
  AllFiltersScreen,
  CategoryFilterSheet,
  CollectionTimeSheet,
  DietFilterSheet,
  SortFilterSheet,
} from "@/components/browse/FilterSheets";
import { useSnapSheet, SHEET_PEEK, type SheetSnap } from "@/components/browse/SnapBottomSheet";
import {
  useAllListings,
  useFavouriteIds,
  useToggleListingFavourite,
} from "@/hooks/useListings";
import { restaurantsApi } from "@/services/restaurants";
import { useFilterStore } from "@/store/filterStore";
import { filterListings } from "@/utils/filterListings";

type FilterPanel = "all" | "category" | "time" | "diet" | "sort" | null;

export default function BrowseScreen() {
  const router = useRouter();
  const all = useAllListings();
  const favs = useFavouriteIds();
  const toggleFav = useToggleListingFavourite();
  const { filters, patch, setFilters } = useFilterStore();
  const restaurants = useQuery({ queryKey: ["restaurants"], queryFn: () => restaurantsApi.list() });
  const [panel, setPanel] = useState<FilterPanel>(null);
  const [locationSheet, setLocationSheet] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [snap, setSnap] = useState<SheetSnap>("collapsed");
  const [controlsH, setControlsH] = useState(118);
  const [mapH, setMapH] = useState(0);

  const { pan, sheetStyle, compassStyle, mapFabStyle, snapTo, sheetHeight } = useSnapSheet(
    mapH,
    controlsH,
    setSnap,
  );

  const logoByRestaurant = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of restaurants.data ?? []) map.set(r.restaurantId, r.logoUrl);
    return map;
  }, [restaurants.data]);

  const favSet = useMemo(() => new Set(favs.data?.listings ?? []), [favs.data]);
  const results = useMemo(
    () => (all.data ? filterListings(all.data, filters, favSet) : []),
    [all.data, filters, favSet],
  );

  const isFav = (id: string) => favSet.has(id);
  const onFav = (id: string) => toggleFav.mutate({ id, favourite: isFav(id) });
  const countLabel = `${results.length} Surprise Bag${results.length === 1 ? "" : "s"}`;
  const isFull = snap === "full";

  const controls = (
    <View
      style={styles.controls}
      onLayout={(e) => setControlsH(Math.round(e.nativeEvent.layout.height + spacing.sm))}
    >
      <View style={styles.searchRow}>
        <View style={styles.flex}>
          <SearchBar
            value={filters.query}
            onChangeText={(t) => patch({ query: t })}
            placeholder="Search"
            variant="filled"
          />
        </View>
        <Pressable
          style={styles.circleBtn}
          onPress={() => setLocationSheet(true)}
          accessibilityLabel="Change location"
        >
          <Feather name="map-pin" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={styles.iconPill}
          onPress={() => setPanel("all")}
          accessibilityLabel="All filters"
        >
          <Feather name="sliders" size={18} color={colors.textPrimary} />
        </Pressable>
        <DropdownPill
          label="Category"
          active={filters.categories.length > 0}
          onPress={() => setPanel("category")}
        />
        <DropdownPill
          label="Collection time"
          active={filters.pickupDay !== "any" || filters.pickupFrom !== filters.pickupTo}
          onPress={() => setPanel("time")}
        />
        <DropdownPill label="Diet" active={filters.diet.length > 0} onPress={() => setPanel("diet")} />
        <DropdownPill
          label="Sort"
          active={filters.sort !== "recommended"}
          onPress={() => setPanel("sort")}
        />
      </ScrollView>
    </View>
  );

  const renderCard = (item: (typeof results)[number]) => (
    <ListingCard
      listing={item}
      variant="browse"
      logoUrl={logoByRestaurant.get(item.restaurantId)}
      onPress={() => router.push(`/listings/${item.listingId}`)}
      favourite={isFav(item.listingId)}
      onToggleFavourite={() => onFav(item.listingId)}
    />
  );

  const overlays = (
    <>
      <AllFiltersScreen
        visible={panel === "all"}
        onClose={() => setPanel(null)}
        filters={filters}
        onApply={setFilters}
      />
      <CategoryFilterSheet
        visible={panel === "category"}
        onClose={() => setPanel(null)}
        filters={filters}
        onApply={setFilters}
      />
      <CollectionTimeSheet
        visible={panel === "time"}
        onClose={() => setPanel(null)}
        filters={filters}
        onApply={setFilters}
      />
      <DietFilterSheet
        visible={panel === "diet"}
        onClose={() => setPanel(null)}
        filters={filters}
        onApply={setFilters}
      />
      <SortFilterSheet
        visible={panel === "sort"}
        onClose={() => setPanel(null)}
        filters={filters}
        onApply={setFilters}
      />
      <LocationSheet visible={locationSheet} onClose={() => setLocationSheet(false)} />
    </>
  );

  if (all.isLoading) {
    return (
      <Screen edges={["top"]} background={colors.surface}>
        <View style={styles.controlsPad}>{controls}</View>
        <PageLoader />
        {overlays}
      </Screen>
    );
  }
  if (all.isError) {
    return (
      <Screen edges={["top"]} background={colors.surface}>
        <View style={styles.controlsPad}>{controls}</View>
        <ErrorState onRetry={() => all.refetch()} />
        {overlays}
      </Screen>
    );
  }

  const selected = results.find((l) => l.listingId === selectedPin) ?? results[0];

  return (
    <Screen edges={["top"]} padded={false} background={colors.surface}>
      <View
        style={styles.mapFill}
        onLayout={(e) => setMapH(Math.round(e.nativeEvent.layout.height))}
      >
        <MapPreview
          fill
          style={styles.fullMap}
          pins={results.map((l) => ({
            id: l.listingId,
            latitude: l.latitude ?? l.branchLatitude ?? 41.71,
            longitude: l.longitude ?? l.branchLongitude ?? 44.8,
            label: l.restaurantName,
            logoUrl: logoByRestaurant.get(l.restaurantId),
            active: selected?.listingId === l.listingId,
          }))}
          onPressPin={setSelectedPin}
        />

        <View style={styles.mapControls} pointerEvents="box-none">
          {controls}
        </View>

        <Animated.View style={[styles.compassFab, compassStyle]} pointerEvents={isFull ? "none" : "auto"}>
          <Pressable
            onPress={() => setSelectedPin(results[0]?.listingId ?? null)}
            accessibilityLabel="Recenter map"
            style={styles.compassInner}
          >
            <Feather name="navigation" size={20} color={colors.primaryDark} />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.sheet, { height: sheetHeight }, sheetStyle]}>
          {isFull ? (
            <>
              <GestureDetector gesture={pan}>
                <View style={styles.handleHit}>
                  <View style={styles.handle} />
                  <Text variant="h2" center style={styles.sheetTitle}>
                    {countLabel}
                  </Text>
                </View>
              </GestureDetector>
              <FlatList
                data={results}
                keyExtractor={(l) => l.listingId}
                renderItem={({ item }) => <View style={styles.cardWrap}>{renderCard(item)}</View>}
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled
                style={styles.sheetList}
                ListEmptyComponent={
                  <EmptyState
                    icon="search"
                    title="No surprise bags match your filters"
                    subtitle="Try clearing filters or widening your area."
                    actionLabel="Clear filters"
                    onAction={() =>
                      setFilters({ ...filters, categories: [], diet: [], pickupDay: "any", query: "" })
                    }
                  />
                }
              />
            </>
          ) : (
            <GestureDetector gesture={pan}>
              <View style={styles.sheetInner}>
                <View style={styles.handleHit}>
                  <View style={styles.handle} />
                  <Text variant="h2" center style={styles.sheetTitle}>
                    {countLabel}
                  </Text>
                </View>
                <FlatList
                  data={results}
                  keyExtractor={(l) => l.listingId}
                  renderItem={({ item }) => <View style={styles.cardWrap}>{renderCard(item)}</View>}
                  contentContainerStyle={styles.sheetContent}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  style={styles.sheetList}
                />
              </View>
            </GestureDetector>
          )}
        </Animated.View>

        <Animated.View
          style={[styles.fabWrap, mapFabStyle]}
          pointerEvents={isFull ? "box-none" : "none"}
        >
          <Pressable
            style={styles.mapFab}
            onPress={() => snapTo("mid")}
            accessibilityLabel="Show map"
          >
            <Feather name="map" size={16} color={colors.white} />
            <Text variant="label" tone="inverse">
              Map
            </Text>
          </Pressable>
        </Animated.View>
      </View>
      {overlays}
    </Screen>
  );
}

function DropdownPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.dropdownPill, active && styles.dropdownPillActive]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text
        variant="bodySm"
        weight="semibold"
        style={{ color: active ? colors.primaryDark : colors.textPrimary }}
      >
        {label}
      </Text>
      <Feather name="chevron-down" size={16} color={active ? colors.primaryDark : colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controlsPad: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  controls: { gap: spacing.sm, paddingTop: spacing.sm },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  flex: { flex: 1 },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pills: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  iconPill: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 42,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownPillActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cardWrap: { paddingHorizontal: spacing.lg },
  mapFill: { flex: 1, position: "relative" },
  fullMap: { flex: 1, borderRadius: 0 },
  mapControls: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 4 },
  compassFab: {
    position: "absolute",
    right: spacing.lg,
    zIndex: 3,
  },
  compassInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.surface,
    ...shadow.sheet,
    overflow: "hidden",
    zIndex: 2,
  },
  handleHit: {
    paddingTop: 6,
    paddingBottom: 4,
    minHeight: SHEET_PEEK,
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: "#C8C8C8",
    marginTop: 8,
    marginBottom: 10,
  },
  sheetTitle: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  sheetList: { flex: 1 },
  sheetInner: { flex: 1 },
  sheetContent: { paddingTop: spacing.xs, paddingBottom: 96, gap: spacing.md },
  fabWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.lg,
    alignItems: "center",
    zIndex: 5,
  },
  mapFab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryDark,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadow.card,
  },
});
