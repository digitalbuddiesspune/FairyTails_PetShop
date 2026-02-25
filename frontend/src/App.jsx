import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import AccountSettingsPage from './pages/AccountSettingsPage';
import Contact from './pages/Contact';
import About from './pages/About';
import CategoryPage from './pages/CategoryPage';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import InvoicePage from './pages/InvoicePage';
import WishlistPage from './pages/WishlistPage';
import SearchPage from './pages/SearchPage';
import AdminSignIn from './pages/AdminSignIn';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminMyProducts from './pages/admin/AdminMyProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import './App.css';

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout component for pages with Navbar and Footer
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth Pages - No Navbar/Footer */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Admin Pages */}
        <Route path="/admin/signin" element={<AdminSignIn />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="my-products" element={<AdminMyProducts />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="order-details/:id" element={<AdminOrderDetails />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Main Pages - With Navbar/Footer */}
        <Route path="/" element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        } />
        <Route path="/home" element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        } />
        <Route path="/account-settings" element={
          <MainLayout>
            <AccountSettingsPage />
          </MainLayout>
        } />
        <Route path="/contact" element={
          <MainLayout>
            <Contact />
          </MainLayout>
        } />
        <Route path="/about" element={
          <MainLayout>
            <About />
          </MainLayout>
        } />
        <Route path="/category/:slug" element={
          <MainLayout>
            <CategoryPage />
          </MainLayout>
        } />
        <Route path="/products" element={
          <MainLayout>
            <CategoryProducts />
          </MainLayout>
        } />
        <Route path="/search" element={
          <MainLayout>
            <SearchPage />
          </MainLayout>
        } />
        <Route path="/product/:id" element={
          <MainLayout>
            <ProductDetail />
          </MainLayout>
        } />
        <Route path="/cart" element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        } />
        <Route path="/checkout" element={
          <MainLayout>
            <CheckoutPage />
          </MainLayout>
        } />
        <Route path="/wishlist" element={
          <MainLayout>
            <WishlistPage />
          </MainLayout>
        } />
        <Route path="/orders" element={
          <MainLayout>
            <OrdersPage />
          </MainLayout>
        } />
        <Route path="/order-details/:id" element={
          <MainLayout>
            <OrderDetailsPage />
          </MainLayout>
        } />
        <Route path="/invoice/:id" element={<InvoicePage />} />
      </Routes>
    </Router>
  );
}

export default App;
