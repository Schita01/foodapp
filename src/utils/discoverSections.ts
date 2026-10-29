import type { Listing } from "@/types";
import { isToday, isTomorrow } from "@/utils/format";

const WINDOW_HOURS: Record<string, [number, number]> = {
  "Early morning": [6, 9],
  "Late morning": [9, 12],
  Midday: [12, 15],
  Afternoon: [15, 18],
  Evening: [18, 21],
  "Late night": [21, 24],
};

function pickupHour(iso: string): number {
  return new Date(iso).getHours() + new Date(iso).getMinutes() / 60;
}

function inWindow(iso: string, startH: number, endH: number): boolean {
  const h = pickupHour(iso);
  return h >= startH && h < endH;
}

function endsSoon(l: Listing, withinMs = 2 * 3600_000): boolean {
  const end = new Date(l.pickupEnd).getTime();
  const now = Date.now();
  return end > now && end - now <= withinMs;
}

function collectNow(l: Listing): boolean {
  const start = new Date(l.pickupStart).getTime();
  const end = new Date(l.pickupEnd).getTime();
  const now = Date.now();
  return start <= now + 90 * 60_000 && end > now;
}

function matchesPreferred(l: Listing, windows: string[]): boolean {
  const keys = windows.length > 0 ? windows : ["Evening", "Afternoon"];
  return keys.some((key) => {
    const range = WINDOW_HOURS[key];
    if (!range) return false;
    return inWindow(l.pickupStart, range[0], range[1]);
  });
}

export type DiscoverSectionId =
  | "top-picks"
  | "save-late"
  | "preferred"
  | "meals"
  | "collect-now"
  | "collect-tomorrow"
  | "collect-dinner"
  | "bakery"
  | "groceries"
  | "popular-today"
  | "flowers";

export function filterDiscoverSection(
  listings: Listing[],
  section: DiscoverSectionId,
  preferredWindows: string[] = [],
): Listing[] {
  switch (section) {
    case "top-picks":
      return [...listings].sort((a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm);
    case "save-late":
      return listings
        .filter((l) => l.status === "EXPIRING_SOON" || endsSoon(l))
        .sort((a, b) => new Date(a.pickupEnd).getTime() - new Date(b.pickupEnd).getTime());
    case "preferred":
      return listings
        .filter((l) => matchesPreferred(l, preferredWindows))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    case "meals":
      return listings.filter((l) => l.category === "meals").sort((a, b) => a.distanceKm - b.distanceKm);
    case "collect-now":
      return listings.filter(collectNow).sort((a, b) => new Date(a.pickupStart).getTime() - new Date(b.pickupStart).getTime());
    case "collect-tomorrow":
      return listings
        .filter((l) => isTomorrow(new Date(l.pickupStart)))
        .sort((a, b) => new Date(a.pickupStart).getTime() - new Date(b.pickupStart).getTime());
    case "collect-dinner":
      return listings
        .filter((l) => isToday(new Date(l.pickupStart)) && inWindow(l.pickupStart, 17, 21))
        .sort((a, b) => new Date(a.pickupStart).getTime() - new Date(b.pickupStart).getTime());
    case "bakery":
      return listings.filter((l) => l.category === "bakery").sort((a, b) => a.distanceKm - b.distanceKm);
    case "groceries":
      return listings.filter((l) => l.category === "groceries").sort((a, b) => a.distanceKm - b.distanceKm);
    case "popular-today":
      return [...listings]
        .filter((l) => l.reviewCount >= 50 || l.rating >= 4.5)
        .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
    case "flowers":
      return listings.filter((l) => l.category === "other").sort((a, b) => a.distanceKm - b.distanceKm);
    default:
      return listings;
  }
}
