import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import { signInAsAdmin, selectIsAdmin, selectAuthStatus } from '../../features/auth/authSlice.js';

function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useAppSelector(selectIsAdmin);
  const status = useAppSelector(selectAuthStatus);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAdmin) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(signInAsAdmin({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#141311] px-5">
      <form className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl" onSubmit={handleSubmit}>
        <p className="font-['Space_Grotesk'] text-xl font-bold tracking-[-.05em]">
          CRAFT<span className="text-[#6F9E23]">XYZ</span>
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#141311]/40">Admin sign-in</p>

        <label className="mt-6 block text-xs font-semibold text-[#141311]/70">Email</label>
        <input
          className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="mt-4 block text-xs font-semibold text-[#141311]/70">Password</label>
        <input
          className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button
          className="mt-6 w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#6F9E23] disabled:opacity-50"
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
