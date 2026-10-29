import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { Screen, SearchBar, EmptyState, ErrorState, PageLoader, ScreenHeader } from "@/components/ui";
import { ListingCard } from "@/components/cards/ListingCard";
import {
  useAllListings,
  useFavouriteIds,
  useToggleListingFavourite,
} from "@/hooks/useListings";
import { filterListings } from "@/utils/filterListings";
import { defaultFilters } from "@/store/filterStore";

export default function SearchScreen() {
  const router = useRouter();
  const all = useAllListings();
  const favs = useFavouriteIds();
  const toggleFav = useToggleListingFavourite();
  const [query, setQuery] = useState("");

  const favSet = useMemo(() => new Set(favs.data?.listings ?? []), [favs.data]);
  const results = useMemo(() => {
    if (!all.data) return [];
    return filterListings(all.data, { ...defaultFilters, query }, favSet);
  }, [all.data, query, favSet]);

  if (all.isLoading) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Search" />
        <PageLoader />
      </Screen>
    );
  }

  if (all.isError) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Search" />
        <ErrorState onRetry={() => all.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Search" />
      <View style={styles.searchPad}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search surprise bags"
          autoFocus
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(l) => l.listingId}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ListingCard
              listing={item}
              variant="full"
              favourite={favSet.has(item.listingId)}
              onPress={() => router.push(`/listings/${item.listingId}`)}
              onToggleFavourite={() =>
                toggleFav.mutate({
                  id: item.listingId,
                  favourite: favSet.has(item.listingId),
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No matches"
            subtitle="Try another keyword or browse all bags."
            actionLabel="Browse"
            onAction={() => router.replace("/browse")}
          />
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  list: { paddingBottom: spacing.huge, gap: spacing.md },
  cardWrap: { paddingHorizontal: spacing.lg },
});
