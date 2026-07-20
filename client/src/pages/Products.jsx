import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import ProductCard from '../components/ProductCard';
import { fetchProducts, selectAllProducts, selectProductsStatus } from '../features/products/productsSlice.js';
import {
  fetchCategories,
  selectCategoriesWithCounts,
  selectCategoriesStatus,
} from '../features/categories/categoriesSlice.js';
import { addToCartSmart } from '../features/cart/cartSlice.js';
import { toggleWishlist, selectWishlistIds } from '../features/wishlist/wishlistSlice.js';

function Products() {
  const dispatch = useAppDispatch();
  const [category, setCategory] = useState('All');

  const products = useAppSelector(selectAllProducts);
  const productsStatus = useAppSelector(selectProductsStatus);
  const categories = useAppSelector(selectCategoriesWithCounts);
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  const wishlist = useAppSelector(selectWishlistIds);

  useEffect(() => {
    if (productsStatus === 'idle') dispatch(fetchProducts());
    if (categoriesStatus === 'idle') dispatch(fetchCategories());
  }, [dispatch, productsStatus, categoriesStatus]);

  const filteredProducts =
    category === 'All' ? products : products.filter((product) => product.category === category);

  return (
    <main className="bg-white">
      <section className="border-b border-[#deded8] bg-[#eeeee9] py-16 sm:py-22">
        <div className="mx-auto w-[min(1320px,calc(100%-40px))]">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#6f9e23]">The CraftXYZ edit</p>
          <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[.9] tracking-[-.075em] sm:text-7xl">
              The good stuff, <span className="text-[#78a928]">made better.</span>
            </h1>
            <p className="max-w-xs text-sm leading-6 text-[#6b6b63]">
              Small-batch objects designed to make ordinary surfaces more interesting.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto w-[min(1320px,calc(100%-40px))] py-12 sm:py-16">
        <div className="flex flex-col justify-between gap-5 border-b border-[#deded8] pb-5 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {['All', ...categories.map((item) => item.name)].map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === item ? 'bg-black text-[#b4ff39]' : 'bg-[#eeeee9] text-[#55554d] hover:bg-[#deded8]'
                }`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <p className="text-sm text-[#77776e]">{filteredProducts.length} objects</p>
        </div>
        {productsStatus === 'loading' && <p className="mt-8 text-sm text-[#77776e]">Loading products…</p>}
        {productsStatus === 'failed' && (
          <p className="mt-8 text-sm text-[#d95743]">Couldn't load products — refresh to try again.</p>
        )}
        <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onAddToCart={() => dispatch(addToCartSmart({ productId: product._id, quantity: 1 }))}
              onToggleWishlist={() => dispatch(toggleWishlist(product.id))}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Products;
