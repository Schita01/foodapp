/**
 * In-memory mock database. Acts as the shared backend the Admin Panel and
 * Restaurant Panel would also read/write. Seeded once per app session.
 *
 * OUR ADDON: mutations here represent cross-panel sync. e.g. creating an order
 * makes it visible to Restaurant + Admin order lists; a pickup scan (mocked in
 * orders.confirmPickup) flips status the same way the Restaurant scanner would.
 */
import type {
  AppNotification,
  Branch,
  Listing,
  Order,
  PaymentCard,
  Refund,
  Restaurant,
  Review,
  SupportTicket,
  User,
  Voucher,
} from "@/types";
import {
  buildSeedNotifications,
  buildSeedOrders,
  buildSeedTickets,
  mockBranches,
  mockCards,
  mockListings,
  mockRestaurants,
  mockReviews,
  mockUser,
  mockVouchers,
} from "@/mock/data";

type Db = {
  user: User;
  listings: Listing[];
  restaurants: Restaurant[];
  branches: Branch[];
  orders: Order[];
  notifications: AppNotification[];
  tickets: SupportTicket[];
  refunds: Refund[];
  reviews: Review[];
  cards: PaymentCard[];
  vouchers: Voucher[];
  favouriteListingIds: Set<string>;
  favouriteRestaurantIds: Set<string>;
};

let db: Db | null = null;

export function getDb(): Db {
  if (!db) {
    const user = { ...mockUser };
    db = {
      user,
      listings: mockListings.map((l) => ({ ...l })),
      restaurants: mockRestaurants.map((r) => ({ ...r })),
      branches: mockBranches.map((b) => ({ ...b })),
      orders: buildSeedOrders(user.customerId),
      notifications: buildSeedNotifications(),
      tickets: buildSeedTickets(),
      refunds: [],
      reviews: mockReviews.map((r) => ({ ...r })),
      cards: mockCards.map((c) => ({ ...c })),
      vouchers: mockVouchers.map((v) => ({ ...v })),
      favouriteListingIds: new Set(["lst-001"]),
      favouriteRestaurantIds: new Set(["rest-001"]),
    };
  }
  return db;
}

export function resetDb() {
  db = null;
}
