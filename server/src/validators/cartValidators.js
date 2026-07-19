import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.coerce.number().int().positive().default(1),
});

// 0 is allowed here as a convenience for "set quantity to 0" == remove.
export const updateQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(0),
});
