import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import {
  fetchAdmins,
  createAdminAccount,
  selectAdminAccounts,
  selectAdminAccountsStatus,
  selectCreateAdminStatus,
} from '../../features/admin/adminsSlice.js';

const EMPTY_FORM = { name: '', email: '', password: '' };

function AdminAdmins() {
  const dispatch = useAppDispatch();
  const admins = useAppSelector(selectAdminAccounts);
  const status = useAppSelector(selectAdminAccountsStatus);
  const createStatus = useAppSelector(selectCreateAdminStatus);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(createAdminAccount(form));
    if (result.meta.requestStatus === 'fulfilled') setForm(EMPTY_FORM);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-.03em]">Admin accounts</h1>
      <p className="mt-1 text-sm text-[#141311]/50">
        Anyone created here can sign in at <span className="font-mono">/admin/login</span> with the same
        permissions you have.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-2xl border border-[#141311]/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#141311]/10 font-mono text-[10px] uppercase tracking-widest text-[#141311]/45">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141311]/5">
              {status === 'loading' && (
                <tr>
                  <td className="px-4 py-6 text-[#141311]/50" colSpan={3}>Loading…</td>
                </tr>
              )}
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td className="px-4 py-3 font-semibold">{admin.name}</td>
                  <td className="px-4 py-3 text-[#141311]/60">{admin.email}</td>
                  <td className="px-4 py-3 text-[#141311]/60">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="h-fit space-y-4 rounded-2xl border border-[#141311]/10 bg-white p-6" onSubmit={handleSubmit}>
          <h2 className="text-sm font-semibold">Create admin</h2>
          <div>
            <label className="block text-xs font-semibold text-[#141311]/70">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#141311]/70">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#141311]/70">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </div>
          <button
            className="w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
            type="submit"
            disabled={createStatus === 'loading'}
          >
            {createStatus === 'loading' ? 'Creating…' : 'Create admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminAdmins;
