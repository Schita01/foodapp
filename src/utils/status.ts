import { colors } from "@/theme";
import type {
  ListingStatus,
  OrderStatus,
  RefundStatus,
  SupportTicketStatus,
} from "@/types";

export type BadgeTone = "success" | "warning" | "error" | "neutral" | "info" | "accent";

export const badgeColors: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.accentSoft, fg: colors.warning },
  error: { bg: colors.errorSoft, fg: colors.error },
  neutral: { bg: colors.disabledBg, fg: colors.textSecondary },
  info: { bg: "#E5EEFE", fg: colors.info },
  accent: { bg: colors.accentSoft, fg: colors.accent },
};

export function listingStatusMeta(status: ListingStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "ACTIVE":
      return { label: "Available", tone: "success" };
    case "EXPIRING_SOON":
      return { label: "Ending soon", tone: "warning" };
    case "SOLD_OUT":
      return { label: "Sold out", tone: "neutral" };
    case "EXPIRED":
      return { label: "Expired", tone: "neutral" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "error" };
    case "PAUSED":
      return { label: "Paused", tone: "neutral" };
    case "UNDER_REVIEW":
      return { label: "Under review", tone: "info" };
    case "REMOVED":
      return { label: "Unavailable", tone: "neutral" };
    case "SCHEDULED":
      return { label: "Scheduled", tone: "info" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function orderStatusMeta(status: OrderStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "PAID":
      return { label: "Paid", tone: "info" };
    case "PREPARING":
      return { label: "Preparing", tone: "info" };
    case "READY_FOR_PICKUP":
      return { label: "Ready for pickup", tone: "success" };
    case "PICKED_UP":
      return { label: "Picked up", tone: "success" };
    case "COMPLETED":
      return { label: "Completed", tone: "success" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "error" };
    case "MISSED_PICKUP":
      return { label: "Missed pickup", tone: "error" };
    case "DISPUTED":
      return { label: "Disputed", tone: "warning" };
    case "REFUNDED":
      return { label: "Refunded", tone: "neutral" };
    case "READY_FOR_DELIVERY":
      return { label: "Ready for delivery", tone: "info" };
    case "OUT_FOR_DELIVERY":
      return { label: "Out for delivery", tone: "info" };
    case "DELIVERED":
      return { label: "Delivered", tone: "success" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function refundStatusMeta(status: RefundStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "REQUESTED":
      return { label: "Requested", tone: "info" };
    case "UNDER_REVIEW":
      return { label: "Under review", tone: "warning" };
    case "APPROVED":
      return { label: "Approved", tone: "success" };
    case "REJECTED":
      return { label: "Rejected", tone: "error" };
    case "REFUNDED":
      return { label: "Refunded", tone: "success" };
    default:
      return { label: "No refund", tone: "neutral" };
  }
}

export function supportStatusMeta(status: SupportTicketStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "open":
      return { label: "Open", tone: "info" };
    case "in-progress":
      return { label: "In progress", tone: "warning" };
    case "pending":
      return { label: "Pending", tone: "warning" };
    case "resolved":
      return { label: "Resolved", tone: "success" };
    case "closed":
      return { label: "Closed", tone: "neutral" };
    default:
      return { label: status, tone: "neutral" };
  }
}

/** Active order statuses still in progress. */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "PAID",
  "PREPARING",
  "READY_FOR_PICKUP",
];

export const COMPLETED_ORDER_STATUSES: OrderStatus[] = ["PICKED_UP", "COMPLETED"];

export const CANCELLED_ORDER_STATUSES: OrderStatus[] = [
  "CANCELLED",
  "MISSED_PICKUP",
  "REFUNDED",
];
