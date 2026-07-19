const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/**
 * Lets routes like GET /products/:idOrSlug accept either the Mongo
 * _id or the human-readable slug, so the frontend can link to
 * /products/wireless-charger instead of a raw ObjectId.
 */
export function byIdOrSlug(idOrSlug) {
  return OBJECT_ID_RE.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
}
