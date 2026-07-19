import { getCategoryTheme } from './categoryTheme.js';

const PLACEHOLDER_IMAGE = '/placeholder-product.png';

/**
 * ProductCard/ProductDetails expect { id, image, material, badge,
 * colors } — fields the backend Product model doesn't have (it has
 * title/images[]/category{name,slug}/featured instead). This maps one
 * to the other so those components stay unchanged.
 *
 * `id` is set to the slug (not the Mongo _id) so the existing
 * `/products/:productId` route and ProductCard's Link keep working
 * with readable URLs. `_id` is kept alongside for cart/API calls that
 * need the real database id.
 */
export function mapProduct(product) {
  const categorySlug = product.category?.slug;
  return {
    id: product.slug,
    _id: product._id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: product.price,
    stock: product.stock,
    active: product.active,
    category: product.category?.name,
    categorySlug,
    // No `material` field on the backend yet — placeholder until an
    // admin-settable one is added (e.g. "PLA+", "PETG", "Resin").
    material: product.material || 'PLA+',
    image: product.images?.[0]?.url || PLACEHOLDER_IMAGE,
    badge: product.featured ? 'Featured' : undefined,
    colors: getCategoryTheme(categorySlug).colors,
  };
}
