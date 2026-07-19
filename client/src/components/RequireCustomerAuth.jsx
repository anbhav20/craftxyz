import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { selectIsAuthenticated, selectAuthBootstrapped } from '../features/auth/authSlice.js';
import { addToast } from '../features/ui/uiSlice.js';

function RequireCustomerAuth({ children }) {
  const dispatch = useAppDispatch();
  const bootstrapped = useAppSelector(selectAuthBootstrapped);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (bootstrapped && !isAuthenticated) {
      dispatch(addToast({ message: "Add something to your bag first — that's when you'll be asked to sign in." }));
    }
  }, [bootstrapped, isAuthenticated, dispatch]);

  if (!bootstrapped) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default RequireCustomerAuth;
