import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { selectCartCount } from '../features/cart/cartSlice.js';
import { openCartDrawer } from '../features/ui/uiSlice.js';

const EASE = [0.16, 1, 0.3, 1];

function Navbar() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `relative py-1 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-[#6F9E23] after:transition-transform after:duration-300 ${
      isActive
        ? 'text-[#141311] after:scale-x-100'
        : 'text-[#141311]/55 hover:text-[#141311] after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#141311]/10 bg-[#F2F0E9]/95 backdrop-blur">
      <div className="mx-auto flex h-17 w-[min(1320px,calc(100%-40px))] items-center gap-7">
        <Link className="font-['Space_Grotesk'] text-xl font-bold tracking-[-.06em] text-[#141311]" to="/">
          CRAFT<span className="text-[#6F9E23]">XYZ</span>
        </Link>

        <nav className="hidden gap-7 text-sm font-semibold lg:ml-12 lg:flex">
          <NavLink className={navClass} to="/">Home</NavLink>
          <NavLink className={navClass} to="/products">Shop</NavLink>
          <a className="text-[#141311]/55 transition-colors hover:text-[#141311]" href="/#categories">Collections</a>
          <a className="text-[#141311]/55 transition-colors hover:text-[#141311]" href="/#about">Studio</a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            className="hidden rounded-full p-2 text-[#141311]/70 transition-colors hover:bg-[#141311]/5 hover:text-[#141311] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9E23] sm:grid sm:place-items-center"
            onClick={() => setSearchOpen((current) => !current)}
            type="button"
            aria-expanded={searchOpen}
            aria-label="Toggle search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            className="relative flex items-center gap-2 rounded-full bg-[#141311] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#6F9E23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9E23]"
            onClick={() => dispatch(openCartDrawer())}
            type="button"
          >
            Bag
            <span className="grid size-4 place-items-center rounded-full bg-[#B4FF39] font-mono text-[10px] text-black">
              {cartCount}
            </span>
          </button>

          <button
            className="rounded-full p-2 text-sm font-bold text-[#141311] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9E23] lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-[#141311]/10 bg-[#F2F0E9]"
          >
            <form
              className="mx-auto flex w-[min(1320px,calc(100%-40px))] items-center gap-3 py-3"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                autoFocus
                type="search"
                placeholder="Search products…"
                className="w-full bg-transparent font-mono text-sm text-[#141311] placeholder:text-[#141311]/40 focus:outline-none"
              />
              <button
                className="font-mono text-[11px] uppercase tracking-widest text-[#141311]/50 hover:text-[#141311]"
                onClick={() => setSearchOpen(false)}
                type="button"
              >
                Esc
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-[#141311]/10 bg-[#F2F0E9] text-sm font-semibold lg:hidden"
          >
            <div className="mx-auto flex w-[min(1320px,calc(100%-40px))] flex-col gap-4 py-5">
              <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
              <NavLink to="/products" onClick={() => setMenuOpen(false)}>Shop</NavLink>
              <a href="/#categories" onClick={() => setMenuOpen(false)}>Collections</a>
              <a href="/#about" onClick={() => setMenuOpen(false)}>Studio</a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
