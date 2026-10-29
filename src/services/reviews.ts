import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { Review, UploadResponse } from "@/types";

export const reviewsApi = {
  /** POST /api/customer/reviews */
  async create(input: {
    orderId: string;
    rating: number;
    qualityRating?: number;
    quantityRating?: number;
    pickupRating?: number;
    tags: string[];
    comment?: string;
    photo?: UploadResponse;
  }): Promise<Review> {
    return request(`${CUSTOMER_API}/reviews`, { method: "POST", body: input }, () =>
      localApi.createReview(input),
    );
  },

  /** GET /api/customer/restaurants/:restaurantId/reviews */
  async byRestaurant(restaurantId: string): Promise<Review[]> {
    return request(`${CUSTOMER_API}/restaurants/${restaurantId}/reviews`, {}, () =>
      localApi.restaurantReviews(restaurantId),
    );
  },

  /** POST /api/customer/reviews/:id/report */
  async report(reviewId: string): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/reviews/${reviewId}/report`, { method: "POST" }, () =>
      localApi.ok(),
    );
  },

  /** POST /api/customer/photos/:id/report */
  async reportPhoto(uploadId: string): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/photos/${uploadId}/report`, { method: "POST" }, () =>
      localApi.ok(),
    );
  },
};
