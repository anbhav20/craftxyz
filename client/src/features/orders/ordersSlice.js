import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '../../api/endpoints/orderApi.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await orderApi.list(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { order } = await orderApi.getById(id);
      return order;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, orderStatus }, { dispatch, rejectWithValue }) => {
    try {
      const { order } = await orderApi.updateStatus(id, orderStatus);
      dispatch(addToast({ type: 'success', message: `Order marked ${orderStatus}` }));
      return order;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  status: 'idle',
  error: null,
  current: null,
  currentStatus: 'idle',
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.orders;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.currentStatus = 'loading';
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state) => {
        state.currentStatus = 'failed';
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.current = action.payload;
        const idx = state.items.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default ordersSlice.reducer;

export const selectOrders = (state) => state.orders.items;
export const selectOrdersStatus = (state) => state.orders.status;
export const selectOrdersPagination = (state) => ({
  total: state.orders.total,
  page: state.orders.page,
  pages: state.orders.pages,
});
export const selectCurrentOrder = (state) => state.orders.current;
export const selectCurrentOrderStatus = (state) => state.orders.currentStatus;
