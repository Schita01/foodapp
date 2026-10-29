import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { AppLocation } from "@/store/locationStore";
import type { User } from "@/types";

export const meApi = {
  /** GET /api/customer/me */
  async get(): Promise<User> {
    return request(`${CUSTOMER_API}/me`, {}, () => localApi.me());
  },

  /** PATCH /api/customer/me */
  async update(patch: Partial<User>): Promise<User> {
    return request(`${CUSTOMER_API}/me`, { method: "PATCH", body: patch }, () =>
      localApi.updateMe(patch),
    );
  },

  /** DELETE /api/customer/me */
  async remove(): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/me`, { method: "DELETE" }, () => localApi.removeMe());
  },

  /** PATCH /api/customer/me/location */
  async updateLocation(_loc: AppLocation): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/me/location`, { method: "PATCH", body: {} }, () =>
      localApi.updateLocation(),
    );
  },
};
