import { create } from "zustand";
import { apiConfig } from "@/services/apiClient";
import { queryClient } from "@/providers/queryClient";

/**
 * Demo controls so reviewers can preview the shared loading / error / offline
 * states required by the spec without a real backend. Toggling updates the mock
 * apiClient flags and refetches active queries.
 */
type DevState = {
  offline: boolean;
  forceError: boolean;
  setOffline: (v: boolean) => void;
  setForceError: (v: boolean) => void;
};

export const useDevStore = create<DevState>((set) => ({
  offline: false,
  forceError: false,
  setOffline: (v) => {
    apiConfig.offline = v;
    set({ offline: v });
    queryClient.invalidateQueries();
  },
  setForceError: (v) => {
    apiConfig.failNextRequests = v;
    set({ forceError: v });
    queryClient.invalidateQueries();
  },
}));
