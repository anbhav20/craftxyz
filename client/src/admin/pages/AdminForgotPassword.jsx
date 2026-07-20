import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/endpoints/authApi.js';

function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    try {
      const result = await authApi.forgotPassword(email);
      setMessage(result?.message || 'If an account exists with that email, a reset link has been sent.');
      setStatus('sent');
    } catch {
      // Interceptor already toasts genuine failures (network down,
      // etc.) — this page still shows the generic message either way
      // so it never confirms/denies whether the email exists.
      setMessage('If an account exists with that email, a reset link has been sent.');
      setStatus('sent');
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#141311] px-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <p className="font-['Space_Grotesk'] text-xl font-bold tracking-[-.05em]">
          CRAFT<span className="text-[#6F9E23]">XYZ</span>
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#141311]/40">Reset password</p>

        {status === 'sent' ? (
          <p className="mt-6 text-sm text-[#141311]/70">{message}</p>
        ) : (
          <form className="mt-6" onSubmit={handleSubmit}>
            <label className="block text-xs font-semibold text-[#141311]/70">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button
              className="mt-5 w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link className="mt-5 block text-center text-xs font-semibold text-[#6F9E23] hover:underline" to="/admin/login">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default AdminForgotPassword;
