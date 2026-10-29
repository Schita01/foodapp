import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { Restaurant, Review } from "@/types";

export const restaurantsApi = {
  /** GET /api/customer/restaurants/:restaurantId */
  async get(restaurantId: string): Promise<Restaurant> {
    return request(`${CUSTOMER_API}/restaurants/${restaurantId}`, {}, () =>
      localApi.restaurant(restaurantId),
    );
  },

  /** GET /api/customer/restaurants/:restaurantId/reviews */
  async reviews(restaurantId: string): Promise<Review[]> {
    return request(`${CUSTOMER_API}/restaurants/${restaurantId}/reviews`, {}, () =>
      localApi.restaurantReviews(restaurantId),
    );
  },

  async favourite(restaurantId: string): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/restaurants/${restaurantId}/favourite`, { method: "POST" }, () =>
      localApi.favouriteRestaurant(restaurantId),
    );
  },

  async unfavourite(restaurantId: string): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/restaurants/${restaurantId}/favourite`, { method: "DELETE" }, () =>
      localApi.unfavouriteRestaurant(restaurantId),
    );
  },

  async list(): Promise<Restaurant[]> {
    return request(`${CUSTOMER_API}/restaurants`, {}, () => localApi.restaurants());
  },
};
