import { createSlice, nanoid } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [], cartDrawerOpen: false },
  reducers: {
    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare({ type = 'error', message }) {
        return { payload: { id: nanoid(), type, message } };
      },
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    openCartDrawer(state) {
      state.cartDrawerOpen = true;
    },
    closeCartDrawer(state) {
      state.cartDrawerOpen = false;
    },
  },
});

export const { addToast, removeToast, openCartDrawer, closeCartDrawer } = uiSlice.actions;
export default uiSlice.reducer;

export const selectToasts = (state) => state.ui.toasts;
export const selectCartDrawerOpen = (state) => state.ui.cartDrawerOpen;
