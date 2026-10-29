import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listingsApi } from "@/services/listings";
import { restaurantsApi } from "@/services/restaurants";
import type { Filters } from "@/store/filterStore";
import { qk } from "./queryKeys";

export function useListings(filters: Partial<Filters>) {
  return useQuery({ queryKey: qk.listings(filters), queryFn: () => listingsApi.list(filters) });
}

export function useAllListings() {
  return useQuery({ queryKey: qk.listingsAll, queryFn: () => listingsApi.listAll() });
}

export function useListing(id: string) {
  return useQuery({ queryKey: qk.listing(id), queryFn: () => listingsApi.get(id), enabled: !!id });
}

export function useRestaurantListings(id: string) {
  return useQuery({
    queryKey: qk.restaurantListings(id),
    queryFn: () => listingsApi.byRestaurant(id),
    enabled: !!id,
  });
}

export function useFavouriteIds() {
  return useQuery({ queryKey: qk.favouriteIds, queryFn: () => listingsApi.favouriteIds() });
}

export function useToggleListingFavourite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favourite }: { id: string; favourite: boolean }) =>
      favourite ? listingsApi.unfavourite(id) : listingsApi.favourite(id),
    onMutate: async ({ id, favourite }) => {
      await qc.cancelQueries({ queryKey: qk.favouriteIds });
      const prev = qc.getQueryData<{ listings: string[]; restaurants: string[] }>(qk.favouriteIds);
      if (prev) {
        const listings = favourite
          ? prev.listings.filter((x) => x !== id)
          : [...prev.listings, id];
        qc.setQueryData(qk.favouriteIds, { ...prev, listings });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.favouriteIds, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.favouriteIds }),
  });
}

export function useToggleRestaurantFavourite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favourite }: { id: string; favourite: boolean }) =>
      favourite ? restaurantsApi.unfavourite(id) : restaurantsApi.favourite(id),
    onMutate: async ({ id, favourite }) => {
      await qc.cancelQueries({ queryKey: qk.favouriteIds });
      const prev = qc.getQueryData<{ listings: string[]; restaurants: string[] }>(qk.favouriteIds);
      if (prev) {
        const restaurants = favourite
          ? prev.restaurants.filter((x) => x !== id)
          : [...prev.restaurants, id];
        qc.setQueryData(qk.favouriteIds, { ...prev, restaurants });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.favouriteIds, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.favouriteIds }),
  });
}
