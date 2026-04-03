import React from 'react';
import { Leaf, Award, Droplets } from 'lucide-react';

const BenefitsBanner = () => {
  return (
    <section style={styles.banner}>
      <div style={styles.container}>
        <div style={styles.benefit} className="animate-fade-in-up">
          <div style={{...styles.iconWrapper, backgroundColor: 'rgba(189, 83, 25, 0.08)', color: 'var(--color-accent)'}}>
            <Leaf size={32} />
          </div>
          <h3 style={styles.title}>100% Orgánica</h3>
          <p style={styles.description}>Cultivada sin agroquímicos, respetando el tiempo de la tierra.</p>
        </div>

        <div className="animate-fade-in-up" style={{...styles.benefit, animationDelay: '0.2s'}}>
          <div style={{...styles.iconWrapper, backgroundColor: 'rgba(189, 83, 25, 0.08)', color: 'var(--color-accent)'}}>
            <Award size={32} />
          </div>
          <h3 style={styles.title}>Sin T.A.C.C.</h3>
          <p style={styles.description}>Certificada libre de gluten, segura para celíacos.</p>
        </div>

        <div className="animate-fade-in-up" style={{...styles.benefit, animationDelay: '0.4s'}}>
          <div style={{...styles.iconWrapper, backgroundColor: 'rgba(189, 83, 25, 0.08)', color: 'var(--color-accent)'}}>
            <Droplets size={32} />
          </div>
          <h3 style={styles.title}>Antiácida</h3>
          <p style={styles.description}>Estacionamiento natural prolongado que elimina toda acidez.</p>
        </div>
      </div>
    </section>
  );
};

const styles = {
  banner: {
    backgroundColor: 'var(--color-bg-light)',
    padding: '8rem 5%',
    borderBottom: '1px solid var(--glass-border)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '3rem',
    textAlign: 'center'
  },
  benefit: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  iconWrapper: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    border: '1px solid rgba(189, 83, 25, 0.2)'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-primary-dark)'
  },
  description: {
    color: 'var(--color-text-muted)',
    fontSize: '1rem',
    lineHeight: '1.6'
  }
};

export default BenefitsBanner;
