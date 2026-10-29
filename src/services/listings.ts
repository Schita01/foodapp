import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { Filters } from "@/store/filterStore";
import type { Listing } from "@/types";

export const listingsApi = {
  /** GET /api/customer/listings */
  async list(filters: Partial<Filters> = {}): Promise<Listing[]> {
    const qs = new URLSearchParams({ filters: JSON.stringify(filters) });
    return request(`${CUSTOMER_API}/listings?${qs}`, {}, () => localApi.listings(filters));
  },

  /** All customer-visible listings (for discover sections). */
  async listAll(): Promise<Listing[]> {
    return request(`${CUSTOMER_API}/listings/all`, {}, () => localApi.listingsAll());
  },

  /** GET /api/customer/listings/:listingId */
  async get(listingId: string): Promise<Listing> {
    return request(`${CUSTOMER_API}/listings/${listingId}`, {}, () => localApi.listing(listingId));
  },

  /** GET /api/customer/restaurants/:restaurantId/listings */
  async byRestaurant(restaurantId: string): Promise<Listing[]> {
    return request(`${CUSTOMER_API}/restaurants/${restaurantId}/listings`, {}, () =>
      localApi.listingsByRestaurant(restaurantId),
    );
  },

  /** POST /api/customer/listings/:listingId/favourite */
  async favourite(listingId: string): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/listings/${listingId}/favourite`, { method: "POST" }, () =>
      localApi.favouriteListing(listingId),
    );
  },

  /** DELETE /api/customer/listings/:listingId/favourite */
  async unfavourite(listingId: string): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/listings/${listingId}/favourite`, { method: "DELETE" }, () =>
      localApi.unfavouriteListing(listingId),
    );
  },

  async favouriteIds(): Promise<{ listings: string[]; restaurants: string[] }> {
    return request(`${CUSTOMER_API}/listings/favourites`, {}, () => localApi.favouriteIds());
  },
};
