import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;
