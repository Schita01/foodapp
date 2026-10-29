import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type { AppNotification } from "@/types";

export const notificationsApi = {
  /** GET /api/customer/notifications */
  async list(): Promise<AppNotification[]> {
    return request(`${CUSTOMER_API}/notifications`, {}, () => localApi.notifications());
  },

  /** POST /api/customer/notifications/:id/read */
  async markRead(notificationId: string): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/notifications/${notificationId}/read`, { method: "POST" }, () =>
      localApi.markNotificationRead(notificationId),
    );
  },

  /** POST /api/customer/notifications/read-all */
  async markAllRead(): Promise<{ ok: true }> {
    return request(`${CUSTOMER_API}/notifications/read-all`, { method: "POST" }, () =>
      localApi.markAllNotificationsRead(),
    );
  },
};
