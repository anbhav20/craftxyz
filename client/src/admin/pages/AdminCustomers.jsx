import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import { fetchCustomers, selectCustomers, selectCustomersStatus } from '../../features/admin/customersSlice.js';

function AdminCustomers() {
  const dispatch = useAppDispatch();
  const customers = useAppSelector(selectCustomers);
  const status = useAppSelector(selectCustomersStatus);

  useEffect(() => {
    dispatch(fetchCustomers({ limit: 50 }));
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-.03em]">Customers</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#141311]/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#141311]/10 font-mono text-[10px] uppercase tracking-widest text-[#141311]/45">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141311]/5">
            {status === 'loading' && (
              <tr>
                <td className="px-4 py-6 text-[#141311]/50" colSpan={4}>Loading…</td>
              </tr>
            )}
            {status === 'succeeded' && customers.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-[#141311]/50" colSpan={4}>No customers yet.</td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td className="px-4 py-3 font-semibold">{customer.name}</td>
                <td className="px-4 py-3 text-[#141311]/60">{customer.email}</td>
                <td className="px-4 py-3">{customer.totalOrders}</td>
                <td className="px-4 py-3">₹{customer.totalSpent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCustomers;
