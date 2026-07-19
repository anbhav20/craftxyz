import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBuffer, destroyMany } from '../utils/cloudinaryUpload.js';
import { slugify } from '../utils/slugify.js';
import { byIdOrSlug } from '../utils/queryHelpers.js';

/**
 * GET /api/categories
 * Public sees only active categories; an admin token also sees inactive ones.
 */
export const listCategories = asyncHandler(async (req, res) => {
  const filter = req.user?.role === 'admin' ? {} : { active: true };
  const categories = await Category.find(filter).sort({ name: 1 });
  new ApiResponse(200, { categories }).send(res);
});

/** GET /api/categories/:idOrSlug */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne(byIdOrSlug(req.params.idOrSlug));
  if (!category) throw ApiError.notFound('Category not found');
  new ApiResponse(200, { category }).send(res);
});

/** POST /api/categories — admin, multipart with optional `image` field */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const slug = slugify(name);

  if (await Category.findOne({ slug })) {
    throw ApiError.conflict('A category with this name already exists');
  }

  let image;
  if (req.file) {
    const result = await uploadBuffer(req.file.buffer, 'craftxyz/categories');
    image = { url: result.secure_url, publicId: result.public_id };
  }

  const category = await Category.create({ name, slug, description, image });
  new ApiResponse(201, { category }, 'Category created').send(res);
});

/** PATCH /api/categories/:idOrSlug — admin */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne(byIdOrSlug(req.params.idOrSlug));
  if (!category) throw ApiError.notFound('Category not found');

  const { name, description, active } = req.body;

  if (name && name !== category.name) {
    const newSlug = slugify(name);
    const clash = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });
    if (clash) throw ApiError.conflict('A category with this name already exists');
    category.name = name;
    category.slug = newSlug;
  }
  if (description !== undefined) category.description = description;
  if (active !== undefined) category.active = active;

  if (req.file) {
    if (category.image?.publicId) await destroyMany([category.image.publicId]);
    const result = await uploadBuffer(req.file.buffer, 'craftxyz/categories');
    category.image = { url: result.secure_url, publicId: result.public_id };
  }

  await category.save();
  new ApiResponse(200, { category }, 'Category updated').send(res);
});

/** DELETE /api/categories/:idOrSlug — admin. Blocked while products still reference it. */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne(byIdOrSlug(req.params.idOrSlug));
  if (!category) throw ApiError.notFound('Category not found');

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw ApiError.conflict(
      `Cannot delete — ${productCount} product(s) still use this category. Reassign or delete them first.`
    );
  }

  if (category.image?.publicId) await destroyMany([category.image.publicId]);
  await category.deleteOne();
  new ApiResponse(200, null, 'Category deleted').send(res);
});
