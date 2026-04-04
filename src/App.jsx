import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BenefitsBanner from './components/BenefitsBanner';
import ProductList from './components/ProductList';
import BlendCreator from './components/BlendCreator';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import MateSecrets from './components/MateSecrets';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
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
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
