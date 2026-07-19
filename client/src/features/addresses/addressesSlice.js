import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../../api/endpoints/userApi.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchAddresses = createAsyncThunk('addresses/fetch', async (_, { rejectWithValue }) => {
  try {
    const { addresses } = await userApi.listAddresses();
    return addresses;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addAddress = createAsyncThunk(
  'addresses/add',
  async (address, { dispatch, rejectWithValue }) => {
    try {
      const { addresses } = await userApi.addAddress(address);
      dispatch(addToast({ type: 'success', message: 'Address saved' }));
      return addresses;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = { items: [], status: 'idle', error: null, addStatus: 'idle' };

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addAddress.pending, (state) => {
        state.addStatus = 'loading';
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addAddress.rejected, (state) => {
        state.addStatus = 'failed';
      });
  },
});

export default addressesSlice.reducer;
export const selectAddresses = (state) => state.addresses.items;
export const selectAddressesStatus = (state) => state.addresses.status;
export const selectAddAddressStatus = (state) => state.addresses.addStatus;
