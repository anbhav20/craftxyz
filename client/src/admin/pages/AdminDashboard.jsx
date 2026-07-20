import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import { fetchDashboard, selectDashboard } from '../../features/admin/dashboardSlice.js';

const STAT_CARDS = [
  { key: 'totalOrders', label: 'Total orders' },
  { key: 'totalRevenue', label: 'Revenue', prefix: '₹' },
  { key: 'totalProducts', label: 'Products' },
  { key: 'totalCustomers', label: 'Customers' },
];

function AdminDashboard() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectDashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-.03em]">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="rounded-2xl border border-[#141311]/10 bg-white p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#141311]/45">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-.03em]">
              {card.prefix}
              {(data[card.key] ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[#141311]/10 bg-white p-5">
        <h2 className="text-sm font-semibold">Recent orders</h2>
        {data.status === 'succeeded' && data.recentOrders.length === 0 && (
          <p className="mt-3 text-sm text-[#141311]/50">No orders yet.</p>
        )}
        <div className="mt-3 divide-y divide-[#141311]/5">
          {data.recentOrders.map((order) => (
            <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-semibold">{order.user?.name || order.user?.email || 'Customer'}</p>
                <p className="font-mono text-xs text-[#141311]/45">{order._id}</p>
              </div>
              <span className="rounded-full bg-[#F2F0E9] px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                {order.orderStatus}
              </span>
              <p className="font-semibold">₹{order.total}</p>
              <Link className="text-xs font-semibold text-[#6F9E23] hover:underline" to="/admin/orders">
                View orders →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
