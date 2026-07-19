import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  addressId: z.string().min(1, 'addressId is required'),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1), // our Order _id
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
