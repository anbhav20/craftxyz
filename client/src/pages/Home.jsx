import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { fetchProducts, selectAllProducts, selectProductsStatus } from '../features/products/productsSlice.js';
import {
  fetchCategories,
  selectCategoriesWithCounts,
  selectCategoriesStatus,
} from '../features/categories/categoriesSlice.js';
import { addToCartSmart } from '../features/cart/cartSlice.js';
import { toggleWishlist, selectWishlistIds } from '../features/wishlist/wishlistSlice.js';

function Home() {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const products = useAppSelector(selectAllProducts);
  const productsStatus = useAppSelector(selectProductsStatus);
  const categories = useAppSelector(selectCategoriesWithCounts);
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  const wishlist = useAppSelector(selectWishlistIds);

  useEffect(() => {
    if (productsStatus === 'idle') dispatch(fetchProducts());
    if (categoriesStatus === 'idle') dispatch(fetchCategories());
  }, [dispatch, productsStatus, categoriesStatus]);

  const visibleProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <main>
      <Hero />
      <section className="bg-white py-20 sm:py-28" id="products">
        <div className="mx-auto w-[min(1320px,calc(100%-40px))]">
          <SectionHeader
            eyebrow="Freshly printed"
            title="Pieces worth keeping"
            description="Printed in small batches with an eye for form, texture, and daily utility."
          />
          <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter products by category">
            {['All', ...categories.map((category) => category.name)].map((category) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-black text-[#b4ff39]'
                    : 'bg-[#f0f0eb] text-[#55554d] hover:bg-[#deded8]'
                }`}
                key={category}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          {productsStatus === 'loading' && <p className="text-sm text-[#77776e]">Loading products…</p>}
          {productsStatus === 'failed' && (
            <p className="text-sm text-[#d95743]">Couldn't load products — refresh to try again.</p>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
                onAddToCart={() => dispatch(addToCartSmart({ productId: product._id, quantity: 1 }))}
                onToggleWishlist={() => dispatch(toggleWishlist(product.id))}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
