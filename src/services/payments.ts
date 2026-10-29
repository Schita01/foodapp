import { request } from "./apiClient";
import { localApi } from "./localApi";
import type { PaymentCard } from "@/types";

export type PaymentIntent = {
  paymentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
};

export type PaymentResult = {
  paymentId: string;
  status: "PAID" | "FAILED";
  failureReason?: string;
};

export const paymentsApi = {
  /** POST /payments/intent */
  async createIntent(input: { amount: number; currency: string }): Promise<PaymentIntent> {
    return request("/payments/intent", { method: "POST", body: input }, () =>
      localApi.paymentIntent(input),
    );
  },

  /** POST /payments/confirm */
  async confirm(input: {
    paymentId: string;
    methodId: string;
    simulateOutcome?: "success" | "declined" | "3ds_failed" | "timeout";
  }): Promise<PaymentResult> {
    return request("/payments/confirm", { method: "POST", body: input }, () =>
      localApi.paymentConfirm(input),
    );
  },

  /** GET /payments/:id/status */
  async status(paymentId: string): Promise<PaymentResult> {
    return request(`/payments/${paymentId}/status`, {}, () => localApi.paymentStatus(paymentId));
  },

  async listCards(): Promise<PaymentCard[]> {
    return request("/payments/cards", {}, () => localApi.cards());
  },

  async addCard(input: { number: string; expiry: string; name: string; setDefault?: boolean }): Promise<PaymentCard> {
    return request("/payments/cards", { method: "POST", body: input }, () => localApi.addCard(input));
  },

  async removeCard(cardId: string): Promise<{ ok: true }> {
    return request(`/payments/cards/${cardId}`, { method: "DELETE" }, () => localApi.removeCard(cardId));
  },

  async setDefaultCard(cardId: string): Promise<{ ok: true }> {
    return request(`/payments/cards/${cardId}/default`, { method: "PATCH" }, () =>
      localApi.setDefaultCard(cardId),
    );
  },
};
