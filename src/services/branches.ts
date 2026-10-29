import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { Branch } from "@/types";

export const branchesApi = {
  /** GET /api/customer/branches/:branchId */
  async get(branchId: string): Promise<Branch> {
    return request(`${CUSTOMER_API}/branches/${branchId}`, {}, () => localApi.branch(branchId));
  },

  /** GET /api/customer/restaurants/:restaurantId/branches */
  async byRestaurant(restaurantId: string): Promise<Branch[]> {
    return request(`${CUSTOMER_API}/restaurants/${restaurantId}/branches`, {}, () =>
      localApi.branchesByRestaurant(restaurantId),
    );
  },
};
