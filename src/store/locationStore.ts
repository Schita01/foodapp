import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "./persist";

export type AppLocation = {
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  supported: boolean;
};

export type SavedPlace = {
  city: string;
  latitude: number;
  longitude: number;
};

export type LocationSlot = "current" | "home" | "work" | "other";

type LocationState = {
  location: AppLocation | null;
  selectedSlot: LocationSlot;
  home: SavedPlace | null;
  work: SavedPlace | null;
  other: SavedPlace | null;
  setLocation: (loc: AppLocation) => void;
  setRadius: (radiusKm: number) => void;
  setSavedPlace: (slot: Exclude<LocationSlot, "current">, place: SavedPlace) => void;
  selectSlot: (slot: LocationSlot) => void;
  clear: () => void;
};

const CURRENT_CITY = {
  city: "Tbilisi",
  latitude: 41.7151,
  longitude: 44.8271,
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      selectedSlot: "current",
      home: null,
      work: null,
      other: null,
      setLocation: (location) => set({ location }),
      setRadius: (radiusKm) => {
        const loc = get().location;
        if (loc) set({ location: { ...loc, radiusKm } });
      },
      setSavedPlace: (slot, place) => {
        const radiusKm = get().location?.radiusKm ?? 5;
        set({
          [slot]: place,
          selectedSlot: slot,
          location: { ...place, radiusKm, supported: true },
        });
      },
      selectSlot: (slot) => {
        const s = get();
        const radiusKm = s.location?.radiusKm ?? 5;
        if (slot === "current") {
          set({
            selectedSlot: "current",
            location: { ...CURRENT_CITY, radiusKm, supported: true },
          });
          return;
        }
        const saved = s[slot];
        if (saved) {
          set({
            selectedSlot: slot,
            location: { ...saved, radiusKm, supported: true },
          });
        }
      },
      clear: () => set({ location: null, selectedSlot: "current" }),
    }),
    { name: "rb-location", storage: zustandStorage },
  ),
);
