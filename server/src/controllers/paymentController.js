import crypto from 'crypto';
import { razorpay } from '../config/razorpay.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Cart } from '../models/Cart.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPopulatedCart, priceCart } from '../services/cartService.js';

/**
 * POST /api/payment/create-order
 * body: { addressId }
 * Prices the user's current server-side cart (never trusts a
 * frontend-supplied total), creates our Order record in `pending`
 * state, then creates the matching Razorpay order. Returns what the
 * frontend needs to open Razorpay Checkout.
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { addressId } = req.body;

  const user = await User.findById(req.user.userId);
  const address = user.addresses.id(addressId);
  if (!address) throw ApiError.badRequest('Address not found');

  const cart = await getPopulatedCart(req.user.userId);
  if (cart.items.length === 0) throw ApiError.badRequest('Cart is empty');

  const pricing = await priceCart(cart);
  if (pricing.unavailable.length > 0) {
    throw ApiError.conflict('Some items in your cart need attention before checkout', pricing.unavailable);
  }
  if (pricing.lineItems.length === 0) throw ApiError.badRequest('Cart is empty');

  const order = await Order.create({
    user: user._id,
    items: pricing.lineItems,
    address: {
      fullName: address.fullName,
      phone: address.phone,
      state: address.state,
      city: address.city,
      pincode: address.pincode,
      fullAddress: address.fullAddress,
    },
    subtotal: pricing.subtotal,
    shipping: pricing.shipping,
    total: pricing.total,
  });

  // Razorpay wants the amount in the smallest currency unit (paise for INR).
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: 'INR',
    receipt: order._id.toString(),
  });

  order.razorpay.orderId = razorpayOrder.id;
  await order.save();

  new ApiResponse(201, {
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  }, 'Order created').send(res);
});

/**
 * POST /api/payment/verify
 * body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * This is the only place an order is ever marked paid. The frontend's
 * "payment succeeded" callback is never trusted on its own — we
 * recompute the HMAC signature ourselves and compare.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== req.user.userId) throw ApiError.forbidden();

  if (order.paymentStatus !== 'pending') {
    throw ApiError.conflict(`Order payment already ${order.paymentStatus}`);
  }
  if (order.razorpay.orderId !== razorpay_order_id) {
    throw ApiError.badRequest('Order ID mismatch');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const signaturesMatch =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

  if (!signaturesMatch) {
    order.paymentStatus = 'failed';
    await order.save();
    throw ApiError.badRequest('Payment verification failed');
  }

  // Decrement stock atomically per item. If another order beat this
  // one to the last unit of something, we don't undo the payment
  // (already taken) — flag it for the admin instead of overselling
  // silently or leaving the customer's money in limbo.
  const insufficientItems = [];
  for (const item of order.items) {
    const result = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (result.modifiedCount === 0) insufficientItems.push(item.title);
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.razorpay.paymentId = razorpay_payment_id;
  order.razorpay.signature = razorpay_signature;
  if (insufficientItems.length > 0) {
    order.flaggedForReview = true;
    order.reviewNote = `Stock ran out after payment for: ${insufficientItems.join(', ')}`;
  }
  await order.save();

  await Cart.updateOne({ user: req.user.userId }, { $set: { items: [] } });

  new ApiResponse(200, { order }, 'Payment verified').send(res);
});
