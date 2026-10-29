import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors, spacing } from "@/theme";
import {
  Screen,
  SectionHeader,
  PageLoader,
  ErrorState,
  EmptyState,
  FilterChip,
} from "@/components/ui";
import { LocationPill } from "@/components/shell/LocationPill";
import { ListingCard } from "@/components/cards/ListingCard";
import { useAllListings, useFavouriteIds, useToggleListingFavourite } from "@/hooks/useListings";
import { restaurantsApi } from "@/services/restaurants";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  filterDiscoverSection,
  type DiscoverSectionId,
} from "@/utils/discoverSections";
import type { Listing, ListingCategory } from "@/types";

type CategoryFilter = "all" | ListingCategory;

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "meals", label: "Meals" },
  { id: "bakery", label: "Bread & pastries" },
  { id: "groceries", label: "Groceries" },
];

const SECTIONS: { id: DiscoverSectionId; title: string }[] = [
  { id: "top-picks", title: "Top picks near you" },
  { id: "save-late", title: "Save before it's too late" },
  { id: "preferred", title: "Preferred collection times" },
  { id: "meals", title: "Meals" },
  { id: "collect-now", title: "Collect now" },
  { id: "collect-tomorrow", title: "Collect tomorrow" },
  { id: "collect-dinner", title: "Collect for dinner" },
  { id: "bakery", title: "Baked goods" },
  { id: "groceries", title: "Groceries" },
  { id: "popular-today", title: "These were popular today" },
  { id: "flowers", title: "Flowers & Plants" },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const listingsQuery = useAllListings();
  const favs = useFavouriteIds();
  const toggleFav = useToggleListingFavourite();
  const restaurants = useQuery({ queryKey: ["restaurants"], queryFn: () => restaurantsApi.list() });
  const preferredWindows = useOnboardingStore((s) => s.preferredPickupWindows);
  const [category, setCategory] = useState<CategoryFilter>("all");

  const logoByRestaurant = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of restaurants.data ?? []) {
      map.set(r.restaurantId, r.logoUrl);
    }
    return map;
  }, [restaurants.data]);

  const reservable = useMemo(
    () => (listingsQuery.data ?? []).filter((l) => l.status === "ACTIVE" || l.status === "EXPIRING_SOON"),
    [listingsQuery.data],
  );

  const filtered = useMemo(() => {
    if (category === "all") return reservable;
    return reservable.filter((l) => l.category === category);
  }, [reservable, category]);

  const sections = useMemo(
    () =>
      SECTIONS.map((s) => ({
        ...s,
        listings: filterDiscoverSection(filtered, s.id, preferredWindows),
      })).filter((s) => s.listings.length > 0),
    [filtered, preferredWindows],
  );

  const openListing = (id: string) => router.push(`/listings/${id}`);
  const isFav = (id: string) => favs.data?.listings.includes(id) ?? false;

  const seeAll = (title: string, section: DiscoverSectionId) => {
    const qs = new URLSearchParams({ title, section });
    if (category !== "all") qs.set("category", category);
    router.push(`/see-all?${qs.toString()}`);
  };

  if (listingsQuery.isLoading) {
    return (
      <Screen edges={["top"]} background={colors.surface}>
        <View style={styles.headerPad}>
          <LocationPill variant="address" />
        </View>
        <PageLoader />
      </Screen>
    );
  }

  if (listingsQuery.isError) {
    return (
      <Screen edges={["top"]} background={colors.surface}>
        <View style={styles.headerPad}>
          <LocationPill variant="address" />
        </View>
        <ErrorState onRetry={() => listingsQuery.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]} background={colors.surface}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.headerPad}>
          <LocationPill variant="address" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              selected={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="Nothing available right now"
            subtitle="Try another category or a wider radius."
            actionLabel="Change location"
            onAction={() => router.push("/location")}
          />
        ) : (
          sections.map((s) => (
            <Row
              key={s.id}
              title={s.title}
              listings={s.listings}
              logos={logoByRestaurant}
              onSeeAll={() => seeAll(s.title, s.id)}
              onOpen={openListing}
              isFav={isFav}
              onFav={(id) => toggleFav.mutate({ id, favourite: isFav(id) })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function Row({
  title,
  listings,
  logos,
  onSeeAll,
  onOpen,
  isFav,
  onFav,
}: {
  title: string;
  listings: Listing[];
  logos: Map<string, string>;
  onSeeAll: () => void;
  onOpen: (id: string) => void;
  isFav: (id: string) => boolean;
  onFav: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} onSeeAll={onSeeAll} style={styles.sectionHeader} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {listings.map((l) => (
          <ListingCard
            key={l.listingId}
            listing={l}
            variant="discover"
            width={280}
            logoUrl={logos.get(l.restaurantId)}
            onPress={() => onOpen(l.listingId)}
            favourite={isFav(l.listingId)}
            onToggleFavourite={() => onFav(l.listingId)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl },
  headerPad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  section: { marginBottom: spacing.md },
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingTop: 0,
  },
  row: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingRight: spacing.xl },
});
