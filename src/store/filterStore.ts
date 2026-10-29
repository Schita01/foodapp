import { create } from "zustand";
import type { ListingCategory } from "@/types";

export type SortOption = "recommended" | "distance" | "pickup_soon" | "price" | "rating";
export type PickupDay = "now" | "today" | "tomorrow" | "custom" | "any";

export type Filters = {
  categories: ListingCategory[];
  pickupDay: PickupDay;
  /** Collection-time window, hour of day 0–23. When from === to, no time constraint. */
  pickupFrom: number;
  pickupTo: number;
  diet: ("vegetarian" | "vegan")[];
  sort: SortOption;
  showSoldOut: boolean;
  onlyFavourites: boolean;
  highRatedOnly: boolean;
  endingSoon: boolean;
  localHeroes: boolean;
  specialRewards: boolean;
  hiddenGem: boolean;
  isNew: boolean;
  query: string;
};

export const defaultFilters: Filters = {
  categories: [],
  pickupDay: "any",
  pickupFrom: 0,
  pickupTo: 0,
  diet: [],
  sort: "recommended",
  showSoldOut: false,
  onlyFavourites: false,
  highRatedOnly: false,
  endingSoon: false,
  localHeroes: false,
  specialRewards: false,
  hiddenGem: false,
  isNew: false,
  query: "",
};

type FilterState = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  patch: (p: Partial<Filters>) => void;
  reset: () => void;
  activeCount: () => number;
};

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  patch: (p) => set({ filters: { ...get().filters, ...p } }),
  reset: () => set({ filters: defaultFilters }),
  activeCount: () => {
    const f = get().filters;
    let n = 0;
    n += f.categories.length;
    n += f.diet.length;
    if (f.pickupDay !== "any") n += 1;
    if ((f.pickupFrom ?? 0) !== (f.pickupTo ?? 0)) n += 1;
    if (f.sort !== "recommended") n += 1;
    if (f.showSoldOut) n += 1;
    if (f.onlyFavourites) n += 1;
    if (f.highRatedOnly) n += 1;
    if (f.endingSoon) n += 1;
    if (f.localHeroes) n += 1;
    if (f.specialRewards) n += 1;
    if (f.hiddenGem) n += 1;
    if (f.isNew) n += 1;
    return n;
  },
}));
