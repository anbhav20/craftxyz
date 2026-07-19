import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer.jsx';

function StoreLayout() {
  return (
    <div className="min-h-screen bg-[#eeeee9] text-[#1d1d1a]">
      <Navbar />
      <Outlet />
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default StoreLayout;
