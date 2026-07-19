import { z } from 'zod';
import { zBoolean } from '../utils/zHelpers.js';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  active: zBoolean.optional(),
});
