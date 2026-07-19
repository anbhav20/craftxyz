import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { selectCurrentUser } from '../features/auth/authSlice.js';
import { selectCart, resetCartState } from '../features/cart/cartSlice.js';
import {
  fetchAddresses,
  addAddress,
  selectAddresses,
  selectAddressesStatus,
  selectAddAddressStatus,
} from '../features/addresses/addressesSlice.js';
import { paymentApi } from '../api/endpoints/paymentApi.js';
import { loadRazorpayScript } from '../utils/razorpayLoader.js';
import { addToast } from '../features/ui/uiSlice.js';

const EMPTY_ADDRESS = { fullName: '', phone: '', state: '', city: '', pincode: '', fullAddress: '' };

function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const cart = useAppSelector(selectCart);
  const addresses = useAppSelector(selectAddresses);
  const addressesStatus = useAppSelector(selectAddressesStatus);
  const addAddressStatus = useAppSelector(selectAddAddressStatus);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress._id);
    }
    if (addresses.length === 0 && addressesStatus === 'succeeded') {
      setShowAddForm(true);
    }
  }, [addresses, addressesStatus, selectedAddressId]);

  const handleAddAddress = async (event) => {
    event.preventDefault();
    const result = await dispatch(addAddress(newAddress));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowAddForm(false);
      setNewAddress(EMPTY_ADDRESS);
    }
  };

  const handlePay = async () => {
    if (!selectedAddressId) return;
    setPaying(true);

    try {
      const { orderId, razorpayOrderId, amount, currency, keyId } = await paymentApi.createOrder(
        selectedAddressId
      );

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        dispatch(addToast({ message: 'Could not load the payment widget. Check your connection and try again.' }));
        setPaying(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'CraftXYZ',
        description: 'Order payment',
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#141311' },
        handler: async (response) => {
          try {
            await paymentApi.verify({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            dispatch(resetCartState());
            dispatch(addToast({ type: 'success', message: 'Payment successful!' }));
            navigate(`/orders/${orderId}`);
          } catch {
            // Interceptor already toasts the specific error.
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      razorpay.open();
    } catch {
      // Interceptor already toasts the specific error (e.g. items
      // needing attention, cart empty).
      setPaying(false);
    }
  };

  if (cart.lineItems.length === 0) {
    return (
      <main className="grid min-h-[50vh] place-items-center px-5 text-center">
        <p className="text-sm text-[#6b6b63]">Your bag is empty — add something before checking out.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[min(900px,calc(100%-24px))] py-12 sm:w-[min(900px,calc(100%-40px))]">
      <h1 className="text-3xl font-semibold tracking-[-.04em]">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6b6b63]">Delivery address</h2>

          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <label
                key={address._id}
                className={`block cursor-pointer rounded-xl border p-4 text-sm transition-colors ${
                  selectedAddressId === address._id ? 'border-[#6F9E23] bg-[#6F9E23]/5' : 'border-[#deded8]'
                }`}
              >
                <input
                  className="mr-2"
                  type="radio"
                  name="address"
                  checked={selectedAddressId === address._id}
                  onChange={() => setSelectedAddressId(address._id)}
                />
                <span className="font-semibold">{address.fullName}</span> — {address.phone}
                <p className="mt-1 text-[#6b6b63]">
                  {address.fullAddress}, {address.city}, {address.state} {address.pincode}
                </p>
              </label>
            ))}
          </div>

          {!showAddForm && (
            <button
              className="mt-4 text-sm font-semibold text-[#6F9E23] hover:underline"
              onClick={() => setShowAddForm(true)}
              type="button"
            >
              + Add a new address
            </button>
          )}

          {showAddForm && (
            <form className="mt-4 space-y-3 rounded-xl border border-[#deded8] p-4" onSubmit={handleAddAddress}>
              <input
                className="w-full rounded-lg border border-[#deded8] px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                placeholder="Full name"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                required
              />
              <input
                className="w-full rounded-lg border border-[#deded8] px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                placeholder="Phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className="rounded-lg border border-[#deded8] px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border border-[#deded8] px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  required
                />
              </div>
              <input
                className="w-full rounded-lg border border-[#deded8] px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                required
              />
              <textarea
                className="w-full rounded-lg border border-[#deded8] px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                placeholder="Full address"
                rows={2}
                value={newAddress.fullAddress}
                onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                required
              />
              <button
                className="rounded-full bg-[#141311] px-4 py-2 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
                type="submit"
                disabled={addAddressStatus === 'loading'}
              >
                {addAddressStatus === 'loading' ? 'Saving…' : 'Save address'}
              </button>
            </form>
          )}
        </section>

        <section className="h-fit rounded-2xl border border-[#deded8] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6b6b63]">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {cart.lineItems.map((item) => (
              <li key={item.product} className="flex justify-between text-sm">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span className="font-semibold">₹{item.lineTotal}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-[#deded8] pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6b6b63]">Subtotal</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6b63]">Shipping</span>
              <span>{cart.shipping === 0 ? 'Free' : `₹${cart.shipping}`}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>₹{cart.total}</span>
            </div>
          </div>
          <button
            className="mt-5 w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
            onClick={handlePay}
            type="button"
            disabled={paying || !selectedAddressId}
          >
            {paying ? 'Opening payment…' : `Pay ₹${cart.total}`}
          </button>
        </section>
      </div>
    </main>
  );
}

export default CheckoutPage;
