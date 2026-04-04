import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section" style={styles.section}>
      <div className="hero-overlay" style={styles.overlay}></div>
      <div className="hero-content" style={styles.content}>
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/favicon.png" alt="El Andino Logo" style={styles.heroLogo} />
          <h1 style={styles.title}>Sentí el campo en cada mate.</h1>
          <p style={styles.subtitle}>
            Nuestra tierra noble en tu mesa. Descubre la calidez rústica de una yerba premium, orgánica y estacionada al tiempo de la naturaleza.
          </p>
          <button className="hero-btn" style={styles.button} onClick={() => document.getElementById('productos').scrollIntoView({ behavior: 'smooth' })}>
            EXPLORAR SEMBRADOS
          </button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    position: 'relative',
    height: '95vh',
    minHeight: '600px',
    backgroundImage: 'url("/hero_campo.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '0',
    overflow: 'hidden'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to right, rgba(15, 15, 15, 0.85), rgba(15, 15, 15, 0.4))',
    zIndex: 1
  },
  content: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    maxWidth: '1200px',
    width: '100%',
    padding: '0 5%',
    paddingTop: '80px',
    paddingBottom: '80px',
  },
  heroLogo: {
    height: 'auto',
    width: 'min(90vw, 800px)',
    marginBottom: '0',
    filter: 'brightness(0) invert(1) drop-shadow(0 15px 35px rgba(0,0,0,0.9))',
    objectFit: 'contain'
  },
  title: {
    color: '#F4F0EA',
    fontSize: 'clamp(3rem, 7vw, 5.5rem)',
    marginBottom: '1rem',
    textShadow: '0 4px 20px rgba(0,0,0,0.6)',
    lineHeight: '1.1',
    maxWidth: '800px'
  },
  subtitle: {
    color: 'rgba(244, 240, 234, 0.95)',
    fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
    marginBottom: '2.5rem',
    fontWeight: '300',
    maxWidth: '650px',
    textShadow: '0 2px 10px rgba(0,0,0,0.6)',
    lineHeight: '1.6'
  },
  button: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    padding: '1.2rem 3.5rem',
    fontSize: '1.05rem',
    fontWeight: '900',
    letterSpacing: '2px',
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    textTransform: 'uppercase'
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .hero-btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6) !important;
      background-color: var(--color-primary-dark) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Hero;
