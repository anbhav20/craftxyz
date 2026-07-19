import { z } from 'zod';
import { zBoolean } from '../utils/zHelpers.js';

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().nonnegative('Price cannot be negative'),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  featured: zBoolean.optional(),
  active: zBoolean.optional(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  category: z.string().min(1).optional(),
  featured: zBoolean.optional(),
  active: zBoolean.optional(),
  // Comma-separated Cloudinary publicIds to delete on update.
  removeImages: z.string().optional(),
});
