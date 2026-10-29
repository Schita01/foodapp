import type { Currency } from "@/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
  GEL: "₾",
  EUR: "€",
  USD: "$",
};

export function currencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOL[currency] ?? "";
}

export function formatPrice(amount: number, currency: Currency = "GEL"): string {
  return `${currencySymbol(currency)}${amount.toFixed(2)}`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatPickupWindow(startIso: string, endIso: string, timezone?: string): string {
  const opts = timezone ? { timeZone: timezone } : undefined;
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = isToday(start)
    ? "today"
    : isTomorrow(start)
      ? "tomorrow"
      : start.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", ...opts });
  return `${day}: ${formatTime(start, timezone)}–${formatTime(end, timezone)}`;
}

export function formatTime(date: Date, timezone?: string): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)} · ${formatTime(d)}`;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function isTomorrow(date: Date): boolean {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function discountPercent(price: number, originalValue: number): number {
  if (originalValue <= 0) return 0;
  return Math.round((1 - price / originalValue) * 100);
}

/** "in 2h 15m" / "Pickup ended" relative countdown to a target time. */
export function countdownTo(targetIso: string, nowMs = Date.now()): string {
  const diff = new Date(targetIso).getTime() - nowMs;
  if (diff <= 0) return "Now";
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
}

export function timeAgo(iso: string, nowMs = Date.now()): string {
  const diff = nowMs - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

/** Whether `now` is within the pickup window. */
export function isWithinPickupWindow(
  startIso: string,
  endIso: string,
  nowMs = Date.now(),
): boolean {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return nowMs >= start && nowMs <= end;
}

export function isPickupEnded(endIso: string, nowMs = Date.now()): boolean {
  return nowMs > new Date(endIso).getTime();
}
