import { request } from "./apiClient";
import { localApi } from "./localApi";

export type AppStatus = {
  maintenanceMode: boolean;
  minSupportedVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  supportedCountries: string[];
};

export const appApi = {
  async status(): Promise<AppStatus> {
    return request("/app/status", {}, () => localApi.appStatus());
  },
};
