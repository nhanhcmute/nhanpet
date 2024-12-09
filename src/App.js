import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Import các trang
import HomePage from './pages/client/Homepage';
import ProductPage from './pages/client/ProductPage';
import LoginPage from './pages/client/LoginPage';
import SignupPage from './pages/client/SignUp';
import ProfilePage from './pages/client/ProfilePage';
import PersonalInfoPage from './pages/client/PersonalInfoPage';
import ProductList from './pages/client/ProductList';
import CartPage from './pages/client/CartPage';
import CheckoutPage from './pages/client/CheckoutPage';
import EditProfilePage from './pages/client/EditProfilePage';
import OrderPage from './pages/client/OrderPage';
import AddressPage from './pages/client/AddressPage';
import ExpertAdvicePage from './pages/client/ExpertAdvicePage';
import PetSuppliesPage from './pages/client/PetSuppliesPage';
import ExclusiveDealsPage from './pages/client/ExclusiveDealsPage';
import Bank from './pages/client/Bank';
import Alerts from './pages/client/Alerts';
import NotificationSetting from './pages/client/NotificationSetting';
import AboutUs from './pages/client/AboutUs';
import Contact from './pages/client/Contact';
import Blog from './pages/client/Blog';
import Pricacy from './pages/client/Privacy';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPage from './pages/admin/AdminPage';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import CustomerManagement from './pages/admin/CustomerManagement';
import Promotions from './pages/admin/Promotions';
import Inventory from './pages/admin/Inventory';
import Reports from './pages/admin/Reports';
import UserManagementPage from './pages/admin/UserManagementPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import SettingsPage from './pages/admin/SettingsPage';
import Reviews from './pages/admin/Reviews';
import Payments from './pages/admin/Payments';
import Shipping from './pages/admin/Shipping';

// Layouts
import Layout from './function/Layout';
import AdminLayout from './function/AdminLayout';

// Context
import { CartProvider } from './function/CartContext';
function App() {
  const [user, setUser] = useState(null);

  const clientId = 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <CartProvider>
          <Routes>
            {/* Routes dành cho khách hàng */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/nhanpet" element={<HomePage/>} />
              <Route path="/login" element={<LoginPage setUser={setUser} />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/personal" element={<PersonalInfoPage />} />
              <Route path="/productlist" element={<ProductList />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/address" element={<AddressPage />} />
              <Route path="/bank" element={<Bank/>} />
              <Route path="/notificationsetting" element={<NotificationSetting/>}/>
              <Route path="/expertadvice" element={<ExpertAdvicePage/>} />
              <Route path="/supplies" element={<PetSuppliesPage/>} />
              <Route path="/exclusivedeals" element={<ExclusiveDealsPage/>} />
              <Route path="/aboutus" element={<AboutUs/>} />
              <Route path="/contact" element={<Contact/>} />
              <Route path="/blog" element={<Blog/>} />
              <Route path="/privacy" element={<Pricacy/>} />
              <Route path="/alerts" element={<Alerts/>} />
            </Route>

            {/* Routes dành cho Admin */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/ordermanagement" element={<Orders />} />
              <Route path="/admin/customers" element={<CustomerManagement />} />
              <Route path="/admin/inventory" element={<Inventory />} />
              <Route path="/admin/promotions" element={<Promotions />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/usermanagement" element={<UserManagementPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/reviews" element={<Reviews />} />
              <Route path="/admin/payments" element={<Payments />} />
              <Route path="/admin/shipping" element={<Shipping />} />
            </Route>
          </Routes>
        </CartProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
