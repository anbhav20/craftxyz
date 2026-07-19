import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Cart } from '../src/models/Cart.js';
import { Order } from '../src/models/Order.js';
import { signAccessToken } from '../src/utils/tokens.js';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:5000';
const TEST_USER_EMAIL = 'smoke-test-user@craftxyz.test';
const RUN_TAG = Date.now(); // keeps category/product names unique across runs

let pass = 0;
let fail = 0;
const failures = [];

function log(ok, label, extra = '') {
  if (ok) {
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  \x1b[31m✗\x1b[0m ${label} ${extra}`);
  }
}

async function api(method, path, { token, body, isForm } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let fetchBody = body;
  if (body && !isForm) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: fetchBody });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response
  }
  return { status: res.status, ok: res.ok, json };
}

async function run() {
  console.log(`\nSmoke testing ${BASE_URL}\n`);
  await connectDB();

  let adminToken;
  let userToken;
  let categorySlug;
  let productSlug;
  let addressId;
  let createdOrderId;

  try {
    // ── Health ────────────────────────────────────────────
    {
      const r = await api('GET', '/api/health');
      log(r.ok, 'GET /api/health');
    }

    // ── Admin login ──────────────────────────────────────
    {
      const r = await api('POST', '/api/auth/admin-login', {
        body: {
          email: process.env.SEED_ADMIN_EMAIL,
          password: process.env.SEED_ADMIN_PASSWORD,
        },
      });
      log(r.ok && r.json?.data?.accessToken, 'POST /api/auth/admin-login', JSON.stringify(r.json));
      adminToken = r.json?.data?.accessToken;
    }
    if (!adminToken) throw new Error('Cannot continue without an admin token — check SEED_ADMIN_* in .env and that you ran `npm run seed:admin`.');

    // ── Category CRUD ────────────────────────────────────
    {
      const r = await api('POST', '/api/categories', {
        token: adminToken,
        body: { name: `Smoke Test Category ${RUN_TAG}`, description: 'Created by smoke-test.mjs' },
      });
      log(r.status === 201, 'POST /api/categories', JSON.stringify(r.json));
      categorySlug = r.json?.data?.category?.slug;
    }
    {
      const r = await api('GET', '/api/categories');
      log(r.ok && Array.isArray(r.json?.data?.categories), 'GET /api/categories');
    }
    {
      const r = await api('GET', `/api/categories/${categorySlug}`);
      log(r.ok, `GET /api/categories/${categorySlug}`);
    }

    // ── Product CRUD ─────────────────────────────────────
    {
      const r = await api('POST', '/api/products', {
        token: adminToken,
        body: {
          title: `Smoke Test Product ${RUN_TAG}`,
          description: 'Created by smoke-test.mjs',
          price: '499',
          stock: '10',
          category: categorySlug,
        },
      });
      log(r.status === 201, 'POST /api/products', JSON.stringify(r.json));
      productSlug = r.json?.data?.product?.slug;
    }
    {
      const r = await api('GET', '/api/products');
      log(r.ok && Array.isArray(r.json?.data?.products), 'GET /api/products');
    }
    {
      const r = await api('GET', `/api/products/${productSlug}`);
      log(r.ok, `GET /api/products/${productSlug}`);
    }
    {
      const r = await api('PATCH', `/api/products/${productSlug}`, {
        token: adminToken,
        body: { price: '599' },
      });
      log(r.ok && r.json?.data?.product?.price === 599, `PATCH /api/products/${productSlug}`, JSON.stringify(r.json));
    }

    // ── Stand in for a logged-in customer ────────────────
    // Real customer login is Google-only (browser popup), so this
    // script signs a token directly for a DB-seeded test user using
    // the same JWT_ACCESS_SECRET the server verifies with. This is a
    // local dev shortcut, not a backdoor in the API itself.
    {
      let testUser = await User.findOne({ email: TEST_USER_EMAIL });
      if (!testUser) {
        testUser = await User.create({
          name: 'Smoke Test User',
          email: TEST_USER_EMAIL,
          provider: 'password',
          role: 'user',
        });
      }
      userToken = signAccessToken(testUser);
      log(!!userToken, 'Signed test-user access token (bypasses Google login for automation)');
    }

    // ── Address book ──────────────────────────────────────
    {
      const r = await api('POST', '/api/users/me/addresses', {
        token: userToken,
        body: {
          fullName: 'Smoke Test',
          phone: '9999999999',
          state: 'Uttar Pradesh',
          city: 'Lucknow',
          pincode: '226001',
          fullAddress: '123 Test Lane',
        },
      });
      log(r.status === 201, 'POST /api/users/me/addresses', JSON.stringify(r.json));
      addressId = r.json?.data?.addresses?.[0]?._id;
    }

    // ── Cart ──────────────────────────────────────────────
    {
      const r = await api('GET', `/api/products/${productSlug}`);
      const productId = r.json?.data?.product?._id;

      const add = await api('POST', '/api/cart', { token: userToken, body: { productId, quantity: 2 } });
      log(add.ok, 'POST /api/cart (add item)', JSON.stringify(add.json));

      const get = await api('GET', '/api/cart', { token: userToken });
      log(get.ok && get.json?.data?.subtotal === 599 * 2, 'GET /api/cart (pricing correct)', JSON.stringify(get.json));

      const update = await api('PATCH', `/api/cart/item/${productId}`, {
        token: userToken,
        body: { quantity: 1 },
      });
      log(update.ok && update.json?.data?.subtotal === 599, 'PATCH /api/cart/item/:productId');
    }

    // ── Checkout (create-order) ──────────────────────────
    // Stops here — completing payment requires the Razorpay Checkout
    // widget in a real browser. This confirms our order + Razorpay
    // order are created correctly; /payment/verify must be tested
    // manually from the frontend (see TESTING.md).
    {
      const r = await api('POST', '/api/payment/create-order', {
        token: userToken,
        body: { addressId },
      });
      log(
        r.status === 201 && !!r.json?.data?.razorpayOrderId,
        'POST /api/payment/create-order',
        JSON.stringify(r.json)
      );
      createdOrderId = r.json?.data?.orderId;
    }
    {
      const r = await api('GET', '/api/orders', { token: userToken });
      log(r.ok && r.json?.data?.orders?.some((o) => o._id === createdOrderId), 'GET /api/orders (own order visible)');
    }

    // ── Admin views ───────────────────────────────────────
    {
      const r = await api('GET', '/api/admin/dashboard', { token: adminToken });
      log(r.ok && typeof r.json?.data?.totalOrders === 'number', 'GET /api/admin/dashboard');
    }
    {
      const r = await api('GET', '/api/admin/customers', { token: adminToken });
      log(r.ok && Array.isArray(r.json?.data?.customers), 'GET /api/admin/customers');
    }
    {
      const r = await api('GET', '/api/admin/settings', { token: adminToken });
      log(r.ok, 'GET /api/admin/settings');
    }

    // ── Auth guard checks ─────────────────────────────────
    {
      const r = await api('POST', '/api/products', { body: { title: 'nope' } });
      log(r.status === 401, 'POST /api/products with no token → 401');
    }
    {
      const r = await api('POST', '/api/products', { token: userToken, body: { title: 'nope' } });
      log(r.status === 403, 'POST /api/products with user (non-admin) token → 403');
    }
  } catch (err) {
    console.error('\nSmoke test aborted:', err.message);
    fail++;
  } finally {
    // ── Cleanup ───────────────────────────────────────────
    console.log('\nCleaning up test data...');
    if (adminToken && productSlug) await api('DELETE', `/api/products/${productSlug}`, { token: adminToken });
    if (adminToken && categorySlug) await api('DELETE', `/api/categories/${categorySlug}`, { token: adminToken });
    const testUser = await User.findOne({ email: TEST_USER_EMAIL });
    if (testUser) {
      await Cart.deleteOne({ user: testUser._id });
      await Order.deleteMany({ user: testUser._id });
      await User.deleteOne({ _id: testUser._id });
    }
    await disconnectDB();
  }

  console.log(`\n${pass} passed, ${fail} failed\n`);
  if (failures.length) {
    console.log('Failed:', failures.join(', '), '\n');
    process.exit(1);
  }
  process.exit(0);
}

run();
