# Testing the backend

## Automated: `npm run test:smoke`

Runs a full integration pass against a **running server + real
database** — it's not a mocked unit-test suite, it's the actual API
being exercised end-to-end.

```bash
# terminal 1
npm run dev

# terminal 2
npm run test:smoke
```

What it covers, in order:
1. `GET /api/health`
2. Admin login (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` from `.env` — run `npm run seed:admin` first if you haven't)
3. Category create/list/get
4. Product create/list/get/update (price change is asserted, not just status code)
5. **Signs a test-user access token directly** (see note below) instead of logging in
6. Address book: add an address
7. Cart: add item, verify computed subtotal, update quantity, verify recomputed subtotal
8. Checkout: `POST /api/payment/create-order` — asserts a real Razorpay order comes back
9. `GET /api/orders` — confirms the created order is visible to its owner
10. Admin dashboard, customers, settings
11. Auth guard checks: no token → 401, wrong role → 403
12. **Cleanup** — deletes the test product/category/user/cart/orders it created, so it's safe to re-run

Exits with code `1` and a list of failed steps if anything breaks —
safe to wire into CI later.

### Why it signs a token instead of logging in as a customer

Your spec makes customer login **Google-only**. That's a real browser
popup — there's no server-side way to obtain a valid Firebase ID
token from a script. So the smoke test connects to MongoDB directly,
upserts a test user, and signs an access token for it using the same
`signAccessToken()` the server itself uses (same secret, same shape).
It's exercising the *real* `requireAuth` middleware on the *real*
routes — the only thing skipped is the Google popup itself, not any
backend logic. Nothing about the API changes for this; the script
just has an extra capability (direct DB + secret access) that only
makes sense for a local dev/CI script, never expose that logic to
anything user-facing.

### What it deliberately does NOT test

- **`POST /api/auth/google`** — needs a real Firebase ID token from a
  browser sign-in. Test manually (see below) once you've wired up
  the frontend's Google login button.
- **`POST /api/payment/verify`** — needs a completed Razorpay
  Checkout payment, which needs the Checkout widget running in a
  browser. The smoke test confirms `create-order` works (order +
  Razorpay order are created correctly); verification is the
  frontend-integration step.
- **Image upload** (`image`/`images` multipart fields) — the smoke
  test creates category/product without files, so it doesn't touch
  Cloudinary. Test manually with a real file (below) once you've
  confirmed your Cloudinary credentials.

## Manual: the parts that need a browser or a real file

**Google login** — once the frontend has a working Google sign-in
button, watch the Network tab for the `POST /api/auth/google` call
and confirm it returns `200` with a user object and sets the
`refreshToken` cookie.

**Razorpay payment completion** — after `create-order` returns
`razorpayOrderId` + `keyId`, open Razorpay Checkout in the frontend
with those values. In **test mode**, Razorpay accepts card
`4111 1111 1111 1111`, any future expiry, any CVV. On success it
returns `razorpay_payment_id` + `razorpay_signature` — feed those into
`POST /api/payment/verify` and confirm the order flips to
`paymentStatus: 'paid'`.

**Image upload** — with a real Cloudinary account configured:
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer <adminAccessToken>" \
  -F "name=Test Category" \
  -F "image=@/path/to/some-image.jpg"
```
Check the response's `category.image.url` opens in a browser and that
the asset shows up in your Cloudinary media library.

## Quick manual reference (curl)

Get an admin token:
```bash
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"<SEED_ADMIN_EMAIL>","password":"<SEED_ADMIN_PASSWORD>"}'
```

Everything else follows the same pattern — `Authorization: Bearer
<accessToken>` header, JSON body for non-file routes, `-F` multipart
for category/product create/update. Full route list with bodies is in
`README.md`.
