import { z } from 'zod';

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

// Deliberately just "non-empty" — this is a login form, not a signup
// form. Enforcing min-length here would mean a short-but-wrong password
// gets a different error ("validation failed") than a long-but-wrong
// one ("invalid email or password"), which leaks password-policy
// details to anyone probing the login endpoint. Every wrong password,
// short or long, should hit the same generic credential check below.
export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});