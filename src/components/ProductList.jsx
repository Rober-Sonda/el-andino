import React from 'react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

const ProductList = () => {
  const { catalog } = useCart();
  
  return (
    <section id="productos" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.heading}>
          <h2 style={styles.title}>Nuestras Variedades</h2>
          <p style={styles.subtitle}>Directas del secadero natural, respetando el tiempo y la frescura de nuestra tierra noble.</p>
        </div>
        
        <div style={styles.grid}>
          {catalog?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2.5rem',
  }
};

export default ProductList;
