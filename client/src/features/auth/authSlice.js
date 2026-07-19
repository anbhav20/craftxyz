import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/endpoints/authApi.js';
import { getGoogleIdToken } from './firebaseClient.js';

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const idToken = await getGoogleIdToken();
      return await authApi.googleLogin(idToken);
    } catch (err) {
      return rejectWithValue(err.message || 'Google sign-in failed');
    }
  }
);

export const signInAsAdmin = createAsyncThunk(
  'auth/signInAsAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authApi.adminLogin(email, password);
    } catch (err) {
      return rejectWithValue(err.message || 'Sign-in failed');
    }
  }
);

/**
 * Runs once on app load (see AuthProvider). Tries the HttpOnly refresh
 * cookie silently — a returning visitor with a valid session gets
 * signed back in with no visible flash of "logged out" UI. Failing is
 * the normal, expected outcome for a first-time visitor, not an error
 * to surface.
 *
 * Dispatches setCredentials mid-thunk (not just at the end) so the
 * request interceptor picks up the fresh access token before the
 * follow-up /auth/me call — waiting for this thunk's own fulfilled
 * action would be too late, that only fires after this function returns.
 */
export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { accessToken } = await authApi.refresh();
      dispatch(setCredentials({ accessToken }));
      const { user } = await authApi.me();
      return { accessToken, user };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await authApi.logout();
});

const initialState = {
  user: null,
  accessToken: null,
  status: 'idle', // idle | loading | ready
  error: null,
  // False until bootstrapAuth settles (either way) — lets screens that
  // care avoid a flash of "logged out" before the silent refresh has
  // had a chance to run.
  bootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user !== undefined) state.user = action.payload.user;
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.status = 'ready';
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.payload;
      })
      .addCase(signInAsAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signInAsAdmin.fulfilled, (state, action) => {
        state.status = 'ready';
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(signInAsAdmin.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.payload;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.bootstrapped = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken);
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectAuthBootstrapped = (state) => state.auth.bootstrapped;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
