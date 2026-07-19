import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadMany, destroyMany } from '../utils/cloudinaryUpload.js';
import { slugify } from '../utils/slugify.js';
import { byIdOrSlug } from '../utils/queryHelpers.js';

/**
 * GET /api/products
 * Query params: q, category (id or slug), minPrice, maxPrice, featured,
 * page, limit, sort. Public callers only ever see active products;
 * an admin token (via optionalAuth) sees everything.
 */
export const listProducts = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const { q, category, minPrice, maxPrice, featured, sort = '-createdAt' } = req.query;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

  const filter = {};
  if (!isAdmin) filter.active = true;

  if (category) {
    const categoryDoc = await Category.findOne(byIdOrSlug(category));
    if (!categoryDoc) {
      return new ApiResponse(200, { products: [], total: 0, page, pages: 0 }).send(res);
    }
    filter.category = categoryDoc._id;
  }

  if (q) filter.$text = { $search: q };
  if (featured !== undefined) filter.featured = featured === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  new ApiResponse(200, { products, total, page, pages: Math.ceil(total / limit) }).send(res);
});

/** GET /api/products/:idOrSlug */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne(byIdOrSlug(req.params.idOrSlug)).populate(
    'category',
    'name slug'
  );
  if (!product) throw ApiError.notFound('Product not found');
  if (!product.active && req.user?.role !== 'admin') throw ApiError.notFound('Product not found');

  new ApiResponse(200, { product }).send(res);
});

/** POST /api/products — admin, multipart with optional `images` field (up to 6) */
export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, stock, category, featured, active } = req.body;

  const categoryDoc = await Category.findOne(byIdOrSlug(category));
  if (!categoryDoc) throw ApiError.badRequest('Category does not exist');

  const slug = slugify(title);
  if (await Product.findOne({ slug })) {
    throw ApiError.conflict('A product with this title already exists');
  }

  const images = req.files?.length ? await uploadMany(req.files, 'craftxyz/products') : [];

  const product = await Product.create({
    title,
    slug,
    description,
    price,
    stock,
    category: categoryDoc._id,
    featured: featured ?? false,
    active: active ?? true,
    images,
  });

  new ApiResponse(201, { product }, 'Product created').send(res);
});

/** PATCH /api/products/:idOrSlug — admin */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne(byIdOrSlug(req.params.idOrSlug));
  if (!product) throw ApiError.notFound('Product not found');

  const { title, description, price, stock, category, featured, active, removeImages } = req.body;

  if (title && title !== product.title) {
    const newSlug = slugify(title);
    const clash = await Product.findOne({ slug: newSlug, _id: { $ne: product._id } });
    if (clash) throw ApiError.conflict('A product with this title already exists');
    product.title = title;
    product.slug = newSlug;
  }
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (featured !== undefined) product.featured = featured;
  if (active !== undefined) product.active = active;

  if (category) {
    const categoryDoc = await Category.findOne(byIdOrSlug(category));
    if (!categoryDoc) throw ApiError.badRequest('Category does not exist');
    product.category = categoryDoc._id;
  }

  if (removeImages) {
    const idsToRemove = removeImages.split(',').map((s) => s.trim()).filter(Boolean);
    await destroyMany(idsToRemove);
    product.images = product.images.filter((img) => !idsToRemove.includes(img.publicId));
  }

  if (req.files?.length) {
    const newImages = await uploadMany(req.files, 'craftxyz/products');
    product.images.push(...newImages);
  }

  await product.save();
  new ApiResponse(200, { product }, 'Product updated').send(res);
});

/** DELETE /api/products/:idOrSlug — admin */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne(byIdOrSlug(req.params.idOrSlug));
  if (!product) throw ApiError.notFound('Product not found');

  const publicIds = product.images.map((img) => img.publicId).filter(Boolean);
  if (publicIds.length) await destroyMany(publicIds);

  await product.deleteOne();
  new ApiResponse(200, null, 'Product deleted').send(res);
});
