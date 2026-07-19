import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/endpoints/adminApi.js';

export const fetchCustomers = createAsyncThunk(
  'adminCustomers/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await adminApi.listCustomers(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = { items: [], total: 0, page: 1, pages: 1, status: 'idle', error: null };

const customersSlice = createSlice({
  name: 'adminCustomers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.customers;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default customersSlice.reducer;
export const selectCustomers = (state) => state.adminCustomers.items;
export const selectCustomersStatus = (state) => state.adminCustomers.status;
