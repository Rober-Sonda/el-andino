import React, { useState } from 'react';
import { BookOpen, Droplets, Leaf, Coffee } from 'lucide-react';

const secretCards = [
  {
    id: 'historia',
    icon: <BookOpen size={28} />,
    title: 'El Legado Guaraní',
    content: 'El origen del mate se remonta a los pueblos originarios Guaraníes, quienes utilizaban las hojas del árbol "Ilex paraguariensis" como objeto de culto, moneda de cambio y brebaje sagrado. Para ellos, era un regalo de los dioses diseñado para unir a la tribu y dar resistencia en las largas caminatas.'
  },
  {
    id: 'agua',
    icon: <Droplets size={28} />,
    title: 'Secretos de Catador',
    content: 'Un catador sabe que el enemigo número uno de la buena yerba es el agua hervida. La temperatura perfecta oscila entre los 75°C y 80°C. Si el agua hierve, "quema" la yerba, destrozando su amargor noble y lavando el sabor en apenas tres cebadas. Además, recuerda siempre escupir o descartar el primer chorrito tibio.'
  },
  {
    id: 'tipos-mate',
    icon: <Coffee size={28} />,
    title: 'La Elección del Mate',
    content: 'Existen varios tipos: El tradicional de calabaza (poro) es reverenciado por "curarse" y absorber el sabor, el de madera (como el algarrobo) aporta notas dulces al amargor, y los modernos de acero o vidrio no alteran el gusto pero previenen la acidez. ¡Cada material cuenta una historia diferente!'
  },
  {
    id: 'tipos-yerba',
    icon: <Leaf size={28} />,
    title: 'El Arte de la Molienda',
    content: 'La "Yerba con Palo" (estilo Argentino) brinda mates suaves e ideales para principiantes. La "Despalada" (estilo Uruguayo) es yerba pura, fina y de sabor prolongado e intenso. Finalmente, las yerbas "Barbacuá" son expuestas al humo de leña durante el secado, adquiriendo ese toque maderero inconfundible.'
  }
];

const MateSecrets = () => {
  const [activeTab, setActiveTab] = useState('historia');

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>La Sabiduría del Mate</h2>
          <p style={styles.subtitle}>
            Datos curiosos, historia y los secretos mejores guardados por los verdaderos catadores.
          </p>
        </div>

        <div style={styles.layout}>
          <div style={styles.tabsMenu}>
            {secretCards.map((card) => (
              <button
                key={card.id}
                style={styles.tabBtn}
                className={activeTab === card.id ? 'active-tab' : ''}
                onClick={() => setActiveTab(card.id)}
              >
                <span style={styles.iconContainer}>{card.icon}</span>
                {card.title}
              </button>
            ))}
          </div>

          <div style={styles.contentArea}>
            {secretCards.map((card) => (
              <div 
                key={card.id} 
                style={{
                  ...styles.cardContent,
                  display: activeTab === card.id ? 'block' : 'none'
                }}
                className={activeTab === card.id ? 'animate-fade-in' : ''}
              >
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardText}>{card.content}</p>
              </div>
            ))}
          </div>
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    color: 'var(--color-accent)',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.8,
    maxWidth: '600px',
    margin: '0 auto'
  },
  layout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    background: 'var(--glass-bg)',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    overflow: 'hidden'
  },
  tabsMenu: {
    display: 'flex',
    flexWrap: 'wrap',
    background: 'rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid var(--glass-border)'
  },
  tabBtn: {
    flex: 1,
    minWidth: '200px',
    padding: '1.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: 'var(--color-text-muted)',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'var(--transition-fast)',
    borderRight: '1px solid var(--glass-border)',
    opacity: 0.8
  },
  iconContainer: {
    display: 'flex',
  },
  contentArea: {
    padding: '3rem 2rem 4rem 2rem',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardContent: {
    maxWidth: '800px',
    textAlign: 'center'
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: 'var(--color-primary-dark)',
    marginBottom: '1.5rem'
  },
  cardText: {
    fontSize: '1.15rem',
    lineHeight: '1.8',
    color: 'var(--color-text)',
    opacity: 0.9
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .animate-fade-in {
      animation: tabFadeIn 0.5s ease-out forwards;
    }
    .active-tab {
      color: var(--color-primary-dark) !important;
      background: var(--color-bg-light) !important;
      box-shadow: inset 0 -3px 0 var(--color-primary-dark) !important;
      opacity: 1 !important;
    }
    button[style*="minWidth: 200px"]:hover {
      opacity: 1 !important;
      background: rgba(0,0,0,0.02);
    }
    [data-theme='dark'] .active-tab {
      color: var(--color-accent) !important;
      background: rgba(255, 255, 255, 0.05) !important;
      box-shadow: inset 0 -3px 0 var(--color-accent) !important;
    }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default MateSecrets;
