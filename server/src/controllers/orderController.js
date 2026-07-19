import { Order, ORDER_STATUSES } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const TERMINAL_STATUSES = ['delivered', 'cancelled'];

/**
 * GET /api/orders
 * Admin: every order, optionally filtered by ?status=. Regular user:
 * only their own orders. Same endpoint, different scope by role — the
 * frontend doesn't need a separate admin route to list orders.
 */
export const listOrders = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const filter = isAdmin ? {} : { user: req.user.userId };
  if (req.query.status) filter.orderStatus = req.query.status;

  let query = Order.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit);
  if (isAdmin) query = query.populate('user', 'name email');

  const [orders, total] = await Promise.all([query, Order.countDocuments(filter)]);

  new ApiResponse(200, { orders, total, page, pages: Math.ceil(total / limit) }).send(res);
});

/** GET /api/orders/:id — owner or admin */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = order.user._id.toString() === req.user.userId;
  if (!isOwner && req.user.role !== 'admin') throw ApiError.forbidden();

  new ApiResponse(200, { order }).send(res);
});

/** PATCH /api/orders/:id — admin only. body: { orderStatus } */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (TERMINAL_STATUSES.includes(order.orderStatus)) {
    throw ApiError.badRequest(`Order is already ${order.orderStatus} and cannot be changed`);
  }

  order.orderStatus = req.body.orderStatus;
  await order.save();

  new ApiResponse(200, { order }, 'Order status updated').send(res);
});
