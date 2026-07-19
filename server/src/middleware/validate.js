import { ApiError } from '../utils/ApiError.js';

/**
 * router.post('/x', validate(someZodSchema), handler)
 * Validates req.body against the given schema, replaces req.body with
 * the parsed (and type-coerced) result, or forwards a 400 with the
 * zod issue list.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(ApiError.badRequest('Validation failed', result.error.flatten().fieldErrors));
  }
  req.body = result.data;
  next();
};
