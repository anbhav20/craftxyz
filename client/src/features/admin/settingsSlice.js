import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/endpoints/adminApi.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchSettings = createAsyncThunk('adminSettings/fetch', async (_, { rejectWithValue }) => {
  try {
    const { settings } = await adminApi.getSettings();
    return settings;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const saveSettings = createAsyncThunk(
  'adminSettings/save',
  async (fields, { dispatch, rejectWithValue }) => {
    try {
      const { settings } = await adminApi.updateSettings(fields);
      dispatch(addToast({ type: 'success', message: 'Settings saved' }));
      return settings;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = { data: null, status: 'idle', saveStatus: 'idle', error: null };

const settingsSlice = createSlice({
  name: 'adminSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveSettings.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.data = action.payload;
      })
      .addCase(saveSettings.rejected, (state) => {
        state.saveStatus = 'failed';
      });
  },
});

export default settingsSlice.reducer;
export const selectSettings = (state) => state.adminSettings.data;
export const selectSettingsStatus = (state) => state.adminSettings.status;
export const selectSettingsSaveStatus = (state) => state.adminSettings.saveStatus;
