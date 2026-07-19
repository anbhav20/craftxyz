// CategoryCard and the ProductDetails backdrop expect a decorative
// Tailwind gradient + icon per category (`category.colors`,
// `category.icon`, `product.colors`). The backend deliberately doesn't
// store these — they're presentation, not catalog data — so this
// assigns a consistent, good-looking theme per category slug instead.
// Purely client-side; never sent to or read from the API.
const THEMES = [
  { colors: 'from-[#6C63FF] to-[#4338CA]', icon: '◆' },
  { colors: 'from-[#F97316] to-[#B91C1C]', icon: '●' },
  { colors: 'from-[#059669] to-[#065F46]', icon: '▲' },
  { colors: 'from-[#0EA5E9] to-[#1E3A8A]', icon: '■' },
  { colors: 'from-[#DB2777] to-[#831843]', icon: '✦' },
  { colors: 'from-[#78716C] to-[#292524]', icon: '⬡' },
];

const DEFAULT_THEME = THEMES[0];

function hashSlug(slug = '') {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return hash;
}

export function getCategoryTheme(slug) {
  if (!slug) return DEFAULT_THEME;
  return THEMES[hashSlug(slug) % THEMES.length];
}
