import { getCategoryTheme } from './categoryTheme.js';

export function mapCategory(category) {
  const theme = getCategoryTheme(category.slug);
  return {
    name: category.name,
    slug: category.slug,
    image: category.image?.url,
    colors: theme.colors,
    icon: theme.icon,
    active: category.active,
    // `count` isn't set here — a single category has no way to know
    // how many products reference it. See selectCategoriesWithCounts
    // in features/categories/categoriesSlice.js, which combines this
    // with the products slice.
  };
}
