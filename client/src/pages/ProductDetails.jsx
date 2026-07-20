import { useEffect, useState } from 'react';
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
    <main className="bg-white py-6 sm:py-10">
      <div className="mx-auto w-[min(1320px,calc(100%-40px))]">
        <Link className="text-sm font-semibold text-[#6b6b63] transition hover:text-black" to="/products">
          ← All objects
        </Link>
        <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${product.colors}`}>
            {product.image ? (
              <img className="aspect-square size-full object-cover" src={product.image} alt={product.title} />
            ) : (
              <div className="grid aspect-square size-full place-items-center">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-white/70">
                  No photo yet
                </span>
              </div>
            )}
            <span className="absolute left-5 bottom-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              Small-batch print
            </span>
          </div>
          <section className="py-3 lg:py-12">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#6f9e23]">{product.category}</p>
            <div className="mt-5 flex items-start justify-between gap-5">
              <h1 className="text-5xl font-semibold leading-[.9] tracking-[-.075em] sm:text-6xl">{product.title}</h1>
              <p className="whitespace-nowrap text-xl font-semibold">₹{product.price}</p>
            </div>
            <p className="mt-7 max-w-md text-base leading-7 text-[#6b6b63]">
              {product.description ||
                `A sculptural, practical piece made in small batches from ${product.material.toLowerCase()}. Every print carries its own distinct layer pattern.`}
            </p>
            <div className="mt-9 border-y border-[#deded8] py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center rounded-full bg-[#eeeee9] p-1">
                  <button
                    className="grid size-8 place-items-center rounded-full hover:bg-white"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    type="button"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="grid w-8 place-items-center text-sm font-bold">{quantity}</span>
                  <button
                    className="grid size-8 place-items-center rounded-full hover:bg-white"
                    onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                    type="button"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              className="mt-6 w-full rounded-full bg-black px-6 py-4 text-sm font-bold text-[#b4ff39] transition hover:bg-[#31312d]"
              onClick={handleAddToCart}
              type="button"
            >
              Add to bag — ₹{product.price * quantity}
            </button>
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-[#deded8] pt-5 text-center text-[11px] font-semibold text-[#6b6b63]">
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
