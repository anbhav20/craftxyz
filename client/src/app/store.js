import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import productsReducer from '../features/products/productsSlice.js';
import categoriesReducer from '../features/categories/categoriesSlice.js';
import cartReducer from '../features/cart/cartSlice.js';
import wishlistReducer from '../features/wishlist/wishlistSlice.js';
import ordersReducer from '../features/orders/ordersSlice.js';
import addressesReducer from '../features/addresses/addressesSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import adminDashboardReducer from '../features/admin/dashboardSlice.js';
import adminCustomersReducer from '../features/admin/customersSlice.js';
import adminSettingsReducer from '../features/admin/settingsSlice.js';
import adminAccountsReducer from '../features/admin/adminsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    addresses: addressesReducer,
    ui: uiReducer,
    adminDashboard: adminDashboardReducer,
    adminCustomers: adminCustomersReducer,
    adminSettings: adminSettingsReducer,
    adminAccounts: adminAccountsReducer,
  },
});
