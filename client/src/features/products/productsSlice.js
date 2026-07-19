import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../api/endpoints/productApi.js';
import { mapProduct } from '../../utils/mapProduct.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await productApi.list(params);
      return { ...data, products: data.products.map(mapProduct) };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchOne',
  async (slug, { rejectWithValue }) => {
    try {
      const { product } = await productApi.getBySlug(slug);
      return mapProduct(product);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Admin mutations. Each re-fetches page 1 with a high limit afterward
// so the admin product table reflects the change immediately, rather
// than manually patching the list in the reducer (simpler, and this
// list is small enough that refetching is cheap).
export const createProduct = createAsyncThunk(
  'products/create',
  async ({ fields, images }, { dispatch, rejectWithValue }) => {
    try {
      const { product } = await productApi.create(fields, images);
      dispatch(addToast({ type: 'success', message: `"${product.title}" created` }));
      dispatch(fetchProducts({ limit: 100 }));
      return product;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ slug, fields, images }, { dispatch, rejectWithValue }) => {
    try {
      const { product } = await productApi.update(slug, fields, images);
      dispatch(addToast({ type: 'success', message: `"${product.title}" updated` }));
      dispatch(fetchProducts({ limit: 100 }));
      return product;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (slug, { dispatch, rejectWithValue }) => {
    try {
      await productApi.remove(slug);
      dispatch(addToast({ type: 'success', message: 'Product deleted' }));
      dispatch(fetchProducts({ limit: 100 }));
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
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  current: null,
  currentStatus: 'idle',
  currentError: null,
  mutationStatus: 'idle', // tracks create/update/delete, separate from the list fetch
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createProduct.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateProduct.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(deleteProduct.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.mutationStatus = 'failed';
      });
  },
});

export default productsSlice.reducer;

export const selectAllProducts = (state) => state.products.items;
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error;
export const selectCurrentProduct = (state) => state.products.current;
export const selectCurrentProductStatus = (state) => state.products.currentStatus;
export const selectProductMutationStatus = (state) => state.products.mutationStatus;

