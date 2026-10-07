import { HomeRedirect } from "./components/layout/home-redirect";
import { StoreHydration } from "./hooks/use-store-hydration";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import OrdersPage from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from './components/AdminRoute';
import PrivateRouter from './components/PrivateRouter';
import { MotionConfig } from 'framer-motion';
import { NotFound } from './components/layout/not-found';
import { RouteEffects } from './components/layout/route-effects';

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
          <Navbar />
          <div id="main-content" tabIndex={-1} className="legacy-content outline-none">
          <RouteEffects />
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<CartPage />} />
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
