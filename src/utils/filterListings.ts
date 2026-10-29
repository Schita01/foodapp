import type { Filters } from "@/store/filterStore";
import type { Branch, Listing } from "@/types";
import { branchVisibilityMap } from "./filterBranches";
import { isToday, isTomorrow } from "./format";

function isReservable(l: Listing): boolean {
  return l.status === "ACTIVE" || l.status === "EXPIRING_SOON";
}

/**
 * Pure listing filter + sort. Shared by the mock listings service and the UI
 * (filter sheet result counts, live browse filtering).
 */
export function filterListings(
  listings: Listing[],
  filters: Partial<Filters>,
  favouriteIds: Set<string> = new Set(),
  visibleBranchIds?: Set<string>,
): Listing[] {
  let result = listings.filter((l) => {
    if (visibleBranchIds && !visibleBranchIds.has(l.branchId)) return false;
    if (filters.showSoldOut) {
      return isReservable(l) || l.status === "SOLD_OUT";
    }
    return isReservable(l);
  });

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.restaurantName.toLowerCase().includes(q) ||
        l.branchName.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q),
    );
  }
  if (filters.categories?.length) {
    result = result.filter((l) => filters.categories!.includes(l.category));
  }
  if (filters.diet?.length) {
    result = result.filter(
      (l) =>
        (filters.diet!.includes("vegan") && l.isVegan) ||
        (filters.diet!.includes("vegetarian") && l.isVegetarian),
    );
  }
  if (filters.highRatedOnly || filters.localHeroes) result = result.filter((l) => l.rating >= 4.5);
  if (filters.endingSoon) result = result.filter((l) => l.status === "EXPIRING_SOON");
  if (filters.onlyFavourites) result = result.filter((l) => favouriteIds.has(l.listingId));
  if (filters.specialRewards) {
    result = result.filter((l) => l.originalValue > 0 && l.price / l.originalValue <= 0.5);
  }
  if (filters.hiddenGem) result = result.filter((l) => l.reviewCount < 120 && l.rating >= 4);
  if (filters.isNew) result = result.filter((l) => l.reviewCount < 80);
  if (filters.pickupDay && filters.pickupDay !== "any") {
    result = result.filter((l) => {
      const start = new Date(l.pickupStart);
      if (filters.pickupDay === "now") return start.getTime() <= Date.now() + 3600_000;
      if (filters.pickupDay === "today") return isToday(start);
      if (filters.pickupDay === "tomorrow") return isTomorrow(start);
      return true;
    });
  }
  const from = filters.pickupFrom ?? 0;
  const to = filters.pickupTo ?? 0;
  if (from !== to) {
    result = result.filter((l) => {
      const h = new Date(l.pickupStart).getHours();
      return from < to ? h >= from && h < to : h >= from || h < to;
    });
  }

  switch (filters.sort) {
    case "distance":
      result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case "pickup_soon":
      result = [...result].sort(
        (a, b) => new Date(a.pickupStart).getTime() - new Date(b.pickupStart).getTime(),
      );
      break;
    case "price":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "rating":
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
    default:
      result = [...result].sort((a, b) => {
        const ae = a.status === "EXPIRING_SOON" ? 0 : 1;
        const be = b.status === "EXPIRING_SOON" ? 0 : 1;
        if (ae !== be) return ae - be;
        return b.rating - a.rating;
      });
  }
  return result;
}

/** Filter listings to approved active branches only. */
export function filterListingsForCustomer(
  listings: Listing[],
  branches: Branch[],
  filters: Partial<Filters>,
  favouriteIds: Set<string> = new Set(),
): Listing[] {
  const visible = branchVisibilityMap(branches);
  return filterListings(listings, filters, favouriteIds, new Set(visible.keys()));
}
