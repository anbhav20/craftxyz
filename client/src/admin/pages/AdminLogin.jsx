import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import {
  signInAsAdmin,
  signInWithGoogle,
  signOut,
  selectIsAdmin,
  selectAuthStatus,
} from '../../features/auth/authSlice.js';
import { addToast } from '../../features/ui/uiSlice.js';

function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useAppSelector(selectIsAdmin);
  const status = useAppSelector(selectAuthStatus);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  if (isAdmin) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />;
  }

  const goToAdmin = () => navigate(location.state?.from?.pathname || '/admin', { replace: true });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(signInAsAdmin({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') goToAdmin();
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const result = await dispatch(signInWithGoogle());
    setGoogleLoading(false);

    if (signInWithGoogle.fulfilled.match(result)) {
      if (result.payload.user.role !== 'admin') {
        // This Google account is real and signed in successfully, but
        // it's a customer account — sign it back out immediately
        // rather than leaving them "logged in" while stuck on the
        // admin login screen.
        dispatch(signOut());
        dispatch(addToast({ message: 'That Google account is not an admin.' }));
        return;
      }
      goToAdmin();
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

        <div className="mt-4 flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#141311]/70">Password</label>
          <Link className="text-xs font-semibold text-[#6F9E23] hover:underline" to="/admin/forgot-password">
            Forgot password?
          </Link>
        </div>
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

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#141311]/10" />
          <span className="text-xs text-[#141311]/40">or</span>
          <div className="h-px flex-1 bg-[#141311]/10" />
        </div>

        <button
          className="w-full rounded-full border border-[#141311]/15 px-4 py-3 text-sm font-bold text-[#141311] transition-colors hover:border-[#141311] disabled:opacity-50"
          onClick={handleGoogleSignIn}
          type="button"
          disabled={googleLoading}
        >
          {googleLoading ? 'Signing in…' : 'Sign in with Google'}
        </button>
        <p className="mt-3 text-center text-[11px] text-[#141311]/40">
          Only works if this Google account's email already has an admin account.
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;
