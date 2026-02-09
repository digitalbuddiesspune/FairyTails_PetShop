import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';
import CategoryPage from './pages/CategoryPage';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AdminSignIn from './pages/AdminSignIn';
import AdminPanel from './pages/AdminPanel';
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
      <main className="flex-1">
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
        
        {/* Admin Pages - No Navbar/Footer */}
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route path="/admin" element={<AdminPanel />} />
        
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
        <Route path="/profile" element={
          <MainLayout>
            <Profile />
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
        <Route path="/wishlist" element={
          <MainLayout>
            <WishlistPage />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
