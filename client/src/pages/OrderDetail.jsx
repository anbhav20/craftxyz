import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { fetchOrderById, selectCurrentOrder, selectCurrentOrderStatus } from '../features/orders/ordersSlice.js';

function OrderDetail() {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectCurrentOrder);
  const status = useAppSelector(selectCurrentOrderStatus);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  if (status === 'loading' || status === 'idle') {
    return (
      <main className="grid min-h-[50vh] place-items-center">
        <p className="text-sm text-[#6b6b63]">Loading…</p>
      </main>
    );
  }

  if (status === 'failed' || !order) {
    return (
      <main className="grid min-h-[50vh] place-items-center px-5 text-center">
        <div>
          <p className="text-sm text-[#6b6b63]">We couldn't find that order.</p>
          <Link className="mt-4 inline-block font-semibold text-[#6F9E23] hover:underline" to="/orders">
            View my orders →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[min(700px,calc(100%-40px))] py-12">
      {order.paymentStatus === 'paid' && (
        <div className="mb-6 rounded-2xl bg-[#6F9E23]/10 p-5 text-sm text-[#6F9E23]">
          Payment confirmed — thanks for your order!
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-[-.03em]">Order {order._id}</h1>
        <span className="rounded-full bg-[#eeeee9] px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
          {order.orderStatus}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-[#deded8] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6b6b63]">Items</h2>
        <ul className="mt-3 space-y-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between text-sm">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span className="font-semibold">${item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-[#deded8] pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6b6b63]">Subtotal</span>
            <span>${order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b6b63]">Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : `$${order.shipping}`}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${order.total}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#deded8] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6b6b63]">Delivery address</h2>
        <p className="mt-2 text-sm">
          {order.address.fullName} — {order.address.phone}
          <br />
          {order.address.fullAddress}, {order.address.city}, {order.address.state} {order.address.pincode}
        </p>
      </div>

      <Link className="mt-6 inline-block text-sm font-semibold text-[#6F9E23] hover:underline" to="/orders">
        ← All orders
      </Link>
    </main>
  );
}

export default OrderDetail;
