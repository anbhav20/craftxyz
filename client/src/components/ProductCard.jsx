import { Link } from 'react-router-dom';

function ProductCard({ product, isWishlisted, onAddToCart, onToggleWishlist }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#141311]/10 bg-white shadow-[0_12px_30px_rgba(20,19,17,0.05)]">
      <div className="relative aspect-[.86] overflow-hidden bg-[#e7e5da]">
        <img
          className="size-full object-cover transition duration-700"
          src={product.image}
          alt={product.title}
          loading="lazy"
        />

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[#B4FF39] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-black">
            {product.badge}
          </span>
        )}

        <button
          className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-lg shadow-sm transition-colors ${
            isWishlisted ? 'text-[#d95743]' : 'text-[#141311]/60 hover:text-[#141311]'
          }`}
          onClick={onToggleWishlist}
          type="button"
          aria-label={`Toggle ${product.title} in wishlist`}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#141311]/45">
              {product.material}
            </p>
            <h3 className="mt-1 text-base font-semibold tracking-[-.025em] text-[#141311]">
              {product.title}
            </h3>
          </div>
          <p className="font-mono font-semibold text-[#141311]">₹{product.price}</p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 rounded-xl bg-[#141311] px-3 py-3 text-xs font-bold text-white transition hover:bg-[#6F9E23] active:scale-[0.98]"
            onClick={onAddToCart}
            type="button"
          >
            Add to cart
          </button>
          <Link
            className="rounded-xl border border-[#141311]/10 bg-[#f6f5ef] px-4 py-3 text-xs font-bold text-[#141311] transition hover:bg-[#ece9de] active:scale-[0.98]"
            to={`/products/${product.id}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;