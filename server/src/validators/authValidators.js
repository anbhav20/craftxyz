import { z } from 'zod';

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
