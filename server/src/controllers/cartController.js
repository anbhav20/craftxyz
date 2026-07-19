import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getOrCreateCart, getPopulatedCart, priceCart } from '../services/cartService.js';

async function respondWithCart(userId, res, statusCode = 200, message = 'Cart') {
  const cart = await getPopulatedCart(userId);
  const pricing = await priceCart(cart);
  new ApiResponse(statusCode, { cartId: cart._id, ...pricing }, message).send(res);
}

/** GET /api/cart */
export const getCart = asyncHandler(async (req, res) => {
  await respondWithCart(req.user.userId, res);
});

/** POST /api/cart — body: { productId, quantity? } */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findOne({ _id: productId, active: true });
  if (!product) throw ApiError.notFound('Product not found');

  const cart = await getOrCreateCart(req.user.userId);
  const existing = cart.items.find((item) => item.product.toString() === productId);
  const desiredQuantity = (existing?.quantity || 0) + quantity;

  if (desiredQuantity > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} in stock`);
  }

  if (existing) {
    existing.quantity = desiredQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();

  await respondWithCart(req.user.userId, res, 200, 'Added to cart');
});

/** PATCH /api/cart/item/:productId — body: { quantity } (0 removes the item) */
export const updateItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user.userId);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw ApiError.notFound('Item not in cart');

  if (quantity === 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    const product = await Product.findById(productId);
    if (!product || !product.active) throw ApiError.notFound('Product not found');
    if (quantity > product.stock) throw ApiError.badRequest(`Only ${product.stock} in stock`);
    item.quantity = quantity;
  }

  await cart.save();
  await respondWithCart(req.user.userId, res, 200, 'Cart updated');
});

/** DELETE /api/cart/item/:productId */
export const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.userId);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  await respondWithCart(req.user.userId, res, 200, 'Item removed');
});

/** DELETE /api/cart */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.userId);
  cart.items = [];
  await cart.save();
  await respondWithCart(req.user.userId, res, 200, 'Cart cleared');
});
