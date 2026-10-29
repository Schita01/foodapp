import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { Refund, UploadResponse } from "@/types";

export const refundsApi = {
  /** POST /api/customer/refunds */
  async create(input: {
    orderId: string;
    reason: string;
    explanation?: string;
    photo?: UploadResponse;
  }): Promise<Refund> {
    return request(`${CUSTOMER_API}/refunds`, { method: "POST", body: input }, () =>
      localApi.createRefund(input),
    );
  },

  /** GET /api/customer/refunds/by-order/:orderId */
  async getByOrder(orderId: string): Promise<Refund | null> {
    return request(`${CUSTOMER_API}/refunds/by-order/${orderId}`, {}, () =>
      localApi.refundByOrder(orderId),
    );
  },
};
