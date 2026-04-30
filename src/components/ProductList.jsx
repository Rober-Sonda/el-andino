import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

const ProductList = () => {
  const { catalog } = useCart();
  const [activeTab, setActiveTab] = useState('puras');
  
  const yerbas = catalog?.filter(p => p.category === 'yerbas' && p.isActive !== false) || [];
  const blends = catalog?.filter(p => p.category === 'blends' && p.isActive !== false) || [];
  const accesorios = catalog?.filter(p => p.category === 'accesorios' && p.isActive !== false) || [];
  const otros = catalog?.filter(p => (p.category === 'otros' || !p.category) && p.isActive !== false) || [];

  return (
    <section id="productos" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.heading}>
          <h2 style={styles.title}>Nuestra Cosecha</h2>
          <p style={styles.subtitle}>Directas del secadero natural, respetando el tiempo y la frescura de nuestra tierra noble.</p>
        </div>
        
        <div style={styles.catalogWrapper}>
          {(yerbas.length > 0 || blends.length > 0) && (
            <div style={styles.categorySection}>
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', marginTop: '-1.5rem'}}>
                <div style={styles.segmentContainer}>
                  {yerbas.length > 0 && (
                    <button 
                      onClick={() => setActiveTab('puras')} 
                      style={{...styles.segmentBtn, background: activeTab === 'puras' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'puras' ? '#fff' : 'var(--color-primary)'}}
                    >
                      Yerbas Puras
                    </button>
                  )}
                  {blends.length > 0 && (
                    <button 
                      onClick={() => setActiveTab('blends')} 
                      style={{...styles.segmentBtn, background: activeTab === 'blends' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'blends' ? '#fff' : 'var(--color-primary)'}}
                    >
                      Yerbas Compuestas
                    </button>
                  )}
                </div>
              </div>
              
              <div className="product-carousel">
                {activeTab === 'puras' 
                  ? yerbas.map(product => <ProductCard key={product.id} product={product} />)
                  : blends.map(product => <ProductCard key={product.id} product={product} />)
                }
              </div>
            </div>
          )}

          {accesorios.length > 0 && (
            <div style={styles.categorySection}>
              <h3 style={styles.categoryTitle}>Accesorios y Equipamiento</h3>
              <div className="product-carousel">
                {accesorios.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          )}

          {otros.length > 0 && (
            <div style={styles.categorySection}>
              <h3 style={styles.categoryTitle}>Otras Variedades</h3>
              <div className="product-carousel">
                {otros.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '8rem 5%',
    backgroundColor: 'var(--color-bg-light)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    marginBottom: '1rem',
    color: 'var(--color-primary-dark)'
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '1.2rem',
  },
  catalogWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4rem',
  },
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  categoryTitle: {
    fontSize: '2rem',
    color: 'var(--color-primary-dark)',
    borderBottom: '2px solid var(--color-accent)',
    paddingBottom: '0.5rem',
    width: 'fit-content',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  categoryTitle: {
    fontSize: '2rem',
    color: 'var(--color-primary-dark)',
    borderBottom: '2px solid var(--color-accent)',
    paddingBottom: '0.5rem',
    width: 'fit-content',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '1rem',
  },
  segmentContainer: {
    display: 'flex',
    background: 'rgba(74, 124, 46, 0.1)',
    borderRadius: '30px',
    padding: '0.4rem',
    gap: '0.4rem',
    border: '1px solid rgba(74, 124, 46, 0.2)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
  },
  segmentBtn: {
    border: 'none',
    padding: '0.7rem 1.8rem',
    borderRadius: '25px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.95rem'
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .product-carousel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2.5rem;
    }
    @media (max-width: 900px) {
      .product-carousel {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 2rem;
        gap: 1.5rem;
        -webkit-overflow-scrolling: touch;
      }
      .product-carousel > div {
        min-width: 280px;
        width: 280px;
        scroll-snap-align: center;
        flex: 0 0 auto;
      }
      .product-carousel::-webkit-scrollbar {
        height: 6px;
      }
      .product-carousel::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.05);
        border-radius: 10px;
      }
      .product-carousel::-webkit-scrollbar-thumb {
        background: var(--color-accent);
        border-radius: 10px;
      }
      [data-theme='dark'] .product-carousel::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProductList;
