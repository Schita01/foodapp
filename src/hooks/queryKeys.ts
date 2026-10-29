import type { Filters } from "@/store/filterStore";

export const qk = {
  appStatus: ["appStatus"] as const,
  me: ["me"] as const,
  listings: (filters?: Partial<Filters>) => ["listings", filters ?? {}] as const,
  listingsAll: ["listings", "all"] as const,
  listing: (id: string) => ["listing", id] as const,
  restaurantListings: (id: string) => ["restaurantListings", id] as const,
  favouriteIds: ["favouriteIds"] as const,
  restaurant: (id: string) => ["restaurant", id] as const,
  restaurantReviews: (id: string) => ["restaurantReviews", id] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["order", id] as const,
  notifications: ["notifications"] as const,
  tickets: ["tickets"] as const,
  ticket: (id: string) => ["ticket", id] as const,
  refundByOrder: (id: string) => ["refund", id] as const,
};
