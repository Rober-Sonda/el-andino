import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Truck } from 'lucide-react';

const Cart = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    totalPrice, 
    totalKilos,
    isFreeShipping,
    setIsCheckoutOpen 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={() => setIsCartOpen(false)}></div>
      <div style={styles.sidebar} className="glass">
        <div style={styles.header}>
          <h2 style={styles.title}>Tu Cosecha Andina</h2>
          <button style={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {isFreeShipping && (
          <div style={styles.freeShippingBanner}>
            <Truck size={20} />
            <span>¡Envío gratis a todo el país habilitado!</span>
          </div>
        )}
        {!isFreeShipping && cart.length > 0 && (
          <div style={styles.shippingInfo}>
            Te faltan {40 - totalKilos}kg para envío gratis.
          </div>
        )}

        <div style={styles.content}>
          {cart.length === 0 ? (
            <div style={styles.empty}>
              <p>Tu saco rústico está vacío. Es hora de acopiar yerba.</p>
              <button 
                style={styles.continueBtn}
                onClick={() => setIsCartOpen(false)}
              >
                Volver a la plantación
              </button>
            </div>
          ) : (
            <div style={styles.items}>
              {cart.map(item => (
                <div key={item.cartItemId} style={styles.itemCard}>
                  <img src={item.image} alt={item.name} style={styles.itemImg} />
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    {item.profile && (
                      <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600', fontStyle: 'italic' }}>
                        Perfil: {item.profile}
                      </p>
                    )}
                    <span style={styles.formatBadge}>
                      {item.format === '500g' ? '½ Kilo' : item.format === '1kg' ? '1 Kilo' : 'A Granel'}
                    </span>
                    <p style={styles.itemDetail}>{item.quantity} x ${item.formattedPrice}</p>
                    <p style={styles.itemTotal}>${item.formattedPrice * item.quantity}</p>
                  </div>
                  <button style={styles.deleteBtn} onClick={() => removeFromCart(item.cartItemId)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.totalRow}>
              <span>Subtotal ({totalKilos}kg):</span>
              <span className="cart-total-price" style={styles.totalPrice}>${totalPrice}</span>
            </div>
            <button style={styles.checkoutBtn} onClick={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}>
              Preparar Envío
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
  },
  sidebar: {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
    height: '100%',
    backgroundColor: 'var(--color-bg-light)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInRight 0.3s forwards',
    zIndex: 1001,
  },
  header: {
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--glass-border)',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: 'var(--color-primary-dark)',
  },
  closeBtn: {
    color: 'var(--color-text)',
    padding: '0.5rem',
  },
  freeShippingBanner: {
    background: '#d4edda',
    color: '#155724',
    padding: '0.8rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '800',
    fontSize: '0.95rem'
  },
  shippingInfo: {
    background: 'rgba(0,0,0,0.05)',
    color: 'var(--color-text-muted)',
    padding: '0.5rem 2rem',
    fontSize: '0.9rem',
    textAlign: 'center',
    fontWeight: '600'
  },
  content: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '2rem',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 0',
    color: 'var(--color-text-muted)'
  },
  continueBtn: {
    marginTop: '2rem',
    padding: '1rem 2rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '600'
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--glass-bg)',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)'
  },
  itemImg: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  itemInfo: {
    flexGrow: 1,
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.1rem',
    color: 'var(--color-primary)'
  },
  formatBadge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    backgroundColor: 'var(--color-accent)',
    color: '#3b2d07',
    padding: '2px 6px',
    borderRadius: '6px',
    fontWeight: '800',
    marginBottom: '0.4rem'
  },
  itemDetail: {
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)'
  },
  itemTotal: {
    fontWeight: '800',
    marginTop: '0.3rem',
    color: 'var(--color-text)'
  },
  deleteBtn: {
    color: '#ff4d4f',
    padding: '0.5rem',
  },
  footer: {
    padding: '1.5rem 2rem',
    borderTop: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  totalPrice: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.8rem',
    color: 'var(--color-primary-dark)',
  },
  checkoutBtn: {
    width: '100%',
    padding: '1.2rem',
    backgroundColor: 'var(--color-accent)',
    color: '#1a1714',
    fontWeight: '800',
    fontSize: '1.2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(74, 124, 46, 0.4)',
  }
};

// Inject Dark Mode fix for free shipping dynamically
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    [data-theme='dark'] .free-shipping-banner {
      background: #1a3313 !important;
      color: #a4e08c !important;
    }
    [data-theme='dark'] .cart-total-price {
      color: var(--color-accent) !important;
    }
  `;
  document.head.appendChild(styleSheet);
  styles.freeShippingBanner.className = 'free-shipping-banner';
}

export default Cart;
