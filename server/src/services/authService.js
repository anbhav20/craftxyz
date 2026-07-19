import { RefreshToken } from '../models/RefreshToken.js';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '../utils/tokens.js';

/**
 * Issues a fresh access+refresh token pair for a user, persists the
 * refresh token's hash so it can later be revoked/rotated, and sets
 * the HttpOnly cookie on the response. Returns the access token so the
 * controller can put it in the JSON body.
 */
export async function issueTokens(user, res) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, expiresAt } = signRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  return accessToken;
}

/**
 * Deletes a specific stored refresh token (used on both normal
 * rotation and logout) by its raw cookie value.
 */
export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  await RefreshToken.deleteOne({ tokenHash: hashToken(rawToken) });
}

/**
 * Revokes every session for a user — used when we detect a refresh
 * token being reused after it was already rotated, which usually
 * means it leaked. Safer to log the whole account out than to trust
 * any of its outstanding sessions.
 */
export async function revokeAllSessionsForUser(userId) {
  await RefreshToken.deleteMany({ user: userId });
}
