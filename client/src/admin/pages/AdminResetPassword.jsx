import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/endpoints/authApi.js';
import { useAppDispatch } from '../../app/hooks.js';
import { addToast } from '../../features/ui/uiSlice.js';

function AdminResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#141311] px-5 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <p className="text-sm text-[#141311]/70">This reset link is missing its token.</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-[#6F9E23] hover:underline" to="/admin/forgot-password">
            Request a new one →
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      dispatch(addToast({ message: "Passwords don't match" }));
      return;
    }
    setStatus('loading');
    try {
      await authApi.resetPassword(token, password);
      dispatch(addToast({ type: 'success', message: 'Password updated — sign in with your new password' }));
      navigate('/admin/login', { replace: true });
    } catch {
      // Interceptor already toasts the specific error (expired/invalid link).
      setStatus('idle');
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#141311] px-5">
      <form className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl" onSubmit={handleSubmit}>
        <p className="font-['Space_Grotesk'] text-xl font-bold tracking-[-.05em]">
          CRAFT<span className="text-[#6F9E23]">XYZ</span>
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#141311]/40">Set a new password</p>

        <label className="mt-6 block text-xs font-semibold text-[#141311]/70">New password</label>
        <input
          className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label className="mt-4 block text-xs font-semibold text-[#141311]/70">Confirm password</label>
        <input
          className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
          type="password"
          minLength={8}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />

        <button
          className="mt-6 w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default AdminResetPassword;
