import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks.js';
import { selectIsAdmin, selectAuthBootstrapped } from '../../features/auth/authSlice.js';

function RequireAdmin({ children }) {
  const bootstrapped = useAppSelector(selectAuthBootstrapped);
  const isAdmin = useAppSelector(selectIsAdmin);
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#141311] text-white">
        <p className="font-mono text-sm">Checking session…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAdmin;
