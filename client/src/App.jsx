import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StoreLayout from './components/StoreLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import PolicyPage from './pages/PolicyPage';
import CheckoutPage from './pages/CheckoutPage.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import RequireCustomerAuth from './components/RequireCustomerAuth.jsx';
import AdminLogin from './admin/pages/AdminLogin.jsx';
import AdminForgotPassword from './admin/pages/AdminForgotPassword.jsx';
import AdminResetPassword from './admin/pages/AdminResetPassword.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';
import RequireAdmin from './admin/components/RequireAdmin.jsx';
import AdminDashboard from './admin/pages/AdminDashboard.jsx';
import AdminProducts from './admin/pages/AdminProducts.jsx';
import AdminCategories from './admin/pages/AdminCategories.jsx';
import AdminOrders from './admin/pages/AdminOrders.jsx';
import AdminCustomers from './admin/pages/AdminCustomers.jsx';
import AdminSettings from './admin/pages/AdminSettings.jsx';
import AdminAdmins from './admin/pages/AdminAdmins.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/policies/:policyId" element={<PolicyPage />} />
          <Route
            path="/checkout"
            element={
              <RequireCustomerAuth>
                <CheckoutPage />
              </RequireCustomerAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireCustomerAuth>
                <MyOrders />
              </RequireCustomerAuth>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <RequireCustomerAuth>
                <OrderDetail />
              </RequireCustomerAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="admins" element={<AdminAdmins />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
