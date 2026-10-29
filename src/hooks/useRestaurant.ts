import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { restaurantsApi } from "@/services/restaurants";
import { reviewsApi } from "@/services/reviews";
import { qk } from "./queryKeys";

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: qk.restaurant(id),
    queryFn: () => restaurantsApi.get(id),
    enabled: !!id,
  });
}

export function useRestaurantReviews(id: string) {
  return useQuery({
    queryKey: qk.restaurantReviews(id),
    queryFn: () => restaurantsApi.reviews(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: (review) => {
      qc.invalidateQueries({ queryKey: qk.restaurantReviews(review.restaurantId) });
      qc.invalidateQueries({ queryKey: qk.orders });
      if (review.orderId) qc.invalidateQueries({ queryKey: qk.order(review.orderId) });
    },
  });
}
