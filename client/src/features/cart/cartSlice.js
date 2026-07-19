import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../api/endpoints/cartApi.js';
import { signInWithGoogle } from '../auth/authSlice.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return await cartApi.get();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

/**
 * The one function every "Add to bag" button calls. Nobody has to
 * check auth state first — if the person isn't signed in yet, this
 * opens the Google popup right here, then adds the item once they're
 * through. That's what gives the "browse freely, only asked to sign
 * in when it actually matters" behavior instead of a login wall.
 */
export const addToCartSmart = createAsyncThunk(
  'cart/addSmart',
  async ({ productId, quantity = 1 }, { getState, dispatch, rejectWithValue }) => {
    const alreadySignedIn = Boolean(getState().auth.accessToken);

    if (!alreadySignedIn) {
      const loginResult = await dispatch(signInWithGoogle());
      if (signInWithGoogle.rejected.match(loginResult)) {
        // signInWithGoogle's own rejection doesn't go through the axios
        // interceptor (it's a Firebase popup, not an API call), so this
        // is the one spot that needs to raise its own toast.
        dispatch(addToast({ message: 'Sign-in was cancelled or failed' }));
        return rejectWithValue('Sign-in cancelled');
      }
    }

    try {
      return await cartApi.addItem(productId, quantity);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await cartApi.addItem(productId, quantity);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await cartApi.updateItem(productId, quantity);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/removeItem', async (productId, { rejectWithValue }) => {
  try {
    return await cartApi.removeItem(productId);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    return await cartApi.clear();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  lineItems: [],
  unavailable: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

function applyCartResponse(state, payload) {
  state.lineItems = payload.lineItems;
  state.unavailable = payload.unavailable;
  state.subtotal = payload.subtotal;
  state.shipping = payload.shipping;
  state.total = payload.total;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Only for signOut — no cart endpoint call, just clears the
    // locally-held state so a previous user's cart doesn't flash on
    // screen before the next person logs in.
    resetCartState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    const pending = [
      fetchCart.pending,
      addItemToCart.pending,
      addToCartSmart.pending,
      updateCartItem.pending,
      removeCartItem.pending,
      clearCart.pending,
    ];
    const fulfilled = [
      fetchCart.fulfilled,
      addItemToCart.fulfilled,
      addToCartSmart.fulfilled,
      updateCartItem.fulfilled,
      removeCartItem.fulfilled,
      clearCart.fulfilled,
    ];
    const rejected = [
      fetchCart.rejected,
      addItemToCart.rejected,
      addToCartSmart.rejected,
      updateCartItem.rejected,
      removeCartItem.rejected,
      clearCart.rejected,
    ];

    pending.forEach((action) =>
      builder.addCase(action, (state) => {
        state.status = 'loading';
        state.error = null;
      })
    );
    fulfilled.forEach((action) =>
      builder.addCase(action, (state, act) => {
        state.status = 'succeeded';
        applyCartResponse(state, act.payload);
      })
    );
    rejected.forEach((action) =>
      builder.addCase(action, (state, act) => {
        state.status = 'failed';
        state.error = act.payload;
      })
    );
  },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCart = (state) => state.cart;
export const selectCartCount = (state) =>
  state.cart.lineItems.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartError = (state) => state.cart.error;
