import { verifyAccessToken } from '../utils/tokens.js';

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(header.slice('Bearer '.length));
    } catch {
      // Invalid/expired token on an optional route just means "not logged in".
    }
  }
  next();
}
