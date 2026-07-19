import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokens.js';

/**
 * Expects `Authorization: Bearer <accessToken>`. On success attaches
 * { userId, role, email } to req.user. Does NOT hit the database —
 * that's deliberate, it's what keeps access-token auth cheap on every
 * request. Anything that needs fresh user data (e.g. GET /auth/me)
 * loads the User separately in its own controller.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

/**
 * Mount after requireAuth: router.get('/x', requireAuth, requireAdmin, handler)
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}
