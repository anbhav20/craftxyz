import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import { bootstrapAuth, selectIsAuthenticated, selectAuthBootstrapped } from './authSlice.js';
import { fetchCart, resetCartState } from '../cart/cartSlice.js';

/**
 * Doesn't block rendering — children render immediately. Screens that
 * need to know "are we sure yet whether someone's logged in" (e.g. a
 * "My Account" link that shouldn't flash then disappear) can read
 * selectAuthBootstrapped.
 */
function AuthProvider({ children }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const bootstrapped = useAppSelector(selectAuthBootstrapped);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (isAuthenticated) {
      dispatch(fetchCart());
    } else {
      dispatch(resetCartState());
    }
  }, [dispatch, isAuthenticated, bootstrapped]);

  return children;
}

export default AuthProvider;
