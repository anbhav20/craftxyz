import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

export const securityHeaders = helmet();

// Strips any keys starting with '$' or containing '.' from
// req.body/query/params — blocks Mongo operator injection
// (e.g. { "email": { "$gt": "" } }).
export const sanitizeInput = mongoSanitize();

// Prevents HTTP parameter pollution (?category=a&category=b tricks).
export const preventParamPollution = hpp();

// General API limiter — generous, just stops abuse/scraping.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Tighter limiter reserved for auth endpoints (login, refresh) in Phase 2 —
// exported now so app.js can wire the general limiter today and routes/auth.js
// can import this one later without touching this file again.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
