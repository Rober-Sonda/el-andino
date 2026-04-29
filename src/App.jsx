import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BenefitsBanner from './components/BenefitsBanner';
import ProductList from './components/ProductList';
import BlendCreator from './components/BlendCreator';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import MateSecrets from './components/MateSecrets';
import ThemeToggle from './components/ThemeToggle';
import HistoriaDelMate from './components/HistoriaDelMate';
import './App.css';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        if (id === 'inicio') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const element = document.getElementById(id);
        if (element) {
          const topPos = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: topPos, behavior: 'smooth' });
        }
      }, 100);
      // Clean up state so it doesn't re-trigger on arbitrary re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <>
      <main>
        <div id="inicio"><Hero /></div>
        <BenefitsBanner />
        <div id="variedades"><ProductList /></div>
        <div id="alquimista"><BlendCreator /></div>
        <div id="sabiduria"><MateSecrets /></div>
      </main>
      
      <Cart />
      <CheckoutModal />
      
      <footer className="footer">
        <h3>El Andino</h3>
        <p>Tradición y nobleza directa del campo a tu mesa.</p>
        <p>100% Orgánico • Sin T.A.C.C.</p>
        <p style={{marginTop: '2rem', opacity: 0.5}}>© 2026 El Andino. Todos los derechos reservados.</p>
      </footer>
    </>
  );
};

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminNotificationListener = lazy(() => import('./components/AdminNotificationListener'));

const AppRoutes = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email === 'rober.junin@gmail.com';

  return (
    <div className="app-container">
      <Navbar />
      {isAdmin && (
        <Suspense fallback={null}>
          <AdminNotificationListener />
        </Suspense>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/historia" element={<HistoriaDelMate />} />
        {isAdmin && (
          <Route path="/admin" element={
            <Suspense fallback={<div style={{marginTop: '100px', textAlign: 'center'}}>Cargando panel seguro...</div>}>
              <AdminDashboard />
            </Suspense>
          } />
        )}
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
