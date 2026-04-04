import React, { useEffect, useState } from 'react';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { currentUser, loginWithGoogle, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topPos = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleNavClick('inicio')}>
          <img src="/isotipo.png" alt="El Andino Logo" className="nav-logo-img logo-light" style={{ height: '44px', width: '44px', objectFit: 'contain' }} />
          <img src="/isotipo_oscuro.png" alt="El Andino Logo" className="nav-logo-img logo-dark" style={{ height: '44px', width: '44px', objectFit: 'contain' }} />
        </div>
        
        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <button onClick={() => handleNavClick('inicio')} className="nav-link">Inicio</button>
          <button onClick={() => handleNavClick('variedades')} className="nav-link">Variedades</button>
          <button onClick={() => handleNavClick('alquimista')} className="nav-link">Blend Creator</button>
          <button onClick={() => handleNavClick('sabiduria')} className="nav-link">Secretos</button>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <div className="desktop-only" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
             <ThemeToggle />
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {currentUser.photoURL && (
                  <img src={currentUser.photoURL} alt="Profile" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} title={currentUser.displayName || "Usuario"} />
                )}
                <button className="cart-button" onClick={logout} title="Cerrar sesión">
                  <LogOut size={24} />
                </button>
              </div>
            ) : (
              <button className="cart-button" onClick={loginWithGoogle} title="Iniciar sesión">
                <User size={24} />
              </button>
            )}
          </div>

          <button className="cart-button" onClick={() => setIsCartOpen(true)} style={{ marginLeft: '4px' }}>
            <ShoppingBag size={24} />
            {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
          </button>

          {/* Hamburger Icon */}
          <button className={`hamburger-btn mobile-only ${menuOpen ? 'menu-open-btn' : ''}`} onClick={toggleMenu}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
         <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => handleNavClick('inicio')} className="mobile-link">Inicio</button>
            <button onClick={() => handleNavClick('variedades')} className="mobile-link">Variedades Puras</button>
            <button onClick={() => handleNavClick('alquimista')} className="mobile-link">Armá tu Blend</button>
            <button onClick={() => handleNavClick('sabiduria')} className="mobile-link">Sabiduría del Mate</button>
            
            <div className="mobile-divider"></div>
            
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
               <ThemeToggle />
            </div>

            {currentUser ? (
               <div className="mobile-user-section">
                  {currentUser.photoURL && <img src={currentUser.photoURL} alt="Profile" className="mobile-profile-pic"/>}
                  <span className="mobile-user-name">{currentUser.displayName}</span>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="mobile-logout"><LogOut size={16}/> Cerrar Sesión</button>
               </div>
            ) : (
               <button onClick={() => { loginWithGoogle(); setMenuOpen(false); }} className="mobile-login">
                  <User size={18} /> Iniciar Sesión con Google
               </button>
            )}
         </div>
      </div>
    </>
  );
};

export default Navbar;
