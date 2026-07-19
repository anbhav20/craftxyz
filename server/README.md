# CraftXYZ Backend

Node.js + Express + MongoDB backend, built in phases so each layer can be
reviewed before the next one is added.

## Setup

```bash
npm install
cp .env.example .env   # fill in real values
npm run dev
```

Health check: `GET /api/health`

See **`TESTING.md`** for how to run the automated smoke test and what
still needs manual verification (Google login, completing a real
Razorpay payment).

## Structure

```
src/
  config/       # db connection, (later) firebase/cloudinary/razorpay clients
  middleware/    # error handling, security, (later) auth guards
  models/        # (Phase 2+) Mongoose schemas
  controllers/   # (Phase 2+) request handlers
  routes/        # (Phase 2+) route definitions
  utils/         # ApiError, ApiResponse, asyncHandler — shared conventions
  app.js         # express app + middleware pipeline
  server.js      # entry point: connect DB, start listening, graceful shutdown
```

## Conventions established in this phase

- Every controller throws `ApiError` (see `utils/ApiError.js`) instead of
  manually writing `res.status().json()` for errors — one place
  (`middleware/errorHandler.js`) turns those into responses.
- Every success response goes through `new ApiResponse(...).send(res)` for
  a consistent `{ success, message, data }` shape.
- Every async route handler is wrapped in `asyncHandler` so a rejected
  promise can't crash the process or hang a request.
- Rate limiting is split into `apiLimiter` (mounted globally on `/api`)
  and `authLimiter` (tighter, exported now, wired into auth routes in
  Phase 2).

## Build plan

- [x] **Phase 1 — Foundation**: server, DB connection, security
      middleware, error handling, response conventions
- [x] **Phase 2 — Auth**: User model (single collection, `role`
      field), Firebase Admin verification, JWT access/refresh tokens
      with rotation, `auth` middleware (`requireAuth`, `requireAdmin`)
      (this delivery)
- [x] **Phase 3 — Catalog**: Category + Product models, CRUD routes,
      Cloudinary image upload via Multer (this delivery)
- [x] **Phase 4 — Cart**: cart model/routes, price calculation
- [x] **Phase 5 — Orders & Address**: Order model, address on User,
      order status flow
- [x] **Phase 6 — Payments**: Razorpay order creation + signature
      verification (server-side only — never trust frontend success)
- [x] **Phase 7 — Admin**: dashboard aggregation, customer list,
      settings
- [x] **Phase 8 — Hardening**: see "Hardening notes" below

All phases delivered — this is the complete backend.

## Auth (Phase 2)

**One `User` collection**, distinguished by `role: 'user' | 'admin'` and
`provider: 'google' | 'password'`.

**Creating the first admin** — there's intentionally no public admin
signup endpoint. Set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` /
`SEED_ADMIN_NAME` in `.env`, then:
```bash
npm run seed:admin
```
Safe to re-run — it upserts (updates the password if the account
already exists). That admin can then log in via `POST
/api/auth/admin-login`, or later sign in with Google using the same
email and the accounts will link automatically.

**Endpoints:**
| Route | Auth | Notes |
|---|---|---|
| `POST /api/auth/google` | — | body: `{ idToken }` from Firebase client SDK. Creates the user on first sign-in. |
| `POST /api/auth/admin-login` | — | body: `{ email, password }`. Admin accounts only. |
| `POST /api/auth/refresh` | refresh cookie | Rotates the refresh token, returns a new access token. |
| `POST /api/auth/logout` | refresh cookie | Revokes the current session. |
| `GET /api/auth/me` | `Authorization: Bearer <accessToken>` | Returns the current user. |

**Token model:**
- **Access token** (15 min) — JWT, sent in the `Authorization` header
  by the frontend on every request, kept in memory (not
  `localStorage`, to limit XSS exposure). Verified statelessly by
  `requireAuth` — no DB hit per request.
- **Refresh token** (7 days) — JWT in an `HttpOnly`, `path=/api/auth`
  cookie. Its hash is stored in the `RefreshToken` collection so it
  can be revoked; each refresh **rotates** it (old one deleted, new
  one issued). If a refresh token's JWT verifies but its hash isn't
  found in the DB, every session for that user is revoked — this
  catches token reuse after rotation, the standard sign of a leaked
  token.
- Frontend flow: on a 401 from any API call, call `/api/auth/refresh`
  once, retry the original request with the new access token; if the
  refresh also fails, redirect to login.

**Protecting a route later:**
```js
router.get('/admin/orders', requireAuth, requireAdmin, ordersController.list);
router.get('/my-orders', requireAuth, ordersController.myOrders);
```

## Catalog (Phase 3)

Categories and Products are separate collections (per your spec), linked
by `Product.category` (ObjectId ref). Both support lookup by either
Mongo `_id` or a human-readable `slug` on the same `:idOrSlug` param.

**Endpoints:**
| Route | Auth | Notes |
|---|---|---|
| `GET /api/categories` | optional | Public sees only `active`; admin token sees all |
| `GET /api/categories/:idOrSlug` | — | |
| `POST /api/categories` | admin | multipart: `name`, `description?`, `image?` (file) |
| `PATCH /api/categories/:idOrSlug` | admin | same fields, all optional |
| `DELETE /api/categories/:idOrSlug` | admin | 409 if any products still reference it |
| `GET /api/products` | optional | see query params below |
| `GET /api/products/:idOrSlug` | optional | 404 if inactive and not admin |
| `POST /api/products` | admin | multipart: `title`, `description`, `price`, `stock`, `category` (id/slug), `featured?`, `active?`, `images?` (up to 6 files) |
| `PATCH /api/products/:idOrSlug` | admin | same fields, all optional, plus `removeImages` (comma-separated Cloudinary `publicId`s) |
| `DELETE /api/products/:idOrSlug` | admin | also deletes its Cloudinary images |

**`GET /api/products` query params:** `q` (text search on title/description),
`category` (id or slug), `minPrice`, `maxPrice`, `featured` (`true`/`false`),
`page`, `limit` (max 50), `sort` (Mongoose sort string, default `-createdAt`).
Response: `{ products, total, page, pages }`.

**Images** go straight from the multipart upload buffer to Cloudinary
(no temp files on disk) into `craftxyz/categories` or `craftxyz/products`
folders, and each stored image is `{ url, publicId }` — the `publicId`
is what `removeImages` and deletion use to also clean up Cloudinary,
not just the DB record.

**Uploading from the frontend:** send `multipart/form-data`, not JSON,
for create/update. With `fetch`/`axios`, build a `FormData` and append
each field, appending `images` once per file for multiple files:
```js
const form = new FormData();
form.append('title', title);
form.append('price', price);
form.append('category', categoryId);
imageFiles.forEach((file) => form.append('images', file));
await fetch('/api/products', { method: 'POST', body: form, headers: { Authorization: `Bearer ${accessToken}` } });
// don't set Content-Type manually — the browser sets the multipart boundary for you
```

## Cart (Phase 4)

One cart per logged-in user — **all cart routes require `requireAuth`.**
Your original flow doc noted Google login is only required "at
checkout" — if you want guest browsing/cart before login, keep that
client-side (localStorage) in the frontend and only call these
endpoints once the user is signed in; the simplest integration is to
sync the local cart into these endpoints right after login.

| Route | Notes |
|---|---|
| `GET /api/cart` | Returns priced cart: `{ lineItems, unavailable, subtotal, shipping, total }` |
| `POST /api/cart` | body: `{ productId, quantity? }` (default 1). Increments if already in cart. |
| `PATCH /api/cart/item/:productId` | body: `{ quantity }` — `0` removes the item |
| `DELETE /api/cart/item/:productId` | Remove one item |
| `DELETE /api/cart` | Clear cart |

Pricing is never trusted from the client — `GET /api/cart` and checkout
both recompute from live `Product.price` + `Settings.shippingCharge`
(free above `freeShippingThreshold` if set). Items whose product was
deleted/deactivated, or that now exceed available stock, show up in
`unavailable` instead of being silently dropped — checkout refuses to
proceed while any exist (409).

## Address book (Phase 5)

Addresses live on the `User` document (`addresses[]`), not a separate
collection — matches your spec. First address saved becomes the
default automatically; deleting the default promotes the next one.

| Route | Notes |
|---|---|
| `GET /api/users/me/addresses` | |
| `POST /api/users/me/addresses` | body: `{ fullName, phone, state, city, pincode, fullAddress, isDefault? }` |
| `PATCH /api/users/me/addresses/:addressId` | any subset of the same fields |
| `DELETE /api/users/me/addresses/:addressId` | |

## Orders & Payments (Phases 5–6)

There's **no `POST /orders`** — matches your API list exactly. An
order is created as part of checkout:

```
Frontend                          Backend                         Razorpay
   |  POST /payment/create-order     |                                |
   |  { addressId } ---------------->|                                |
   |                                  | price cart, create Order       |
   |                                  | (pending) -------------------->|
   |                                  |<---- razorpay order id --------|
   |<-- { orderId, razorpayOrderId, |                                |
   |      amount, keyId } ----------|                                |
   |                                  |                                |
   |  open Razorpay Checkout widget with keyId + razorpayOrderId       |
   |  user pays ------------------------------------------------------>|
   |<----------- razorpay_payment_id, razorpay_signature --------------|
   |                                  |                                |
   |  POST /payment/verify           |                                |
   |  { orderId, razorpay_order_id,  |                                |
   |    razorpay_payment_id,         |                                |
   |    razorpay_signature } ------->|                                |
   |                                  | recompute HMAC signature,      |
   |                                  | compare (server-side only) --> |
   |                                  | mark order paid, decrement     |
   |                                  | stock, clear cart              |
   |<-- { order } -------------------|                                |
```

| Route | Auth | Notes |
|---|---|---|
| `POST /api/payment/create-order` | user | body: `{ addressId }` |
| `POST /api/payment/verify` | user | body: `{ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }` |
| `GET /api/orders` | user/admin | user sees own orders; admin sees all (`?status=` filter, `?page=`, `?limit=`) |
| `GET /api/orders/:id` | owner or admin | |
| `PATCH /api/orders/:id` | admin | body: `{ orderStatus }` — blocked once `delivered`/`cancelled` |

**Stock is decremented at `/payment/verify`, not at cart-add or
create-order** — reserving stock during checkout would let abandoned
payment attempts lock up inventory. Each item's decrement is an atomic
conditional update (`stock: {$gte: qty}`); if a race with another
buyer means one item can't be decremented after payment already
succeeded, the order still completes (money was taken, so we can't
silently fail) but gets `flaggedForReview: true` with a note — check
for that flag in the admin order view.

**Signature verification** recomputes
`HMAC-SHA256(razorpay_order_id|razorpay_payment_id, RAZORPAY_KEY_SECRET)`
server-side and compares with `crypto.timingSafeEqual` — the frontend
telling us "payment succeeded" is never enough on its own.

## Admin (Phase 7)

Product/Category CRUD are already admin-gated on their own routes
(Phase 3). This phase adds:

| Route | Notes |
|---|---|
| `GET /api/admin/dashboard` | `{ totalOrders, totalProducts, totalCustomers, totalRevenue, recentOrders }` — revenue sums only `paymentStatus: 'paid'` orders |
| `GET /api/admin/customers` | paginated, each with `totalOrders`/`totalSpent` computed via aggregation |
| `GET /api/admin/settings` | website name, contact info, shipping charge, free-shipping threshold |
| `PATCH /api/admin/settings` | any subset of the same fields |

## Hardening notes (Phase 8)

Most of this was baked into each phase as it was built rather than
bolted on at the end:

- **Every** request body is Zod-validated before it reaches a
  controller (`middleware/validate.js`)
- `express-mongo-sanitize` + `hpp` strip operator-injection and
  parameter-pollution attempts on every request (Phase 1)
- Passwords are bcrypt-hashed (cost 12), never selected by default
  (`select: false`), stripped from `toJSON` output as a second
  safety net
- Rate limiting: 300 req/15min globally, 20 req/15min on auth
  endpoints specifically
- Refresh tokens are hashed at rest and rotated on every use, with
  reuse detection that revokes all sessions for that user (Phase 2)
- Every admin-only route is `requireAuth` **and** `requireAdmin` —
  never role-checked by convention alone
- Ownership checks are explicit, not implied: `GET/PATCH
  /orders/:id` checks `order.user === req.user.userId` even though
  the route also allows admins through
- Payment is only ever marked `paid` after server-side HMAC
  verification — the frontend's success callback is not trusted
- One thing deliberately **not** added: an `xss-clean`-style body
  sanitizer. It's unmaintained and this is a JSON API consumed by a
  React frontend that escapes rendered text by default — the actual
  XSS risk here is store-then-render, which is a frontend concern
  (don't `dangerouslySetInnerHTML` product descriptions), not
  something a backend middleware can fix. Say so if you want it
  added anyway.

## Env vars

See `.env.example` — every value the later phases will need is listed
there now so you can start requesting Firebase/Cloudinary/Razorpay
credentials in parallel instead of waiting on each phase.
