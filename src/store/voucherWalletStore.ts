import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "./persist";
import type { Currency, Voucher } from "@/types";

const CATALOG: Record<string, { description: string; amount: number }> = {
  WELCOME5: { description: "₾5 off your first rescue", amount: 5 },
  FRIEND5: { description: "Referral reward", amount: 5 },
  SAVE10: { description: "₾10 off any Surprise Bag", amount: 10 },
};

type WalletState = {
  extras: Voucher[];
  redeem: (raw: string) => { ok: true; voucher: Voucher } | { ok: false; error: string };
};

export const useVoucherWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      extras: [],
      redeem: (raw) => {
        const code = raw.trim().toUpperCase();
        if (!code) return { ok: false, error: "Enter a voucher code." };
        const found = CATALOG[code];
        if (!found) return { ok: false, error: "This code isn’t valid." };
        if (get().extras.some((v) => v.code === code)) {
          return { ok: false, error: "You’ve already added this code." };
        }
        const voucher: Voucher = {
          voucherId: `vou-${Date.now()}`,
          code,
          description: found.description,
          amount: found.amount,
          currency: "GEL" as Currency,
          expiresAt: new Date(Date.now() + 21 * 24 * 3600_000).toISOString(),
          status: "active",
        };
        set({ extras: [voucher, ...get().extras] });
        return { ok: true, voucher };
      },
    }),
    { name: "rb-vouchers", storage: zustandStorage },
  ),
);
