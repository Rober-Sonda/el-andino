import React from 'react';
import ProductCard from './ProductCard';

const products = [
  {
    id: 'premium',
    name: 'Yerba Premium',
    description: 'Estacionada naturalmente por 24 meses. Suave, duradera y de molienda equilibrada. Ideal para largas rondas.',
    image: '/premium.png',
    isOrganic: true,
    isSinTacc: true,
    isAntiacid: true
  },
  {
    id: 'ahumada',
    name: 'Yerba Ahumada',
    description: 'Secada con maderas seleccionadas (Barbacuá). Un sabor intenso, profundo y con carácter de monte.',
    image: '/ahumada.png',
    isOrganic: true,
    isSinTacc: true,
    isAntiacid: false
  },
  {
    id: 'uruguaya-despalada',
    name: 'Uruguaya Despalada',
    description: 'Corte fino sin palo, pura hoja. Estilo canario para un mate fuerte, espumoso y de sabor prologando.',
    image: '/despalada.png',
    isOrganic: false,
    isSinTacc: true,
    isAntiacid: true
  },
  {
    id: 'uruguaya-molida',
    name: 'Uruguaya Molida',
    description: 'Tradicional molienda fina con equilibrio perfecto. La clásica y elegante elección oriental.',
    image: '/molida.png',
    isOrganic: true,
    isSinTacc: true,
    isAntiacid: false
  }
];

const ProductList = () => {
  return (
    <section id="productos" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.heading}>
          <h2 style={styles.title}>Nuestras Variedades</h2>
          <p style={styles.subtitle}>Directas del sembradío, seleccionadas a mano para los paladares más exigentes</p>
        </div>
        
        <div style={styles.grid}>
          {products.map(product => (
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
