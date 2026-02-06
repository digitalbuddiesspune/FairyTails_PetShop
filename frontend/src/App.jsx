import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';
import './App.css';

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
      <Routes>
        {/* Auth Pages - No Navbar/Footer */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        
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
      </Routes>
    </Router>
  );
}

export default App;
