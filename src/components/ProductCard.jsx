import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Scale, Leaf, Award, Droplets } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart, getQuantity } = useCart();
  const [selectedFormat, setSelectedFormat] = useState('1kg');

  // Fixed Pricing Rule
  const getFormattedPrice = (format) => {
    if (format === '500g') return 4000;
    if (format === 'granel') return 6000;
    return 7500; // 1kg
  };

  const currentPrice = getFormattedPrice(selectedFormat);
  const quantity = getQuantity(product.id, selectedFormat);

  // Bulk requires min 5kg
  const isBulk = selectedFormat === 'granel';

  const handleIncrement = () => {
    // If it's bulk and quantity is 0, start at 5
    if (isBulk && quantity === 0) {
      addToCart(product, selectedFormat, currentPrice, 5);
    } else {
      addToCart(product, selectedFormat, currentPrice, quantity + 1);
    }
  };

  const handleDecrement = () => {
    // If it's bulk and going below 5, drop to 0
    if (isBulk && quantity <= 5) {
      addToCart(product, selectedFormat, currentPrice, 0);
    } else {
      addToCart(product, selectedFormat, currentPrice, quantity - 1);
    }
  };

  return (
    <div className="product-card" style={styles.card}>
      <div style={styles.imageContainer}>
        <img src={product.image} alt={product.name} style={styles.image} />
        {quantity > 0 && <div style={styles.badge}>{quantity} {isBulk ? 'kg (Granel)' : 'paquetes'}</div>}
      </div>
      
      <div style={styles.content}>
        <div className="badge-group">
          {product.isOrganic && <span className="health-badge badge-organic"><Leaf size={14} /> Orgánica</span>}
          {product.isSinTacc && <span className="health-badge badge-tacc"><Award size={14} /> Sin T.A.C.C</span>}
          {product.isAntiacid && <span className="health-badge badge-antiacid"><Droplets size={14} /> Antiácida</span>}
        </div>

        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.description}>{product.description}</p>
        
        <div style={styles.formatSelector}>
          <button 
            className="format-btn"
            style={{...styles.formatBtn, ...(selectedFormat === '500g' ? styles.formatBtnActive : {})}} 
            onClick={() => setSelectedFormat('500g')}
          >
            ½ Kilo
          </button>
          <button 
            className="format-btn"
            style={{...styles.formatBtn, ...(selectedFormat === '1kg' ? styles.formatBtnActive : {})}} 
            onClick={() => setSelectedFormat('1kg')}
          >
            1 Kilo
          </button>
          <button 
            className="format-btn"
            style={{...styles.formatBtn, ...(isBulk ? styles.formatBtnActive : {})}} 
            onClick={() => setSelectedFormat('granel')}
          >
            <Scale size={14} style={{marginRight: '4px'}}/>
            A Granel
          </button>
        </div>

        <div style={styles.priceRow}>
          <p className="price-text" style={styles.price}>${currentPrice}</p>
          <span style={styles.perKg}>
             {selectedFormat === '500g' ? '/ 500g' : isBulk ? '/ kg (Mín. 5Kg)' : '/ kg'}
          </span>
        </div>
        
        <div style={styles.actions}>
          {quantity === 0 ? (
             <button style={styles.addButton} onClick={handleIncrement}>
               {isBulk ? 'Sumar 5Kg (Granel)' : 'Agregar al Pedido'}
             </button>
          ) : (
            <div style={styles.counter}>
              <button style={styles.counterBtn} onClick={handleDecrement}>
                <Minus size={18} />
              </button>
              <span style={styles.quantity}>{quantity}</span>
              <button style={styles.counterBtn} onClick={handleIncrement}>
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'var(--glass-bg)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-soft)',
    transition: 'var(--transition-normal)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    height: '240px',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'var(--transition-normal)',
  },
  badge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'var(--color-accent)',
    color: '#ffffff',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '800',
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
  },
  content: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  name: {
    fontSize: '1.6rem',
    marginBottom: '0.5rem',
    color: 'var(--color-primary)'
  },
  description: {
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
    marginBottom: '1rem',
    flexGrow: 1,
    lineHeight: '1.4'
  },
  formatSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    background: 'rgba(0,0,0,0.05)',
    padding: '4px',
    borderRadius: '12px'
  },
  formatBtn: {
    flex: 1,
    padding: '0.6rem 0',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast)',
    border: '1px solid rgba(0,0,0,0.05)',
    background: 'transparent'
  },
  formatBtnActive: {
    background: 'var(--color-text)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderColor: 'transparent'
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '1.2rem',
  },
  price: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--color-primary-dark)',
    fontFamily: 'var(--font-serif)'
  },
  perKg: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--color-text-muted)'
  },
  actions: {
    marginTop: 'auto'
  },
  addButton: {
    width: '100%',
    padding: '1.2rem',
    background: 'var(--color-primary)',
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'var(--transition-fast)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(42, 51, 37, 0.25)',
    cursor: 'pointer'
  },
  counter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--color-bg-dark)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--color-accent)'
  },
  counterBtn: {
    padding: '1rem 1.5rem',
    color: '#f6efe6',
    transition: 'var(--transition-fast)',
  },
  quantity: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#f6efe6',
  }
};

// Add to global css dynamically
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    [data-theme='dark'] .format-btn { color: #85837f; border-color: rgba(255,255,255,0.05); }
    [data-theme='dark'] .formatSelector { background: rgba(0,0,0,0.2); }
    [data-theme='dark'] .format-btn[style*="background: var(--color-text)"] {
      background: var(--color-accent) !important;
      color: #ffffff !important;
    }
    [data-theme='dark'] .price-text {
      color: var(--color-accent) !important;
    }
    button[style*="background: var(--color-primary)"]:hover {
      background: var(--color-primary-dark) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProductCard;
