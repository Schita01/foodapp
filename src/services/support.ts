import { CUSTOMER_API, request } from "./apiClient";
import { localApi } from "./localApi";
import type {
  SupportCategory,
  SupportMessage,
  SupportTicket,
  UploadResponse,
} from "@/types";

export const supportApi = {
  /** POST /api/customer/support/tickets */
  async create(input: {
    category: SupportCategory;
    message: string;
    orderId?: string;
    listingId?: string;
    restaurantId?: string;
    contactEmail?: string;
    attachments?: UploadResponse[];
  }): Promise<SupportTicket> {
    return request(`${CUSTOMER_API}/support/tickets`, { method: "POST", body: input }, () =>
      localApi.createTicket(input),
    );
  },

  /** GET /api/customer/support/tickets */
  async list(): Promise<SupportTicket[]> {
    return request(`${CUSTOMER_API}/support/tickets`, {}, () => localApi.tickets());
  },

  /** GET /api/customer/support/tickets/:ticketId */
  async get(ticketId: string): Promise<SupportTicket> {
    return request(`${CUSTOMER_API}/support/tickets/${ticketId}`, {}, () =>
      localApi.ticket(ticketId),
    );
  },

  /** POST /api/customer/support/tickets/:ticketId/messages */
  async addMessage(
    ticketId: string,
    body: string,
    attachments?: UploadResponse[],
  ): Promise<SupportMessage> {
    return request(
      `${CUSTOMER_API}/support/tickets/${ticketId}/messages`,
      { method: "POST", body: { body, attachments } },
      () => localApi.addTicketMessage(ticketId, body, attachments),
    );
  },

  async close(ticketId: string): Promise<SupportTicket> {
    return request(`${CUSTOMER_API}/support/tickets/${ticketId}/close`, { method: "POST" }, () =>
      localApi.closeTicket(ticketId),
    );
  },

  /** POST /api/customer/support/tickets/:ticketId/reopen */
  async reopen(ticketId: string): Promise<SupportTicket> {
    return request(`${CUSTOMER_API}/support/tickets/${ticketId}/reopen`, { method: "POST" }, () =>
      localApi.reopenTicket(ticketId),
    );
  },
};
