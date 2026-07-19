import { z } from 'zod';

/**
 * multipart/form-data fields are always strings — z.coerce.boolean()
 * is a trap here since Boolean('false') === true. This accepts either
 * an actual boolean (JSON requests) or the literal strings
 * 'true'/'false' (form requests) and normalizes to a real boolean.
 */
export const zBoolean = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => (typeof v === 'boolean' ? v : v === 'true'));
