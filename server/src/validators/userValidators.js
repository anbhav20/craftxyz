import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(6),
  state: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().min(3),
  fullAddress: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addressSchema.partial();
