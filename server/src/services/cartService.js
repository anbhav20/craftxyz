import { Cart } from '../models/Cart.js';
import { getSettings } from './settingsService.js';

export async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

export async function getPopulatedCart(userId) {
  const cart = await getOrCreateCart(userId);
  await cart.populate('items.product', 'title price images stock active');
  return cart;
}

/**
 * Turns a populated cart into priced line items + totals. Items whose
 * product was deleted, deactivated, or no longer has enough stock are
 * excluded from pricing and reported in `unavailable` rather than
 * silently dropped from the cart — the frontend can show "2 items
 * need attention" and let the user fix their cart, and checkout
 * (payment/create-order) refuses to proceed while any exist.
 */
export async function priceCart(cart) {
  const settings = await getSettings();

  const lineItems = [];
  const unavailable = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.active) {
      unavailable.push({ productId: item.product?._id ?? item.product, reason: 'No longer available' });
      continue;
    }
    if (product.stock < item.quantity) {
      unavailable.push({
        productId: product._id,
        reason: `Only ${product.stock} left in stock`,
        availableStock: product.stock,
      });
      continue;
    }
    lineItems.push({
      product: product._id,
      title: product.title,
      image: product.images?.[0]?.url,
      price: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    });
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);

  let shipping = 0;
  if (lineItems.length > 0) {
    shipping =
      settings.freeShippingThreshold != null && subtotal >= settings.freeShippingThreshold
        ? 0
        : settings.shippingCharge;
  }

  return { lineItems, unavailable, subtotal, shipping, total: subtotal + shipping };
}
