import crypto from 'crypto';
import { firebaseAuth } from '../config/firebase.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  verifyRefreshToken,
  hashToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '../utils/tokens.js';
import { issueTokens, revokeRefreshToken, revokeAllSessionsForUser } from '../services/authService.js';
import { sendPasswordResetEmail } from '../services/mailerService.js';

/**
 * POST /api/auth/google
 * Used by both regular users and admins signing in with Google. The
 * frontend runs the Firebase popup itself and sends us the resulting
 * ID token — we verify it server-side and never trust anything else
 * the client claims about the user.
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  let decoded;
  try {
    decoded = await firebaseAuth.verifyIdToken(idToken);
  } catch {
    throw ApiError.unauthorized('Invalid Google sign-in token');
  }

  const { uid, email, name, picture } = decoded;
  if (!email) throw ApiError.badRequest('Google account has no email');

  // Link by firebaseUid first; fall back to email so a pre-existing
  // admin (created via email/password) can also sign in with Google
  // using the same address without creating a duplicate account.
  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user && !user.firebaseUid) {
      user.firebaseUid = uid;
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      firebaseUid: uid,
      provider: 'google',
      role: 'user',
    });
  }

  const accessToken = await issueTokens(user, res);
  new ApiResponse(200, { accessToken, user }, 'Signed in').send(res);
});

/**
 * POST /api/auth/admin-login
 * Email + password, admin accounts only. Deliberately does not reveal
 * whether the email exists or the password was wrong separately —
 * same generic message either way.
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), provider: 'password' }).select(
    '+password'
  );

  if (!user || user.role !== 'admin' || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = await issueTokens(user, res);
  new ApiResponse(200, { accessToken, user }, 'Signed in').send(res);
});

/**
 * POST /api/auth/refresh
 * Reads the HttpOnly cookie, verifies + rotates it. If the JWT is
 * valid but its hash isn't in the DB, it's either expired-and-cleaned-up
 * or already-used-once (rotation) — in the latter case we treat it as
 * a possible leak and kill every session for that user.
 */
export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!rawToken) throw ApiError.unauthorized('No refresh token provided');

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
  if (!stored) {
    await revokeAllSessionsForUser(payload.userId);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw ApiError.unauthorized('Session no longer valid, please sign in again');
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    await stored.deleteOne();
    throw ApiError.unauthorized('Account no longer exists');
  }

  // Rotation: this token is single-use — delete it, a new one gets
  // created by issueTokens below.
  await stored.deleteOne();
  const accessToken = await issueTokens(user, res);

  new ApiResponse(200, { accessToken }, 'Token refreshed').send(res);
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await revokeRefreshToken(rawToken);
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  new ApiResponse(200, null, 'Signed out').send(res);
});

/**
 * GET /api/auth/me
 * Requires requireAuth. Loads fresh data since the access token
 * payload is intentionally minimal.
 */
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw ApiError.notFound('User not found');
  new ApiResponse(200, { user }, 'Current user').send(res);
});

// Deliberately vague either way — never confirms or denies whether an
// email has an account, so this endpoint can't be used to enumerate
// admin email addresses.
const FORGOT_PASSWORD_MESSAGE = 'If an account exists with that email, a reset link has been sent.';

/**
 * POST /api/auth/forgot-password
 * Only ever applies to provider: 'password' accounts (admins) — Google
 * accounts have no password to reset.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase(), provider: 'password' });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Any previous unused reset link for this account is invalidated
    // by a new request — only the most recent link should work.
    await PasswordResetToken.deleteMany({ user: user._id });
    await PasswordResetToken.create({ user: user._id, tokenHash: hashToken(rawToken), expiresAt });

    const resetLink = `${process.env.CLIENT_URL}/admin/reset-password?token=${rawToken}`;
    try {
      await sendPasswordResetEmail(user.email, resetLink);
    } catch (err) {
      // Swallow — the response stays generic either way, and a delivery
      // failure here shouldn't reveal whether the account exists.
      console.error('[auth] failed to send password reset email:', err.message);
    }
  }

  new ApiResponse(200, null, FORGOT_PASSWORD_MESSAGE).send(res);
});

/**
 * POST /api/auth/reset-password
 * Also revokes every existing session for the account — if the reset
 * was triggered because the password leaked, any session an attacker
 * already had gets killed too, not just future logins.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const stored = await PasswordResetToken.findOne({ tokenHash: hashToken(token) });
  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  const user = await User.findById(stored.user);
  if (!user) {
    await stored.deleteOne();
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  user.password = password; // pre-save hook re-hashes
  await user.save();

  await PasswordResetToken.deleteMany({ user: user._id });
  await revokeAllSessionsForUser(user._id);

  new ApiResponse(200, null, 'Password updated — you can now sign in').send(res);
});
