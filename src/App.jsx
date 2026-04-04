import React, { useEffect, useState } from 'react';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Hero from './components/Hero';
import BenefitsBanner from './components/BenefitsBanner';
import ProductList from './components/ProductList';
import BlendCreator from './components/BlendCreator';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import MateSecrets from './components/MateSecrets';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { currentUser, loginWithGoogle, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/logo_nav.png" alt="El Andino Logo" className="nav-logo-img" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <ThemeToggle />
        
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)' }} title={currentUser.displayName || "Usuario"} />
            ) : (
              <User size={24} color="var(--color-text)" />
            )}
            <button onClick={logout} title="Cerrar sesión" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}>
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button className="nav-btn" onClick={loginWithGoogle} style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} /> Entrar
          </button>
        )}

        <button className="cart-button" onClick={() => setIsCartOpen(true)} style={{ marginLeft: '4px' }}>
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
        <BlendCreator />
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
    <AuthProvider>
      <CartProvider>
        <Layout />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
