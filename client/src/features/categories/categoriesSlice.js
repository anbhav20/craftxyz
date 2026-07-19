import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { categoryApi } from '../../api/endpoints/categoryApi.js';
import { mapCategory } from '../../utils/mapCategory.js';
import { selectAllProducts } from '../products/productsSlice.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { categories } = await categoryApi.list();
      return categories.map(mapCategory);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async ({ fields, image }, { dispatch, rejectWithValue }) => {
    try {
      const { category } = await categoryApi.create(fields, image);
      dispatch(addToast({ type: 'success', message: `"${category.name}" created` }));
      dispatch(fetchCategories());
      return category;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ slug, fields, image }, { dispatch, rejectWithValue }) => {
    try {
      const { category } = await categoryApi.update(slug, fields, image);
      dispatch(addToast({ type: 'success', message: `"${category.name}" updated` }));
      dispatch(fetchCategories());
      return category;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (slug, { dispatch, rejectWithValue }) => {
    try {
      await categoryApi.remove(slug);
      dispatch(addToast({ type: 'success', message: 'Category deleted' }));
      dispatch(fetchCategories());
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = { items: [], status: 'idle', error: null, mutationStatus: 'idle' };

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createCategory.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(updateCategory.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateCategory.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(deleteCategory.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(deleteCategory.rejected, (state) => {
        state.mutationStatus = 'failed';
      });
  },
});

export default categoriesSlice.reducer;

export const selectAllCategories = (state) => state.categories.items;
export const selectCategoriesStatus = (state) => state.categories.status;
export const selectCategoryMutationStatus = (state) => state.categories.mutationStatus;

// CategoryCard renders `{category.count} pieces` — computed here from
// whatever products are currently loaded, rather than a separate
// backend endpoint, since Home already fetches both lists anyway.
export const selectCategoriesWithCounts = createSelector(
  [selectAllCategories, selectAllProducts],
  (categories, products) =>
    categories.map((category) => ({
      ...category,
      count: products.filter((product) => product.categorySlug === category.slug).length,
    }))
);

