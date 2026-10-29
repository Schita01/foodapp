/**
 * Shared canonical types. These MUST match the Admin Panel and Restaurant Panel
 * contracts (spec sections 4 & 27). Every entity carries `restaurantId` and
 * `branchId` so the customer app can never show data for the wrong location.
 */

export type Currency = "GEL" | "EUR" | "USD";

export type ListingCategory =
  | "meals"
  | "bakery"
  | "groceries"
  | "drinks"
  | "other";

export type ListingStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRING_SOON"
  | "SOLD_OUT"
  | "EXPIRED"
  | "CANCELLED"
  | "UNDER_REVIEW"
  | "REMOVED"
  | "ARCHIVED";

export type BranchStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED";

export type BranchApprovalStatus = "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";

export type Branch = {
  branchId: string;
  restaurantId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  pickupInfo?: string;
  status: BranchStatus;
  approvalStatus: BranchApprovalStatus;
  distanceKm?: number;
};

/** What the store provides for collection so customers can prepare (OUR ADDON). */
export type PackagingInfo = {
  containerProvided: boolean;
  carrierBagProvided: boolean;
  note?: string;
};

/**
 * OUR ADDON: an individual surplus item a store offers for "pick yourself"
 * (hybrid) checkout, alongside the classic blind Surprise Bag.
 */
export type StoreItem = {
  itemId: string;
  name: string;
  emoji?: string;
  price: number;
  originalPrice?: number;
  quantityAvailable: number;
  /** OUR ADDON: transparency details shown via the per-item info popup. */
  description?: string;
  weight?: string;
  ingredients?: string;
  allergens?: string[];
};

/** A single priced line in an order (a surprise bag or a picked item). */
export type OrderLineItem = {
  itemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Listing = {
  listingId: string;
  restaurantId: string;
  branchId: string;
  restaurantName: string;
  branchName: string;
  branchAddress: string;
  branchLatitude?: number;
  branchLongitude?: number;
  title: string;
  description: string;
  imageUrl: string;
  category: ListingCategory;
  pickupStart: string;
  pickupEnd: string;
  timezone: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  price: number;
  originalValue: number;
  currency: Currency;
  quantityAvailable: number;
  quantityTotal: number;
  status: ListingStatus;
  allergens?: string[];
  ingredientsNote?: string;
  pickupInstructions?: string;
  packagingNote?: string;
  packaging?: PackagingInfo;
  /** OUR ADDON: individual items the store offers for "pick yourself" checkout. */
  items?: StoreItem[];
  /** @deprecated Use branchLatitude/branchLongitude */
  latitude?: number;
  /** @deprecated Use branchLatitude/branchLongitude */
  longitude?: number;
  /** OUR ADDON: optional rich rating breakdown shown on detail screen. */
  qualityRating?: number;
  quantityRating?: number;
  varietyRating?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
};

export type OrderStatus =
  | "PAID"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED_PICKUP"
  | "DISPUTED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type RefundStatus =
  | "NONE"
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "REFUNDED";

export type OrderTimelineEvent = {
  status: OrderStatus | "PLACED";
  label: string;
  at?: string;
  done: boolean;
};

export type Order = {
  orderId: string;
  customerId: string;
  restaurantId: string;
  branchId: string;
  listingId: string;
  listingTitle: string;
  restaurantName: string;
  branchName: string;
  branchAddress: string;
  listingImageUrl: string;
  quantity: number;
  unitPrice: number;
  /** OUR ADDON: individually picked items included in this order (hybrid checkout). */
  customItems?: OrderLineItem[];
  total: number;
  currency: Currency;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupCode: string;
  pickupQrValue: string;
  pickupStart: string;
  pickupEnd: string;
  timezone: string;
  pickupInstructions?: string;
  packaging?: PackagingInfo;
  allergens?: string[];
  ingredientsNote?: string;
  branchLatitude?: number;
  branchLongitude?: number;
  /** @deprecated Use branchAddress */
  pickupAddress?: string;
  /** @deprecated Use branchLatitude */
  latitude?: number;
  /** @deprecated Use branchLongitude */
  longitude?: number;
  paymentMethodLabel: string;
  createdAt: string;
  cancelledAt?: string;
  handoffConfirmedAt?: string;
  handoffConfirmedBy?: string;
  refundStatus?: RefundStatus;
  reviewed?: boolean;
};

export type Restaurant = {
  restaurantId: string;
  name: string;
  imageUrl: string;
  logoUrl: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  category: ListingCategory;
  description?: string;
  /** @deprecated Brand-level; use Branch for location */
  address?: string;
  /** @deprecated Brand-level; use Branch for location */
  pickupInfo?: string;
  /** @deprecated Brand-level; use Branch for location */
  latitude?: number;
  /** @deprecated Brand-level; use Branch for location */
  longitude?: number;
};

export type Review = {
  reviewId: string;
  customerId: string;
  restaurantId: string;
  branchId: string;
  listingId: string;
  orderId: string;
  customerName: string;
  rating: number;
  qualityRating?: number;
  quantityRating?: number;
  pickupRating?: number;
  tags: string[];
  comment?: string;
  photoUrl?: string;
  createdAt: string;
};

export type SupportTicketStatus =
  | "open"
  | "in-progress"
  | "pending"
  | "resolved"
  | "closed";

export type SupportCategory =
  | "Pickup issue"
  | "Store closed"
  | "Staff refused pickup"
  | "Missing bag"
  | "Wrong item"
  | "Bad quality"
  | "Unsafe food"
  | "Allergen issue"
  | "Payment issue"
  | "Refund request"
  | "Technical issue"
  | "Other";

export type SupportMessage = {
  messageId: string;
  author: "customer" | "support";
  authorName: string;
  body: string;
  attachments?: UploadResponse[];
  createdAt: string;
};

export type SupportTicket = {
  supportTicketId: string;
  customerId?: string;
  restaurantId?: string;
  branchId?: string | null;
  orderId?: string;
  listingId?: string;
  title: string;
  category: SupportCategory;
  status: SupportTicketStatus;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
};

export type Refund = {
  refundId: string;
  orderId: string;
  restaurantId: string;
  branchId: string;
  status: RefundStatus;
  reason: string;
  explanation?: string;
  photoUrl?: string;
  supportTicketId?: string;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType =
  | "ORDER_RESERVED"
  | "PICKUP_STARTS_SOON"
  | "PICKUP_ENDING_SOON"
  | "RESTAURANT_CANCELLED"
  | "REFUND_UPDATE"
  | "SUPPORT_REPLY"
  | "FAVOURITE_NEW_LISTING"
  | "PAYMENT_FAILED"
  | "REVIEW_REQUEST"
  | "PROMOTION";

export type AppNotification = {
  notificationId: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  critical?: boolean;
  restaurantId?: string;
  branchId?: string;
  orderId?: string;
  listingId?: string;
  /** Route to deep-link to when tapped. */
  deepLink?: string;
};

export type UploadResponse = {
  uploadId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  ownerEntityType: string;
  ownerEntityId: string;
  restaurantId?: string;
  branchId?: string;
  customerId?: string;
};

export type PaymentCard = {
  cardId: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  name: string;
  isDefault: boolean;
};

export type Voucher = {
  voucherId: string;
  code: string;
  description: string;
  amount: number;
  currency: Currency;
  expiresAt: string;
  status: "active" | "expired" | "used";
};

export type SavedLocation = {
  id: string;
  label: string;
  city: string;
  latitude: number;
  longitude: number;
};

export type NotificationSettings = {
  pickupReminders: boolean;
  orderUpdates: boolean;
  supportReplies: boolean;
  favouriteStoreAlerts: boolean;
  marketingEmails: boolean;
  dailyReminder: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  calendarReminders: boolean;
  dailyReminderDays: string[];
};

export type User = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language: "en" | "ka";
  country: string;
  avatarUrl?: string;
  dietaryPreferences: string[];
  preferredPickupWindows: string[];
  motivations: string[];
  marketingEmailOptIn: boolean;
  birthday?: string;
  gender?: string;
  savedLocations: SavedLocation[];
  notificationSettings: NotificationSettings;
  accountStatus: "active" | "blocked" | "deleted";
  /** Impact stats (OUR ADDON). */
  mealsRescued: number;
  moneySaved: number;
  co2SavedKg: number;
};
