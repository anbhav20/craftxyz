import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Access token: short-lived, sent in the Authorization header by the
 * frontend on every request, never touches a cookie. Payload is
 * intentionally minimal — just enough for the auth middleware to
 * authorize a request without a DB hit.
 */
export function signAccessToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

/**
 * Refresh token: long-lived, sent only as an HttpOnly cookie. Returns
 * both the signed JWT and its expiry as a Date, so the caller can
 * store the expiry alongside the hash in RefreshToken without having
 * to separately parse "7d" style duration strings.
 */
export function signRefreshToken(user) {
  const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
  const { exp } = jwt.decode(token);
  return { token, expiresAt: new Date(exp * 1000) };
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// We never store raw refresh tokens (see models/RefreshToken.js) — this
// is the one-way hash used both when storing and when looking one up.
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const REFRESH_COOKIE_NAME = 'refreshToken';

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth', // only sent to auth endpoints, not every request
  maxAge: 7 * 24 * 60 * 60 * 1000, // fallback; actual expiry driven by the JWT itself
};
