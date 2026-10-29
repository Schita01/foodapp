import type { Listing, OrderLineItem } from "@/types";

/** Map of storeItemId -> selected quantity. */
export type ItemSelection = Record<string, number>;

/** Resolve the picked custom items (qty > 0) into order line items. */
export function selectedLineItems(listing: Listing, items: ItemSelection): OrderLineItem[] {
  if (!listing.items) return [];
  return listing.items
    .filter((it) => (items[it.itemId] ?? 0) > 0)
    .map((it) => ({
      itemId: it.itemId,
      name: it.name,
      quantity: items[it.itemId],
      unitPrice: it.price,
    }));
}

/** Totals for a hybrid selection of surprise bags + individually picked items. */
export function selectionTotals(listing: Listing, bagQty: number, items: ItemSelection) {
  const bagTotal = +(listing.price * bagQty).toFixed(2);
  const lineItems = selectedLineItems(listing, items);
  const itemsTotal = +lineItems.reduce((s, li) => s + li.unitPrice * li.quantity, 0).toFixed(2);
  const subtotal = +(bagTotal + itemsTotal).toFixed(2);
  const itemCount = lineItems.reduce((s, li) => s + li.quantity, 0);
  const count = bagQty + itemCount;
  return { bagTotal, itemsTotal, subtotal, count, itemCount, lineItems };
}
