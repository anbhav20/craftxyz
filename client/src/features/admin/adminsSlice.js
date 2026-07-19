import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/endpoints/adminApi.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchAdmins = createAsyncThunk('adminAccounts/fetch', async (_, { rejectWithValue }) => {
  try {
    const { admins } = await adminApi.listAdmins();
    return admins;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createAdminAccount = createAsyncThunk(
  'adminAccounts/create',
  async (fields, { dispatch, rejectWithValue }) => {
    try {
      const { admin } = await adminApi.createAdmin(fields);
      dispatch(addToast({ type: 'success', message: `Admin account created for ${admin.email}` }));
      dispatch(fetchAdmins());
      return admin;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = { items: [], status: 'idle', error: null, mutationStatus: 'idle' };

const adminsSlice = createSlice({
  name: 'adminAccounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createAdminAccount.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createAdminAccount.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createAdminAccount.rejected, (state) => {
        state.mutationStatus = 'failed';
      });
  },
});

export default adminsSlice.reducer;
export const selectAdminAccounts = (state) => state.adminAccounts.items;
export const selectAdminAccountsStatus = (state) => state.adminAccounts.status;
export const selectCreateAdminStatus = (state) => state.adminAccounts.mutationStatus;
