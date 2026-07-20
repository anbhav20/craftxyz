import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import { signOut, selectCurrentUser } from '../../features/auth/authSlice.js';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/admins', label: 'Admins' },
];

function AdminLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#141311] lg:flex">
      {/* Mobile top bar — sidebar is hidden by default below lg, this is the only way in */}
      <div className="flex items-center justify-between border-b border-[#141311]/10 bg-[#141311] px-4 py-3 text-white lg:hidden">
        <p className="font-['Space_Grotesk'] text-base font-bold tracking-[-.05em]">
          CRAFT<span className="text-[#6F9E23]">XYZ</span>{' '}
          <span className="ml-1 font-mono text-[9px] uppercase tracking-widest text-white/40">Admin</span>
        </p>
        <button
          className="rounded-lg p-2 hover:bg-white/10"
          onClick={() => setSidebarOpen(true)}
          type="button"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Backdrop — tapping outside the sidebar closes it */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col bg-[#141311] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <p className="font-['Space_Grotesk'] text-lg font-bold tracking-[-.05em]">
              CRAFT<span className="text-[#6F9E23]">XYZ</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">Admin</p>
          </div>
          <button
            className="rounded-lg p-1 text-white/60 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-xs text-white/50">{user?.email}</p>
          <button
            className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
            onClick={() => dispatch(signOut())}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-5 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
