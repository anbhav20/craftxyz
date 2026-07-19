import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import { fetchOrders, updateOrderStatus, selectOrders, selectOrdersStatus } from '../../features/orders/ordersSlice.js';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const TERMINAL = ['delivered', 'cancelled'];

function AdminOrders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const status = useAppSelector(selectOrdersStatus);

  useEffect(() => {
    dispatch(fetchOrders({ limit: 50 }));
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-.03em]">Orders</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#141311]/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#141311]/10 font-mono text-[10px] uppercase tracking-widest text-[#141311]/45">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141311]/5">
            {status === 'loading' && (
              <tr>
                <td className="px-4 py-6 text-[#141311]/50" colSpan={5}>Loading…</td>
              </tr>
            )}
            {status === 'succeeded' && orders.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-[#141311]/50" colSpan={5}>No orders yet.</td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-4 py-3 font-mono text-xs text-[#141311]/60">{order._id}</td>
                <td className="px-4 py-3">{order.user?.name || order.user?.email || '—'}</td>
                <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase ${
                      order.paymentStatus === 'paid'
                        ? 'bg-[#6F9E23]/10 text-[#6F9E23]'
                        : order.paymentStatus === 'failed'
                        ? 'bg-[#d95743]/10 text-[#d95743]'
                        : 'bg-[#141311]/5 text-[#141311]/40'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  {order.flaggedForReview && (
                    <span className="ml-2 rounded-full bg-[#d95743]/10 px-2 py-1 font-mono text-[10px] uppercase text-[#d95743]">
                      Review
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-[#141311]/15 px-2 py-1 text-xs disabled:opacity-40"
                    value={order.orderStatus}
                    disabled={TERMINAL.includes(order.orderStatus)}
                    onChange={(event) =>
                      dispatch(updateOrderStatus({ id: order._id, orderStatus: event.target.value }))
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;
