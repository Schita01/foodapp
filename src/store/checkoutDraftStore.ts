import { create } from "zustand";
import type { ItemSelection } from "@/utils/order";

type CheckoutDraft = {
  listingId: string | null;
  bagQty: number;
  items: ItemSelection;
  setDraft: (listingId: string, bagQty: number, items: ItemSelection) => void;
  clear: () => void;
};

export const useCheckoutDraftStore = create<CheckoutDraft>((set) => ({
  listingId: null,
  bagQty: 1,
  items: {},
  setDraft: (listingId, bagQty, items) => set({ listingId, bagQty, items }),
  clear: () => set({ listingId: null, bagQty: 1, items: {} }),
}));
