/**
 * Client-side fallback that mirrors the local API server, operating on the same
 * bundled in-memory database (`getDb`). Used automatically by service modules
 * when the HTTP server can't be reached, so the app works with or without it.
 */
import { ApiError, MOCK_OTP, uid } from "./shared";
import { getDb } from "./db";
import { filterListingsForCustomer } from "@/utils/filterListings";
import { isCustomerVisibleBranch } from "@/utils/filterBranches";
import { isPickupEnded } from "@/utils/format";
import { mockCities } from "@/mock/data";
import type { Filters } from "@/store/filterStore";
import type {
  AppNotification,
  Branch,
  Listing,
  Order,
  PaymentCard,
  Refund,
  Restaurant,
  Review,
  SupportCategory,
  SupportMessage,
  SupportTicket,
  UploadResponse,
  User,
} from "@/types";

const SUPPORTED = new Set(["Tbilisi", "Batumi", "Kutaisi", "Rustavi"]);

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isReservable(l: Listing): boolean {
  return l.status === "ACTIVE" || l.status === "EXPIRING_SOON";
}

export const localApi = {
  // Auth
  authEmailStart(email: string) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new ApiError("Enter a valid email address.", "INVALID_EMAIL", 400);
    }
    return { isExisting: !email.toLowerCase().includes("new"), resendInSec: 30 };
  },
  authEmailVerify(email: string, code: string) {
    if (email.toLowerCase().includes("blocked")) {
      throw new ApiError("This account cannot be used right now.", "ACCOUNT_BLOCKED", 403);
    }
    if (code !== MOCK_OTP) {
      throw new ApiError("That code is incorrect. Try again.", "INVALID_CODE", 401);
    }
    const db = getDb();
    db.user.email = email;
    return { token: `tok_${Date.now()}`, customerId: db.user.customerId, accountStatus: "active" as const };
  },
  logout() {
    return { ok: true } as const;
  },

  // Me
  me(): User {
    return { ...getDb().user };
  },
  updateMe(patch: Partial<User>): User {
    const db = getDb();
    db.user = { ...db.user, ...patch };
    return { ...db.user };
  },
  removeMe() {
    getDb().user.accountStatus = "deleted";
    return { ok: true } as const;
  },
  updateLocation() {
    return { ok: true } as const;
  },

  // Branches
  branch(id: string): Branch {
    const b = getDb().branches.find((x) => x.branchId === id);
    if (!b) throw new ApiError("Branch not found.", "NOT_FOUND", 404);
    if (!isCustomerVisibleBranch(b)) {
      throw new ApiError("Branch not available.", "BRANCH_UNAVAILABLE", 404);
    }
    return { ...b };
  },
  branchesByRestaurant(restaurantId: string): Branch[] {
    return getDb()
      .branches.filter((b) => b.restaurantId === restaurantId && isCustomerVisibleBranch(b))
      .map((b) => ({ ...b }));
  },

  // Listings
  listings(filters: Partial<Filters>): Listing[] {
    const db = getDb();
    return filterListingsForCustomer(db.listings, db.branches, filters, db.favouriteListingIds);
  },
  listingsAll(): Listing[] {
    const db = getDb();
    return filterListingsForCustomer(db.listings, db.branches, {}, db.favouriteListingIds);
  },
  listing(id: string): Listing {
    const db = getDb();
    const l = db.listings.find((x) => x.listingId === id);
    if (!l) throw new ApiError("Listing not found.", "NOT_FOUND", 404);
    const branch = db.branches.find((b) => b.branchId === l.branchId);
    if (!branch || !isCustomerVisibleBranch(branch)) {
      throw new ApiError("Listing not found.", "NOT_FOUND", 404);
    }
    if (isReservable(l) && isPickupEnded(l.pickupEnd)) return { ...l, status: "EXPIRED" as const };
    return { ...l };
  },
  listingsByRestaurant(restaurantId: string): Listing[] {
    const db = getDb();
    return filterListingsForCustomer(
      db.listings.filter((l) => l.restaurantId === restaurantId),
      db.branches,
      {},
      db.favouriteListingIds,
    );
  },
  favouriteListing(id: string) {
    getDb().favouriteListingIds.add(id);
    return { ok: true } as const;
  },
  unfavouriteListing(id: string) {
    getDb().favouriteListingIds.delete(id);
    return { ok: true } as const;
  },
  favouriteIds() {
    const db = getDb();
    return { listings: [...db.favouriteListingIds], restaurants: [...db.favouriteRestaurantIds] };
  },

  // Restaurants
  restaurants(): Restaurant[] {
    return getDb().restaurants.map((r) => ({ ...r }));
  },
  restaurant(id: string): Restaurant {
    const r = getDb().restaurants.find((x) => x.restaurantId === id);
    if (!r) throw new ApiError("Restaurant not found.", "NOT_FOUND", 404);
    return { ...r };
  },
  restaurantReviews(id: string): Review[] {
    return getDb()
      .reviews.filter((rev) => rev.restaurantId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  favouriteRestaurant(id: string) {
    getDb().favouriteRestaurantIds.add(id);
    return { ok: true } as const;
  },
  unfavouriteRestaurant(id: string) {
    getDb().favouriteRestaurantIds.delete(id);
    return { ok: true } as const;
  },

  // Orders
  createOrder(input: {
    listingId: string;
    quantity: number;
    customItems?: { itemId: string; name: string; price: number; quantity: number }[];
    paymentMethodLabel: string;
  }): Order {
    const db = getDb();
    const listing = db.listings.find((l) => l.listingId === input.listingId);
    if (!listing) throw new ApiError("Listing not found.", "NOT_FOUND", 404);
    const branch = db.branches.find((b) => b.branchId === listing.branchId);
    if (!branch || !isCustomerVisibleBranch(branch)) {
      throw new ApiError("This branch is not available for orders.", "BRANCH_UNAVAILABLE", 409);
    }
    const bagQty = input.quantity ?? 0;
    const picked = input.customItems ?? [];
    if (bagQty <= 0 && picked.length === 0) {
      throw new ApiError("Select at least one bag or item.", "EMPTY_ORDER", 400);
    }
    if (bagQty > 0 && listing.quantityAvailable < bagQty) {
      throw new ApiError("This bag just sold out.", "SOLD_OUT", 409);
    }
    for (const ci of picked) {
      const stock = listing.items?.find((it) => it.itemId === ci.itemId);
      if (!stock || stock.quantityAvailable < ci.quantity) {
        throw new ApiError(`${ci.name} just sold out.`, "SOLD_OUT", 409);
      }
    }
    const itemsTotal = picked.reduce((s, ci) => s + ci.price * ci.quantity, 0);
    const total = +(listing.price * bagQty + itemsTotal).toFixed(2);
    const orderId = uid("ord");
    const code = genCode();
    const order: Order = {
      orderId,
      customerId: db.user.customerId,
      restaurantId: listing.restaurantId,
      branchId: listing.branchId,
      listingId: listing.listingId,
      listingTitle: listing.title,
      restaurantName: listing.restaurantName,
      branchName: listing.branchName,
      branchAddress: listing.branchAddress,
      listingImageUrl: listing.imageUrl,
      quantity: bagQty,
      unitPrice: listing.price,
      customItems: picked.map((ci) => ({
        itemId: ci.itemId,
        name: ci.name,
        quantity: ci.quantity,
        unitPrice: ci.price,
      })),
      total,
      currency: listing.currency,
      paymentStatus: "PAID",
      orderStatus: "PAID",
      pickupCode: code,
      pickupQrValue: `RB|${orderId}|${listing.branchId}|${code}`,
      pickupStart: listing.pickupStart,
      pickupEnd: listing.pickupEnd,
      timezone: listing.timezone,
      pickupInstructions: listing.pickupInstructions,
      packaging: listing.packaging,
      allergens: listing.allergens,
      ingredientsNote: listing.ingredientsNote,
      branchLatitude: listing.branchLatitude,
      branchLongitude: listing.branchLongitude,
      paymentMethodLabel: input.paymentMethodLabel,
      createdAt: new Date().toISOString(),
      refundStatus: "NONE",
    };
    if (bagQty > 0) {
      listing.quantityAvailable -= bagQty;
      if (listing.quantityAvailable <= 0) listing.status = "SOLD_OUT";
    }
    for (const ci of picked) {
      const stock = listing.items?.find((it) => it.itemId === ci.itemId);
      if (stock) stock.quantityAvailable -= ci.quantity;
    }
    db.orders.unshift(order);
    db.notifications.unshift({
      notificationId: uid("ntf"),
      type: "ORDER_RESERVED",
      title: "Reservation confirmed",
      body: `Your ${listing.title} from ${listing.restaurantName} — ${listing.branchName} is reserved.`,
      createdAt: new Date().toISOString(),
      read: false,
      restaurantId: listing.restaurantId,
      branchId: listing.branchId,
      orderId,
      listingId: listing.listingId,
      deepLink: `/orders/${orderId}`,
    });
    return { ...order };
  },
  orders(): Order[] {
    return getDb().orders.map((o) => ({ ...o }));
  },
  order(id: string): Order {
    const o = getDb().orders.find((x) => x.orderId === id);
    if (!o) throw new ApiError("Order not found.", "NOT_FOUND", 404);
    return { ...o };
  },
  cancelOrder(id: string): Order {
    const db = getDb();
    const o = db.orders.find((x) => x.orderId === id);
    if (!o) throw new ApiError("Order not found.", "NOT_FOUND", 404);
    if (o.orderStatus === "PICKED_UP" || o.orderStatus === "COMPLETED") {
      throw new ApiError("This order has already been picked up.", "ALREADY_PICKED_UP", 409);
    }
    o.orderStatus = "CANCELLED";
    o.paymentStatus = "REFUNDED";
    o.refundStatus = "REFUNDED";
    o.cancelledAt = new Date().toISOString();
    return { ...o };
  },
  pickupCode(id: string) {
    const o = getDb().orders.find((x) => x.orderId === id);
    if (!o) throw new ApiError("Order not found.", "NOT_FOUND", 404);
    return {
      pickupCode: o.pickupCode,
      pickupQrValue: o.pickupQrValue,
      branchId: o.branchId,
      branchName: o.branchName,
    };
  },
  confirmPickup(id: string, scannedBranchId?: string): Order {
    const db = getDb();
    const o = db.orders.find((x) => x.orderId === id);
    if (!o) throw new ApiError("Order not found.", "NOT_FOUND", 404);
    if (scannedBranchId && scannedBranchId !== o.branchId) {
      throw new ApiError(
        "This pickup code can only be used at the branch shown in your order.",
        "WRONG_BRANCH",
        409,
      );
    }
    o.orderStatus = "PICKED_UP";
    o.handoffConfirmedAt = new Date().toISOString();
    o.handoffConfirmedBy = "Restaurant staff";
    const saved = +(o.unitPrice * o.quantity * 2).toFixed(2) - o.total;
    db.user.mealsRescued += o.quantity;
    db.user.moneySaved += Math.max(0, Math.round(saved));
    db.user.co2SavedKg += +(o.quantity * 2.5).toFixed(1);
    db.notifications.unshift({
      notificationId: uid("ntf"),
      type: "REVIEW_REQUEST",
      title: "How was your rescue?",
      body: `Rate your ${o.listingTitle} from ${o.branchName}.`,
      createdAt: new Date().toISOString(),
      read: false,
      restaurantId: o.restaurantId,
      branchId: o.branchId,
      orderId: o.orderId,
      listingId: o.listingId,
      deepLink: `/reviews/new/${o.orderId}`,
    });
    return { ...o };
  },

  // Payments
  paymentIntent(input: { amount: number; currency: string }) {
    return { paymentId: uid("pay"), clientSecret: uid("secret"), amount: input.amount, currency: input.currency };
  },
  paymentConfirm(input: { paymentId: string; simulateOutcome?: "success" | "declined" | "3ds_failed" | "timeout" }) {
    const outcome = input.simulateOutcome ?? "success";
    if (outcome === "declined") throw new ApiError("Your card was declined.", "CARD_DECLINED", 402);
    if (outcome === "3ds_failed") throw new ApiError("Authentication failed. Please try again.", "THREEDS_FAILED", 402);
    if (outcome === "timeout") throw new ApiError("The payment timed out. Please try again.", "TIMEOUT", 408);
    return { paymentId: input.paymentId, status: "PAID" as const };
  },
  paymentStatus(paymentId: string) {
    return { paymentId, status: "PAID" as const };
  },
  cards(): PaymentCard[] {
    return getDb().cards.map((c) => ({ ...c }));
  },
  addCard(input: { number: string; expiry: string; name: string; setDefault?: boolean }): PaymentCard {
    const db = getDb();
    const last4 = input.number.replace(/\s/g, "").slice(-4) || "0000";
    const brand: PaymentCard["brand"] = input.number.trim().startsWith("5") ? "mastercard" : "visa";
    const card: PaymentCard = {
      cardId: uid("card"),
      brand,
      last4,
      expiry: input.expiry,
      name: input.name,
      isDefault: input.setDefault ?? db.cards.length === 0,
    };
    if (card.isDefault) db.cards.forEach((c) => (c.isDefault = false));
    db.cards.push(card);
    return { ...card };
  },
  removeCard(cardId: string) {
    const db = getDb();
    db.cards = db.cards.filter((c) => c.cardId !== cardId);
    if (db.cards.length && !db.cards.some((c) => c.isDefault)) db.cards[0].isDefault = true;
    return { ok: true } as const;
  },
  setDefaultCard(cardId: string) {
    getDb().cards.forEach((c) => (c.isDefault = c.cardId === cardId));
    return { ok: true } as const;
  },

  // Support
  createTicket(input: {
    category: SupportCategory;
    message: string;
    orderId?: string;
    listingId?: string;
    restaurantId?: string;
    attachments?: UploadResponse[];
  }): SupportTicket {
    const db = getDb();
    const id = uid("tkt");
    let branchId: string | null | undefined = null;
    if (input.orderId) {
      const order = db.orders.find((o) => o.orderId === input.orderId);
      if (!order) throw new ApiError("Order not found.", "NOT_FOUND", 404);
      branchId = order.branchId;
    } else if (input.listingId) {
      const listing = db.listings.find((l) => l.listingId === input.listingId);
      if (!listing) throw new ApiError("Listing not found.", "NOT_FOUND", 404);
      branchId = listing.branchId;
    }
    const ticket: SupportTicket = {
      supportTicketId: id,
      customerId: db.user.customerId,
      restaurantId: input.restaurantId,
      branchId,
      orderId: input.orderId,
      listingId: input.listingId,
      title: input.category,
      category: input.category,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          messageId: uid("msg"),
          author: "customer",
          authorName: "You",
          body: input.message,
          attachments: input.attachments,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    db.tickets.unshift(ticket);
    return { ...ticket };
  },
  tickets(): SupportTicket[] {
    return getDb()
      .tickets.map((t) => ({ ...t }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  ticket(id: string): SupportTicket {
    const t = getDb().tickets.find((x) => x.supportTicketId === id);
    if (!t) throw new ApiError("Ticket not found.", "NOT_FOUND", 404);
    return { ...t };
  },
  addTicketMessage(id: string, body: string, attachments?: UploadResponse[]): SupportMessage {
    const t = getDb().tickets.find((x) => x.supportTicketId === id);
    if (!t) throw new ApiError("Ticket not found.", "NOT_FOUND", 404);
    const msg: SupportMessage = {
      messageId: uid("msg"),
      author: "customer",
      authorName: "You",
      body,
      attachments,
      createdAt: new Date().toISOString(),
    };
    t.messages.push(msg);
    t.status = "in-progress";
    t.updatedAt = new Date().toISOString();
    return { ...msg };
  },
  closeTicket(id: string): SupportTicket {
    const t = getDb().tickets.find((x) => x.supportTicketId === id);
    if (!t) throw new ApiError("Ticket not found.", "NOT_FOUND", 404);
    t.status = "closed";
    t.updatedAt = new Date().toISOString();
    return { ...t };
  },
  reopenTicket(id: string): SupportTicket {
    const t = getDb().tickets.find((x) => x.supportTicketId === id);
    if (!t) throw new ApiError("Ticket not found.", "NOT_FOUND", 404);
    t.status = "open";
    t.updatedAt = new Date().toISOString();
    return { ...t };
  },

  // Refunds
  createRefund(input: { orderId: string; reason: string; explanation?: string; photo?: UploadResponse }): Refund {
    const db = getDb();
    const order = db.orders.find((o) => o.orderId === input.orderId);
    if (!order) throw new ApiError("Order not found.", "NOT_FOUND", 404);
    const refund: Refund = {
      refundId: uid("ref"),
      orderId: input.orderId,
      restaurantId: order.restaurantId,
      branchId: order.branchId,
      status: "REQUESTED",
      reason: input.reason,
      explanation: input.explanation,
      photoUrl: input.photo?.url,
      supportTicketId: uid("tkt"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.refunds.unshift(refund);
    order.refundStatus = "REQUESTED";
    db.tickets.unshift({
      supportTicketId: refund.supportTicketId!,
      customerId: db.user.customerId,
      restaurantId: order.restaurantId,
      branchId: order.branchId,
      orderId: order.orderId,
      listingId: order.listingId,
      title: "Refund request",
      category: "Refund request",
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          messageId: uid("msg"),
          author: "customer",
          authorName: "You",
          body: `Refund requested: ${input.reason}${input.explanation ? `\n${input.explanation}` : ""}`,
          attachments: input.photo ? [input.photo] : undefined,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    db.notifications.unshift({
      notificationId: uid("ntf"),
      type: "REFUND_UPDATE",
      title: "Refund requested",
      body: `We've received your refund request for your ${order.branchName} order.`,
      createdAt: new Date().toISOString(),
      read: false,
      restaurantId: order.restaurantId,
      branchId: order.branchId,
      orderId: order.orderId,
      deepLink: `/orders/${order.orderId}/refund`,
    });
    return { ...refund };
  },
  refundByOrder(orderId: string): Refund | null {
    const r = getDb().refunds.find((x) => x.orderId === orderId);
    return r ? { ...r } : null;
  },

  // Reviews
  createReview(input: {
    orderId: string;
    rating: number;
    qualityRating?: number;
    quantityRating?: number;
    pickupRating?: number;
    tags: string[];
    comment?: string;
    photo?: UploadResponse;
  }): Review {
    const db = getDb();
    const order = db.orders.find((o) => o.orderId === input.orderId);
    if (!order) throw new ApiError("Order not found.", "NOT_FOUND", 404);
    const review: Review = {
      reviewId: uid("rev"),
      customerId: db.user.customerId,
      restaurantId: order.restaurantId,
      branchId: order.branchId,
      listingId: order.listingId,
      orderId: input.orderId,
      customerName: `${db.user.firstName} ${db.user.lastName.charAt(0)}.`,
      rating: input.rating,
      qualityRating: input.qualityRating,
      quantityRating: input.quantityRating,
      pickupRating: input.pickupRating,
      tags: input.tags,
      comment: input.comment,
      photoUrl: input.photo?.url,
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(review);
    order.reviewed = true;
    if (order.orderStatus === "PICKED_UP") order.orderStatus = "COMPLETED";
    return { ...review };
  },
  ok() {
    return { ok: true } as const;
  },

  // Notifications
  notifications(): AppNotification[] {
    return getDb()
      .notifications.map((n) => ({ ...n }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  markNotificationRead(id: string) {
    const n = getDb().notifications.find((x) => x.notificationId === id);
    if (n) n.read = true;
    return { ok: true } as const;
  },
  markAllNotificationsRead() {
    getDb().notifications.forEach((n) => (n.read = true));
    return { ok: true } as const;
  },

  // Locations
  locationSearch(query: string) {
    const q = query.trim().toLowerCase();
    const base = mockCities.map((c) => ({ ...c, supported: SUPPORTED.has(c.city) }));
    if (!q) return base;
    const matches = base.filter((c) => c.city.toLowerCase().includes(q));
    if (matches.length === 0) {
      return [{ id: "unknown", label: query, city: query, latitude: 0, longitude: 0, supported: false }];
    }
    return matches;
  },

  // Uploads
  upload(input: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    ownerEntityType: string;
    ownerEntityId: string;
    restaurantId?: string;
  }): UploadResponse {
    return {
      uploadId: uid("upl"),
      url: input.url,
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      ownerEntityType: input.ownerEntityType,
      ownerEntityId: input.ownerEntityId,
      restaurantId: input.restaurantId,
      customerId: getDb().user.customerId,
    };
  },

  // App
  appStatus() {
    return {
      maintenanceMode: false,
      minSupportedVersion: "1.0.0",
      currentVersion: "1.0.0",
      forceUpdate: false,
      supportedCountries: ["Georgia", "Germany", "United States"],
    };
  },
};
