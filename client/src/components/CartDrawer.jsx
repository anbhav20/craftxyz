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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-[#141311]/10 px-6 py-5">
              <h2 className="text-lg font-semibold tracking-[-.02em]">Your bag</h2>
              <button className="text-[#141311]/40 hover:text-[#141311]" onClick={close} type="button" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!isAuthenticated || cart.lineItems.length === 0 ? (
                <p className="mt-10 text-center text-sm text-[#141311]/50">
                  Your bag is empty — add something to get started.
                </p>
              ) : (
                <ul className="space-y-4">
                  {cart.lineItems.map((item) => (
                    <li key={item.product} className="flex gap-3">
                      <img className="size-16 rounded-lg object-cover" src={item.image} alt={item.title} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-[#141311]/50">₹{item.price} each</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            className="grid size-6 place-items-center rounded-full bg-[#F2F0E9] hover:bg-[#e5e2d8]"
                            onClick={() =>
                              dispatch(updateCartItem({ productId: item.product, quantity: item.quantity - 1 }))
                            }
                            type="button"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            className="grid size-6 place-items-center rounded-full bg-[#F2F0E9] hover:bg-[#e5e2d8]"
                            onClick={() =>
                              dispatch(updateCartItem({ productId: item.product, quantity: item.quantity + 1 }))
                            }
                            type="button"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                          <button
                            className="ml-auto text-xs font-semibold text-[#d95743] hover:underline"
                            onClick={() => dispatch(removeCartItem(item.product))}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">₹{item.lineTotal}</p>
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
              <div className="border-t border-[#141311]/10 px-6 py-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#141311]/60">Subtotal</span>
                  <span className="font-semibold">₹{cart.subtotal}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-[#141311]/60">Shipping</span>
                  <span className="font-semibold">{cart.shipping === 0 ? 'Free' : `₹${cart.shipping}`}</span>
                </div>
                <div className="mt-2 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{cart.total}</span>
                </div>
                <Link
                  className="mt-4 block w-full rounded-full bg-[#141311] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#6F9E23]"
                  onClick={close}
                  to="/checkout"
                >
                  Checkout
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="border-t border-[#141311]/10 px-6 py-3 text-center">
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
