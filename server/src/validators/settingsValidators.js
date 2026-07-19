import { z } from 'zod';

export const updateSettingsSchema = z.object({
  websiteName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  shippingCharge: z.coerce.number().min(0).optional(),
  freeShippingThreshold: z.coerce.number().min(0).nullable().optional(),
});
