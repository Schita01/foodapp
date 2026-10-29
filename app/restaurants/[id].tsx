import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { spacing, colors } from "@/theme";
import { Screen, Text, ScreenHeader, ErrorState, RatingStars } from "@/components/ui";
import { ListingCard } from "@/components/cards/ListingCard";
import { restaurantsApi } from "@/services/restaurants";
import { useRestaurantListings, useFavouriteIds, useToggleListingFavourite } from "@/hooks/useListings";

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = id ?? "";
  const router = useRouter();
  const restaurant = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurantsApi.get(restaurantId),
    enabled: !!restaurantId,
  });
  const listings = useRestaurantListings(restaurantId);
  const favs = useFavouriteIds();
  const toggleFav = useToggleListingFavourite();
  const favSet = new Set(favs.data?.listings ?? []);

  if (restaurant.isLoading || listings.isLoading) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Store" />
        <Text variant="body" tone="secondary" style={styles.pad}>
          Loading…
        </Text>
      </Screen>
    );
  }

  if (restaurant.isError || !restaurant.data) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Store" />
        <ErrorState onRetry={() => restaurant.refetch()} />
      </Screen>
    );
  }

  const r = restaurant.data;

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title={r.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: r.imageUrl }} style={styles.hero} contentFit="cover" />
        <View style={styles.body}>
          <View style={styles.row}>
            <Image source={{ uri: r.logoUrl }} style={styles.logo} contentFit="cover" />
            <View style={styles.flex}>
              <Text variant="h2">{r.name}</Text>
              <RatingStars rating={r.rating} size={16} />
              <Text variant="bodySm" tone="secondary">
                {r.reviewCount} reviews
              </Text>
            </View>
          </View>
          {r.description ? (
            <Text variant="body" tone="secondary">
              {r.description}
            </Text>
          ) : null}
          <Text variant="h3" style={styles.sectionTitle}>
            Available bags
          </Text>
        </View>
        <FlatList
          data={listings.data ?? []}
          keyExtractor={(l) => l.listingId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <ListingCard
                listing={item}
                variant="full"
                logoUrl={r.logoUrl}
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
            <Text variant="body" tone="secondary" style={styles.pad}>
              No surprise bags from this store right now.
            </Text>
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg },
  hero: { width: "100%", height: 200, backgroundColor: colors.disabledBg },
  body: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  logo: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.disabledBg },
  flex: { flex: 1, gap: 4 },
  sectionTitle: { marginTop: spacing.md },
  cardWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});
