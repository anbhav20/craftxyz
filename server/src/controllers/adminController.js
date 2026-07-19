import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSettings as getSettingsDoc, clearSettingsCache } from '../services/settingsService.js';

/** GET /api/admin/dashboard */
export const getDashboard = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalCustomers, revenueAgg, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
  ]);

  new ApiResponse(200, {
    totalOrders,
    totalProducts,
    totalCustomers,
    totalRevenue: revenueAgg[0]?.total || 0,
    recentOrders,
  }).send(res);
});

/** GET /api/admin/customers */
export const listCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));

  const [result] = await User.aggregate([
    { $match: { role: 'user' } },
    { $lookup: { from: 'orders', localField: '_id', foreignField: 'user', as: 'orders' } },
    {
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        createdAt: 1,
        totalOrders: { $size: '$orders' },
        totalSpent: {
          $sum: {
            $map: {
              input: { $filter: { input: '$orders', cond: { $eq: ['$$this.paymentStatus', 'paid'] } } },
              as: 'o',
              in: '$$o.total',
            },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const customers = result?.data || [];
  const total = result?.totalCount[0]?.count || 0;

  new ApiResponse(200, { customers, total, page, pages: Math.ceil(total / limit) }).send(res);
});

/** GET /api/admin/settings */
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDoc();
  new ApiResponse(200, { settings }).send(res);
});

/** PATCH /api/admin/settings */
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  Object.assign(settings, req.body);
  await settings.save();
  clearSettingsCache();
  new ApiResponse(200, { settings }, 'Settings updated').send(res);
});

/** GET /api/admin/admins — lets an admin see who else has admin access */
export const listAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).sort('-createdAt');
  new ApiResponse(200, { admins }).send(res);
});

/**
 * POST /api/admin/admins
 * The in-app alternative to the `seed:admin` script/`.env` values —
 * once at least one admin exists, they can create more this way
 * without touching the server's environment at all.
 */
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const admin = await User.create({ name, email, password, role: 'admin', provider: 'password' });
  new ApiResponse(201, { admin }, 'Admin account created').send(res);
});
