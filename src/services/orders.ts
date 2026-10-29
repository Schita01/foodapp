import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { Order } from "@/types";

export const ordersApi = {
  /** POST /api/customer/orders */
  async create(input: {
    listingId: string;
    quantity: number;
    customItems?: { itemId: string; name: string; price: number; quantity: number }[];
    paymentMethodLabel: string;
  }): Promise<Order> {
    return request(`${CUSTOMER_API}/orders`, { method: "POST", body: input }, () =>
      localApi.createOrder(input),
    );
  },

  /** GET /api/customer/orders */
  async list(): Promise<Order[]> {
    return request(`${CUSTOMER_API}/orders`, {}, () => localApi.orders());
  },

  /** GET /api/customer/orders/:orderId */
  async get(orderId: string): Promise<Order> {
    return request(`${CUSTOMER_API}/orders/${orderId}`, {}, () => localApi.order(orderId));
  },

  /** POST /api/customer/orders/:orderId/cancel */
  async cancel(orderId: string): Promise<Order> {
    return request(`${CUSTOMER_API}/orders/${orderId}/cancel`, { method: "POST" }, () =>
      localApi.cancelOrder(orderId),
    );
  },

  /** GET /api/customer/orders/:orderId/pickup-code */
  async pickupCode(orderId: string): Promise<{
    pickupCode: string;
    pickupQrValue: string;
    branchId: string;
    branchName: string;
  }> {
    return request(`${CUSTOMER_API}/orders/${orderId}/pickup-code`, {}, () =>
      localApi.pickupCode(orderId),
    );
  },

  /** Mock of the Restaurant Panel scanner confirming the handoff. */
  async confirmPickup(orderId: string, scannedBranchId?: string): Promise<Order> {
    return request(
      `${CUSTOMER_API}/orders/${orderId}/confirm-pickup`,
      { method: "POST", body: scannedBranchId ? { scannedBranchId } : {} },
      () => localApi.confirmPickup(orderId, scannedBranchId),
    );
  },
};
