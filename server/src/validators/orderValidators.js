import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(ORDER_STATUSES),
});
