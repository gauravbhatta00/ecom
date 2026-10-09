import { HomeRedirect } from "./components/layout/home-redirect";
import { StoreHydration } from "./hooks/use-store-hydration";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ProductList from "./screens/ProductList";
import ProductDetails from "./screens/ProductDetails";
import Wishlist from "./screens/Wishlist";
import About from "./screens/About";
import Contact from "./screens/Contact";
import Navbar from './components/Navbar';
import { Footer } from './components/layout/footer';
import CartPage from './screens/CartPage';
import CheckoutPage from './screens/CheckoutPage';
import LoginPage from "./screens/Login";
import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import Profile from "./screens/Profile";
import OrdersPage from "./screens/Orders";
import Dashboard from "./screens/Dashboard";
import AdminProducts from "./components/admin/AdminProducts";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminRoute from './components/AdminRoute';
import PrivateRouter from './components/PrivateRouter';
import { MotionConfig } from 'framer-motion';
import { NotFound } from './components/layout/not-found';
import { RouteEffects } from './components/layout/route-effects';
import './styles/admin.css';

function App() {
  return (
    <MotionConfig reducedMotion="user"><Router>
      <AppContent />
    </Router></MotionConfig>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <StoreHydration /><div id="top" />
          <a href="#main-content" className="skip-link">Skip to content</a>
          {!isAdminArea && <Navbar />}
          <div id="main-content" tabIndex={-1} className="legacy-content outline-none">
          <RouteEffects />
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route element={<PrivateRouter />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
          {!isAdminArea && <Footer />}
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
