import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { closeCartDrawer, selectCartDrawerOpen } from '../features/ui/uiSlice.js';
import { selectIsAuthenticated } from '../features/auth/authSlice.js';
import { selectCart, updateCartItem, removeCartItem } from '../features/cart/cartSlice.js';

const EASE = [0.16, 1, 0.3, 1];

function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCartDrawerOpen);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const cart = useAppSelector(selectCart);

  const close = () => dispatch(closeCartDrawer());

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#f7f6f1] shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-[#141311]/10 bg-white px-6 py-5">
              <h2 className="text-lg font-semibold tracking-[-.02em]">Your bag</h2>
              <button className="text-[#141311]/40 hover:text-[#141311]" onClick={close} type="button" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {!isAuthenticated || cart.lineItems.length === 0 ? (
                <p className="mt-10 text-center text-sm text-[#141311]/50">
                  Your bag is empty — add something to get started.
                </p>
              ) : (
                <ul className="space-y-3">
                  {cart.lineItems.map((item) => (
                    <li key={item.product} className="rounded-2xl border border-[#141311]/10 bg-white p-3 shadow-sm">
                      <div className="flex gap-3">
                        <img className="size-20 rounded-xl object-cover" src={item.image} alt={item.title} />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-[#141311]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#141311]/50">₹{item.price} each</p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              className="grid size-7 place-items-center rounded-full bg-[#F2F0E9] text-[#141311]/70 transition hover:bg-[#e5e2d8] hover:text-[#141311]"
                              onClick={() =>
                                dispatch(updateCartItem({ productId: item.product, quantity: item.quantity - 1 }))
                              }
                              type="button"
                              aria-label="Decrease quantity"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              className="grid size-7 place-items-center rounded-full bg-[#F2F0E9] text-[#141311]/70 transition hover:bg-[#e5e2d8] hover:text-[#141311]"
                              onClick={() =>
                                dispatch(updateCartItem({ productId: item.product, quantity: item.quantity + 1 }))
                              }
                              type="button"
                              aria-label="Increase quantity"
                            >
                              <FiPlus size={14} />
                            </button>
                            <button
                              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#d95743] hover:underline"
                              onClick={() => dispatch(removeCartItem(item.product))}
                              type="button"
                            >
                              <FiTrash2 size={12} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#141311]/10 pt-3">
                        <span className="text-[11px] font-bold uppercase tracking-[.16em] text-[#141311]/45">Line total</span>
                        <span className="text-sm font-semibold text-[#141311]">₹{item.lineTotal}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {isAuthenticated && cart.unavailable.length > 0 && (
                <div className="mt-4 rounded-lg bg-[#d95743]/10 p-3 text-xs text-[#d95743]">
                  {cart.unavailable.map((item, index) => (
                    <p key={index}>{item.reason}</p>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && cart.lineItems.length > 0 && (
              <div className="border-t border-[#141311]/10 bg-white px-6 py-5">
                <div className="rounded-2xl bg-[#f6f5ef] p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#141311]/60">Subtotal</span>
                    <span className="font-semibold">₹{cart.subtotal}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-[#141311]/60">Shipping</span>
                    <span className="font-semibold">{cart.shipping === 0 ? 'Free' : `₹${cart.shipping}`}</span>
                  </div>
                  <div className="mt-3 flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>₹{cart.total}</span>
                  </div>
                </div>

                <Link
                  className="mt-4 block w-full rounded-full bg-[#141311] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#6F9E23]"
                  onClick={close}
                  to="/checkout"
                >
                  Checkout
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="border-t border-[#141311]/10 bg-white px-6 py-3 text-center">
                <Link className="text-xs font-semibold text-[#6F9E23] hover:underline" onClick={close} to="/orders">
                  View my orders
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
