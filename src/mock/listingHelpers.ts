import type { Listing } from "@/types";
import { getBranch } from "./branches";

export const TZ = "Asia/Tbilisi";

type ListingCore = Omit<
  Listing,
  | "restaurantId"
  | "branchId"
  | "restaurantName"
  | "branchName"
  | "branchAddress"
  | "branchLatitude"
  | "branchLongitude"
  | "timezone"
  | "distanceKm"
>;

export function withBranch(
  branchId: string,
  restaurantName: string,
  partial: ListingCore,
): Listing {
  const b = getBranch(branchId)!;
  return {
    ...partial,
    restaurantId: b.restaurantId,
    branchId,
    restaurantName,
    branchName: b.name,
    branchAddress: b.address,
    branchLatitude: b.latitude,
    branchLongitude: b.longitude,
    distanceKm: b.distanceKm ?? 0,
    timezone: TZ,
    latitude: b.latitude,
    longitude: b.longitude,
  };
}
