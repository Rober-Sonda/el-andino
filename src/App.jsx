import React, { useEffect, useState } from 'react';
import { ShoppingBag, Leaf } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import Hero from './components/Hero';
import BenefitsBanner from './components/BenefitsBanner';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import MateSecrets from './components/MateSecrets';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <Leaf color="var(--color-primary)" size={28} />
        El Andino
      </div>
      
      <div style={{display: 'flex', alignItems: 'center'}}>
        <ThemeToggle />
        <button className="cart-button" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag size={24} />
          {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
        </button>
      </div>
    </nav>
  );
};

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <BenefitsBanner />
        <ProductList />
        <MateSecrets />
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
    <CartProvider>
      <Layout />
    </CartProvider>
  );
}

export default App;
