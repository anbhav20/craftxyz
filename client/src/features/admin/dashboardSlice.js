import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/endpoints/adminApi.js';

export const fetchDashboard = createAsyncThunk(
  'adminDashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getDashboard();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  totalRevenue: 0,
  recentOrders: [],
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        Object.assign(state, action.payload);
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
export const selectDashboard = (state) => state.adminDashboard;
