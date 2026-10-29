import { request } from "./apiClient";
import { localApi } from "./localApi";

export type LocationResult = {
  id: string;
  label: string;
  city: string;
  latitude: number;
  longitude: number;
  supported: boolean;
};

const SUPPORTED = new Set(["Tbilisi", "Batumi", "Kutaisi", "Rustavi"]);

export const locationsApi = {
  /** GET /locations/search */
  async search(query: string): Promise<LocationResult[]> {
    const qs = new URLSearchParams({ q: query });
    return request(`/locations/search?${qs}`, {}, () => localApi.locationSearch(query));
  },

  isSupported(city: string): boolean {
    return SUPPORTED.has(city);
  },
};
