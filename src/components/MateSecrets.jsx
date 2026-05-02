import React from 'react';
import { BookOpen, Droplets, Flame, ThermometerSun, MapPin, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const secrets = [
  {
    id: 'origen',
    icon: <MapPin size={32} color="var(--color-accent)" />,
    title: 'La Herencia Sagrada',
    content: 'Descubierto por las tribus Tupí-Guaraní en el corazón de la selva paranaense, el "Ka’a" (yerba mate) era considerado un regalo viviente de los dioses. Más que una bebida, era un puente espiritual que forjaba hermandad y daba una resistencia sobrehumana a los guerreros en sus travesías.'
  },
  {
    id: 'despertar',
    icon: <Droplets size={32} color="var(--color-accent)" />,
    title: 'El Despertar de la Yerba',
    content: 'El secreto mejor guardado del cebador experto es el "despertar". Nunca inundes la yerba seca de golpe. Con el mate inclinado, vierte un primer chorrito de agua apenas tibia (50°C) en la parte baja de la montañita. Esto hidrata la hoja suavemente, previniéndola de quemarse y asegurando mates espumosos por horas.'
  },
  {
    id: 'temperatura',
    icon: <ThermometerSun size={32} color="var(--color-accent)" />,
    title: 'El Enemigo: Agua Hervida',
    content: 'El agua nunca debe hervir. La temperatura exacta y ancestral oscila entre 75°C y 80°C. Un agua arrebatada quemará las hojas, dándole un sabor metálico y extrañamente amargo a la yerba, "lavando" el mate en apenas tres cebadas.'
  },
  {
    id: 'cebada',
    icon: <Flame size={32} color="var(--color-accent)" />,
    title: 'El Arte de la Cebada',
    content: 'Mantén siempre tu "montañita" seca a un costado. Cebá dirigiendo el chorrito de agua lo más cerca de la bombilla posible. Poco a poco, cuando notes que pierde sabor, ve empujando esa yerba seca al medio (dar vuelta el mate) para revivir la ronda y la magia.'
  }
];

const MateSecrets = () => {
  const navigate = useNavigate();

  return (
    <section id="sabiduria" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <BookOpen size={40} color="var(--color-accent)" style={{marginBottom: '1rem'}} />
          <h2 style={styles.title}>Sabiduría del Mate</h2>
          <p style={styles.subtitle}>
            Un viaje desde los orígenes de la tierra hasta el secreto para cebar el mate perfecto.
          </p>
        </div>

        <div style={styles.cardsContainer}>
          {secrets.map((card, index) => (
            <div key={card.id} className="secret-card" style={styles.card}>
              <div className="card-number" style={styles.cardNumber}>0{index + 1}</div>
              <div style={styles.cardIcon}>{card.icon}</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardText}>{card.content}</p>
              </div>
            </div>
          ))}

        </div>
        
        {/* Portal History Button */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button 
            style={{...styles.bottomButton, display: 'inline-flex', alignItems: 'center', gap: '0.6rem'}}
            onClick={() => navigate('/historia')}
            className="history-portal-btn"
          >
            <Compass size={20} />
            Explorar la Historia y Mística
          </button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '8rem 5%',
    background: 'var(--color-bg-light)',
    color: 'var(--color-text)',
    borderTop: '1px solid var(--glass-border)'
  },
  container: {
    maxWidth: '800px', // Narrower for better reading line-length
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    color: 'var(--color-primary-dark)',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--color-text-muted)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: 'var(--glass-bg)',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    padding: '2.5rem',
    boxShadow: 'var(--shadow-soft)',
    overflow: 'hidden'
  },
  cardNumber: {
    position: 'absolute',
    top: '-15px',
    right: '10px',
    fontSize: '8rem',
    fontWeight: '900',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-text)',
    opacity: 0.03,
    pointerEvents: 'none',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  cardIcon: {
    marginBottom: '1.5rem',
    background: 'rgba(189, 83, 25, 0.1)', // accent color with opacity
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px'
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.8rem',
    color: 'var(--color-primary-dark)',
    marginBottom: '1rem'
  },
  cardText: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: 'var(--color-text)',
    opacity: 0.9
  },
  bottomButton: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-text)',
    padding: '0.8rem 1.8rem',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .secret-card:hover .card-number,
    .secret-card:active .card-number {
      transform: scale(1.15) translate(-10px, 10px);
      color: var(--color-accent);
      opacity: 0.08 !important;
    }
    .history-portal-btn:hover {
      transform: translateY(-3px) !important;
      color: var(--color-accent) !important;
      border-color: var(--color-accent) !important;
      background: rgba(118, 181, 77, 0.05) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default MateSecrets;
