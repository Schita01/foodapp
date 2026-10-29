/**
 * Local RescueBite API server. Runs on http://localhost:3001 and serves the
 * same endpoints the customer app expects (see README section 28).
 */
import cors from "cors";
import express from "express";
import { MOCK_OTP } from "../src/services/shared";
import { ApiError, uid } from "../src/services/shared";
import { getDb } from "../src/services/db";
import { localApi } from "../src/services/localApi";
import { mockCities } from "../src/mock/data";
import type { Filters } from "../src/store/filterStore";

const C = "/api/customer";

const PORT = Number(process.env.PORT ?? 4000);
const SUPPORTED = new Set(["Tbilisi", "Batumi", "Kutaisi", "Rustavi"]);

function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res).catch(next);
  };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post(
  "/auth/email/start",
  asyncHandler(async (req, res) => {
    const { email } = req.body ?? {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? "")) {
      throw new ApiError("Enter a valid email address.", "INVALID_EMAIL", 400);
    }
    const isExisting = !String(email).toLowerCase().includes("new");
    res.json({ isExisting, resendInSec: 30 });
  }),
);

app.post(
  "/auth/email/verify",
  asyncHandler(async (req, res) => {
    const { email, code } = req.body ?? {};
    if (String(email).toLowerCase().includes("blocked")) {
      throw new ApiError("This account cannot be used right now.", "ACCOUNT_BLOCKED", 403);
    }
    if (code !== MOCK_OTP) {
      throw new ApiError("That code is incorrect. Try again.", "INVALID_CODE", 401);
    }
    const db = getDb();
    db.user.email = email;
    res.json({
      token: `tok_${Date.now()}`,
      customerId: db.user.customerId,
      accountStatus: "active",
    });
  }),
);

app.post("/auth/logout", (_req, res) => {
  res.json({ ok: true });
});

app.get(`${C}/me`, asyncHandler(async (_req, res) => { res.json(localApi.me()); }));
app.patch(`${C}/me`, asyncHandler(async (req, res) => { res.json(localApi.updateMe(req.body ?? {})); }));
app.delete(`${C}/me`, asyncHandler(async (_req, res) => { res.json(localApi.removeMe()); }));
app.patch(`${C}/me/location`, (_req, res) => { res.json(localApi.updateLocation()); });

app.get(`${C}/listings`, asyncHandler(async (req, res) => {
  let filters: Partial<Filters> = {};
  if (typeof req.query.filters === "string" && req.query.filters) {
    filters = JSON.parse(req.query.filters) as Partial<Filters>;
  }
  res.json(localApi.listings(filters));
}));
app.get(`${C}/listings/all`, asyncHandler(async (_req, res) => { res.json(localApi.listingsAll()); }));
app.get(`${C}/listings/favourites`, asyncHandler(async (_req, res) => { res.json(localApi.favouriteIds()); }));
app.get(`${C}/listings/:id`, asyncHandler(async (req, res) => { res.json(localApi.listing(String(req.params.id))); }));
app.post(`${C}/listings/:id/favourite`, asyncHandler(async (req, res) => {
  res.json(localApi.favouriteListing(String(req.params.id)));
}));
app.delete(`${C}/listings/:id/favourite`, asyncHandler(async (req, res) => {
  res.json(localApi.unfavouriteListing(String(req.params.id)));
}));

app.get(`${C}/branches/:id`, asyncHandler(async (req, res) => { res.json(localApi.branch(String(req.params.id))); }));
app.get(`${C}/restaurants/:id/branches`, asyncHandler(async (req, res) => {
  res.json(localApi.branchesByRestaurant(String(req.params.id)));
}));

app.get(`${C}/restaurants`, asyncHandler(async (_req, res) => { res.json(localApi.restaurants()); }));
app.get(`${C}/restaurants/:id`, asyncHandler(async (req, res) => { res.json(localApi.restaurant(String(req.params.id))); }));
app.get(`${C}/restaurants/:id/reviews`, asyncHandler(async (req, res) => {
  res.json(localApi.restaurantReviews(String(req.params.id)));
}));
app.get(`${C}/restaurants/:id/listings`, asyncHandler(async (req, res) => {
  res.json(localApi.listingsByRestaurant(String(req.params.id)));
}));
app.post(`${C}/restaurants/:id/favourite`, asyncHandler(async (req, res) => {
  res.json(localApi.favouriteRestaurant(String(req.params.id)));
}));
app.delete(`${C}/restaurants/:id/favourite`, asyncHandler(async (req, res) => {
  res.json(localApi.unfavouriteRestaurant(String(req.params.id)));
}));

app.post(`${C}/orders`, asyncHandler(async (req, res) => { res.json(localApi.createOrder(req.body ?? {})); }));
app.get(`${C}/orders`, asyncHandler(async (_req, res) => { res.json(localApi.orders()); }));
app.get(`${C}/orders/:id`, asyncHandler(async (req, res) => { res.json(localApi.order(String(req.params.id))); }));
app.post(`${C}/orders/:id/cancel`, asyncHandler(async (req, res) => {
  res.json(localApi.cancelOrder(String(req.params.id)));
}));
app.get(`${C}/orders/:id/pickup-code`, asyncHandler(async (req, res) => {
  res.json(localApi.pickupCode(String(req.params.id)));
}));
app.post(`${C}/orders/:id/confirm-pickup`, asyncHandler(async (req, res) => {
  const { scannedBranchId } = req.body ?? {};
  res.json(localApi.confirmPickup(String(req.params.id), scannedBranchId));
}));

app.post(
  "/payments/intent",
  asyncHandler(async (req, res) => {
    const input = req.body ?? {};
    res.json({
      paymentId: uid("pay"),
      clientSecret: uid("secret"),
      amount: input.amount,
      currency: input.currency,
    });
  }),
);

app.post(
  "/payments/confirm",
  asyncHandler(async (req, res) => {
    const input = req.body ?? {};
    const outcome = input.simulateOutcome ?? "success";
    if (outcome === "declined") throw new ApiError("Your card was declined.", "CARD_DECLINED", 402);
    if (outcome === "3ds_failed") {
      throw new ApiError("Authentication failed. Please try again.", "THREEDS_FAILED", 402);
    }
    if (outcome === "timeout") {
      throw new ApiError("The payment timed out. Please try again.", "TIMEOUT", 408);
    }
    res.json({ paymentId: input.paymentId, status: "PAID" as const });
  }),
);

app.get(
  "/payments/cards",
  asyncHandler(async (_req, res) => {
    res.json(getDb().cards.map((c) => ({ ...c })));
  }),
);

app.post(
  "/payments/cards",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const input = req.body ?? {};
    const last4 = String(input.number ?? "").replace(/\s/g, "").slice(-4) || "0000";
    const brand = String(input.number ?? "").trim().startsWith("5") ? "mastercard" : "visa";
    const card = {
      cardId: uid("card"),
      brand: brand as "visa" | "mastercard",
      last4,
      expiry: input.expiry,
      name: input.name,
      isDefault: input.setDefault ?? db.cards.length === 0,
    };
    if (card.isDefault) db.cards.forEach((c) => (c.isDefault = false));
    db.cards.push(card);
    res.json({ ...card });
  }),
);

app.delete(
  "/payments/cards/:id",
  asyncHandler(async (req, res) => {
    const db = getDb();
    db.cards = db.cards.filter((c) => c.cardId !== req.params.id);
    if (db.cards.length && !db.cards.some((c) => c.isDefault)) db.cards[0].isDefault = true;
    res.json({ ok: true });
  }),
);

app.patch(
  "/payments/cards/:id/default",
  asyncHandler(async (req, res) => {
    getDb().cards.forEach((c) => (c.isDefault = c.cardId === req.params.id));
    res.json({ ok: true });
  }),
);

app.get(
  "/payments/:id/status",
  asyncHandler(async (req, res) => {
    res.json({ paymentId: req.params.id, status: "PAID" as const });
  }),
);

app.post(`${C}/support/tickets`, asyncHandler(async (req, res) => { res.json(localApi.createTicket(req.body ?? {})); }));
app.get(`${C}/support/tickets`, asyncHandler(async (_req, res) => { res.json(localApi.tickets()); }));
app.get(`${C}/support/tickets/:id`, asyncHandler(async (req, res) => { res.json(localApi.ticket(String(req.params.id))); }));
app.post(`${C}/support/tickets/:id/messages`, asyncHandler(async (req, res) => {
  const { body, attachments } = req.body ?? {};
  res.json(localApi.addTicketMessage(String(req.params.id), body, attachments));
}));
app.post(`${C}/support/tickets/:id/close`, asyncHandler(async (req, res) => {
  res.json(localApi.closeTicket(String(req.params.id)));
}));
app.post(`${C}/support/tickets/:id/reopen`, asyncHandler(async (req, res) => {
  res.json(localApi.reopenTicket(String(req.params.id)));
}));

app.post(`${C}/refunds`, asyncHandler(async (req, res) => { res.json(localApi.createRefund(req.body ?? {})); }));
app.get(`${C}/refunds/by-order/:orderId`, asyncHandler(async (req, res) => {
  res.json(localApi.refundByOrder(String(req.params.orderId)));
}));

app.post(`${C}/reviews`, asyncHandler(async (req, res) => { res.json(localApi.createReview(req.body ?? {})); }));
app.post(`${C}/reviews/:id/report`, (_req, res) => { res.json(localApi.ok()); });
app.post(`${C}/photos/:id/report`, (_req, res) => { res.json(localApi.ok()); });

app.get(`${C}/notifications`, asyncHandler(async (_req, res) => { res.json(localApi.notifications()); }));
app.post(`${C}/notifications/:id/read`, asyncHandler(async (req, res) => {
  res.json(localApi.markNotificationRead(String(req.params.id)));
}));
app.post(`${C}/notifications/read-all`, (_req, res) => { res.json(localApi.markAllNotificationsRead()); });

app.get(
  "/locations/search",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    const base = mockCities.map((c) => ({ ...c, supported: SUPPORTED.has(c.city) }));
    if (!q) {
      res.json(base);
      return;
    }
    const matches = base.filter((c) => c.city.toLowerCase().includes(q));
    if (matches.length === 0) {
      res.json([
        {
          id: "unknown",
          label: req.query.q,
          city: req.query.q,
          latitude: 0,
          longitude: 0,
          supported: false,
        },
      ]);
      return;
    }
    res.json(matches);
  }),
);

app.post(
  "/uploads",
  asyncHandler(async (req, res) => {
    const input = req.body ?? {};
    res.json({
      uploadId: uid("upl"),
      url: input.url,
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      ownerEntityType: input.ownerEntityType,
      ownerEntityId: input.ownerEntityId,
      restaurantId: input.restaurantId,
      customerId: getDb().user.customerId,
    });
  }),
);

app.get("/app/status", (_req, res) => {
  res.json({
    maintenanceMode: false,
    minSupportedVersion: "1.0.0",
    currentVersion: "1.0.0",
    forceUpdate: false,
    supportedCountries: ["Georgia", "Germany", "United States"],
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.status || 500).json({ message: err.message, code: err.code });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Could not load data. Please try again.", code: "GENERIC" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`RescueBite API running on http://localhost:${PORT} (LAN devices use your PC IP on port ${PORT})`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    // Another API instance already owns the port. Stay alive so a `concurrently
    // -k` wrapper doesn't tear down the Expo dev server alongside us.
    console.warn(`Port ${PORT} is already in use — assuming the API is already running and reusing it.`);
    setInterval(() => {}, 1 << 30);
    return;
  }
  throw err;
});
