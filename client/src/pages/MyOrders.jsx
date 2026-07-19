import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { fetchOrders, selectOrders, selectOrdersStatus } from '../features/orders/ordersSlice.js';

function MyOrders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const status = useAppSelector(selectOrdersStatus);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <main className="mx-auto w-[min(900px,calc(100%-40px))] py-12">
      <h1 className="text-3xl font-semibold tracking-[-.04em]">My orders</h1>

      {status === 'loading' && <p className="mt-8 text-sm text-[#6b6b63]">Loading…</p>}
      {status === 'succeeded' && orders.length === 0 && (
        <p className="mt-8 text-sm text-[#6b6b63]">
          No orders yet.{' '}
          <Link className="font-semibold text-[#6F9E23] hover:underline" to="/products">
            Start shopping →
          </Link>
        </p>
      )}

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            className="block rounded-2xl border border-[#deded8] bg-white p-5 transition hover:border-[#6F9E23]"
            to={`/orders/${order._id}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-[#6b6b63]">{order._id}</p>
                <p className="mt-1 text-sm text-[#6b6b63]">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item
                  {order.items.length !== 1 && 's'}
                </p>
              </div>
              <span className="rounded-full bg-[#eeeee9] px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                {order.orderStatus}
              </span>
              <p className="font-semibold">${order.total}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default MyOrders;
