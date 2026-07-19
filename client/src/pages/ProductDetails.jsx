import { useEffect, useState } from 'react';
import { FiMinus, FiPlus, FiShoppingBag, FiStar } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import {
  fetchProductBySlug,
  selectCurrentProduct,
  selectCurrentProductStatus,
} from '../features/products/productsSlice.js';
import { addToCartSmart } from '../features/cart/cartSlice.js';

function NotFoundBlock() {
  return (
    <main className="grid min-h-[55vh] place-items-center px-5 text-center">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6f9e23]">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-.07em]">This object escaped the studio.</h1>
        <Link className="mt-7 inline-block rounded-full bg-black px-5 py-3 text-sm font-bold text-[#b4ff39]" to="/products">
          Return to shop
        </Link>
      </div>
    </main>
  );
}

function ProductDetails() {
  const { productId } = useParams(); // this is the product's slug
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);

  const product = useAppSelector(selectCurrentProduct);
  const status = useAppSelector(selectCurrentProductStatus);

  useEffect(() => {
    dispatch(fetchProductBySlug(productId));
  }, [dispatch, productId]);

  if (status === 'loading' || status === 'idle') {
    return <main className="grid min-h-[55vh] place-items-center"><p className="text-sm text-[#77776e]">Loading…</p></main>;
  }
  if (status === 'failed' || !product) {
    return <NotFoundBlock />;
  }

  const handleAddToCart = () => {
    dispatch(addToCartSmart({ productId: product._id, quantity }));
  };

  return (
    <main className="bg-[#f6f5ef] py-6 sm:py-10">
      <div className="mx-auto w-[min(1320px,calc(100%-24px))] sm:w-[min(1320px,calc(100%-40px))]">
        <Link className="text-sm font-semibold text-[#6b6b63] transition hover:text-black" to="/products">
          ← All objects
        </Link>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:gap-8">
          <div className="overflow-hidden rounded-[2rem] border border-[#141311]/10 bg-white shadow-[0_18px_50px_rgba(20,19,17,0.06)]">
            <div className={`relative overflow-hidden bg-gradient-to-br ${product.colors}`}>
              <img className="aspect-[1/1] w-full object-cover" src={product.image} alt={product.title} />
              <span className="absolute left-5 bottom-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#141311]">
                Small-batch print
              </span>
            </div>
          </div>

          <section className="rounded-[2rem] border border-[#141311]/10 bg-white p-5 shadow-[0_18px_50px_rgba(20,19,17,0.06)] sm:p-7 lg:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#6f9e23]">{product.category}</p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
              <h1 className="text-4xl font-semibold leading-[.9] tracking-[-.075em] sm:text-5xl md:text-6xl">{product.title}</h1>
              <div className="text-right">
                <p className="whitespace-nowrap text-2xl font-semibold text-[#141311]">₹{product.price}</p>
                {product.rating ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#141311]/70">
                    <FiStar className="text-[#6f9e23]" />
                    {product.rating} <span className="text-[#141311]/45">({product.reviewsCount || '0'})</span>
                  </p>
                ) : null}
              </div>
            </div>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#6b6b63]">
              A sculptural, practical piece made in small batches from {product.material?.toLowerCase() || 'pla+'}. Every print carries its own distinct layer pattern.
            </p>

            <div className="mt-8 rounded-2xl bg-[#f6f5ef] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#141311]/50">Material</p>
                  <p className="mt-1 text-base font-semibold text-[#141311]">{product.material || 'PLA+'}</p>
                </div>

                <div className="flex items-center rounded-full bg-white p-1 shadow-sm">
                  <button
                    className="grid size-9 place-items-center rounded-full text-[#141311]/70 transition hover:bg-[#f2f0e9] hover:text-[#141311]"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    type="button"
                    aria-label="Decrease quantity"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="grid w-9 place-items-center text-sm font-bold text-[#141311]">{quantity}</span>
                  <button
                    className="grid size-9 place-items-center rounded-full text-[#141311]/70 transition hover:bg-[#f2f0e9] hover:text-[#141311]"
                    onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                    type="button"
                    aria-label="Increase quantity"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-sm font-bold text-[#b4ff39] transition hover:bg-[#31312d]"
              onClick={handleAddToCart}
              type="button"
            >
              <FiShoppingBag size={16} />
              Add to bag — ₹{product.price * quantity}
            </button>

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-[#deded8] pt-5 text-center text-[11px] font-semibold text-[#6b6b63] sm:grid-cols-3">
              <p>Made in-house</p>
              <p>Durable materials</p>
              <p>Ships with care</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
