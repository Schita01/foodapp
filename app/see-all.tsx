import { FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Screen,
  ScreenHeader,
  PageLoader,
  EmptyState,
} from "@/components/ui";
import { ListingCard } from "@/components/cards/ListingCard";
import { useListings, useFavouriteIds, useToggleListingFavourite } from "@/hooks/useListings";
import { restaurantsApi } from "@/services/restaurants";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  filterDiscoverSection,
  type DiscoverSectionId,
} from "@/utils/discoverSections";
import { colors, spacing } from "@/theme";

const SECTION_IDS = new Set<DiscoverSectionId>([
  "top-picks",
  "save-late",
  "preferred",
  "meals",
  "collect-now",
  "collect-tomorrow",
  "collect-dinner",
  "bakery",
  "groceries",
  "popular-today",
  "flowers",
]);

export default function SeeAllScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string; section?: string; category?: string }>();
  const title = typeof params.title === "string" ? params.title : "Top picks near you";
  const section =
    typeof params.section === "string" && SECTION_IDS.has(params.section as DiscoverSectionId)
      ? (params.section as DiscoverSectionId)
      : "top-picks";
  const category = typeof params.category === "string" ? params.category : undefined;

  const listingsQuery = useListings({ showSoldOut: true });
  const favs = useFavouriteIds();
  const toggleFav = useToggleListingFavourite();
  const preferredWindows = useOnboardingStore((s) => s.preferredPickupWindows);
  const restaurants = useQuery({ queryKey: ["restaurants"], queryFn: () => restaurantsApi.list() });

  const logoByRestaurant = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of restaurants.data ?? []) {
      map.set(r.restaurantId, r.logoUrl);
    }
    return map;
  }, [restaurants.data]);

  const listings = useMemo(() => {
    let items = listingsQuery.data ?? [];
    if (category && category !== "all") {
      items = items.filter((l) => l.category === category);
    }
    return filterDiscoverSection(items, section, preferredWindows);
  }, [listingsQuery.data, category, section, preferredWindows]);

  const isFav = (id: string) => favs.data?.listings.includes(id) ?? false;

  if (listingsQuery.isLoading) {
    return (
      <Screen edges={["top"]} background={colors.background}>
        <ScreenHeader title={title} />
        <PageLoader />
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]} background={colors.background}>
      <ScreenHeader title={title} />
      {listings.length === 0 ? (
        <EmptyState icon="search" title="Nothing available right now" subtitle="Try again later." />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.listingId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              variant="browse"
              logoUrl={logoByRestaurant.get(item.restaurantId)}
              onPress={() => router.push(`/listings/${item.listingId}`)}
              favourite={isFav(item.listingId)}
              onToggleFavourite={() =>
                toggleFav.mutate({ id: item.listingId, favourite: isFav(item.listingId) })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
  sep: { height: spacing.lg },
});
