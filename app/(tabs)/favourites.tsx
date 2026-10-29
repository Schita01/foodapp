import { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { Screen, Text, EmptyState, ErrorState, PageLoader } from "@/components/ui";
import { ListingCard } from "@/components/cards/ListingCard";
import { useAllListings, useFavouriteIds, useToggleListingFavourite } from "@/hooks/useListings";

export default function FavouritesScreen() {
  const router = useRouter();
  const listings = useAllListings();
  const favs = useFavouriteIds();
  const toggleFav = useToggleListingFavourite();

  const favSet = useMemo(() => new Set(favs.data?.listings ?? []), [favs.data]);
  const favouriteListings = useMemo(
    () => (listings.data ?? []).filter((l) => favSet.has(l.listingId)),
    [listings.data, favSet],
  );

  if (listings.isLoading || favs.isLoading) {
    return (
      <Screen edges={["top"]}>
        <Text variant="h2" style={styles.title}>
          Favourites
        </Text>
        <PageLoader label="Loading favourites…" />
      </Screen>
    );
  }

  if (listings.isError) {
    return (
      <Screen edges={["top"]}>
        <Text variant="h2" style={styles.title}>
          Favourites
        </Text>
        <ErrorState onRetry={() => listings.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <FlatList
        data={favouriteListings}
        keyExtractor={(l) => l.listingId}
        ListHeaderComponent={
          <Text variant="h2" style={styles.title}>
            Favourites
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ListingCard
              listing={item}
              variant="full"
              favourite
              onPress={() => router.push(`/listings/${item.listingId}`)}
              onToggleFavourite={() => toggleFav.mutate({ id: item.listingId, favourite: true })}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="No favourites yet"
            subtitle="Tap the heart on a surprise bag to save it here."
            actionLabel="Browse bags"
            onAction={() => router.push("/browse")}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingBottom: spacing.huge, gap: spacing.md },
  cardWrap: { paddingHorizontal: spacing.lg },
});
