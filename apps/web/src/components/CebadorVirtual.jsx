import React, { useState } from 'react';
import { Coffee, Sparkles } from 'lucide-react';

const frasesMateras = [
  "Ensillar el mate es prepararse para una buena charla.",
  "El mate no se niega, se pasa con la derecha.",
  "Un mate caliente cura las penas frías.",
  "La yerba buena dura más que el amor pasajero.",
  "Agua a 75°C, yerba inclinada, yerba sin quemar.",
  "Mate lavado, amigo cansado.",
  "El buen cebador mantiene el puente de espuma."
];

const CebadorVirtual = () => {
  const [cebando, setCebando] = useState(false);
  const [frase, setFrase] = useState(null);

  const cebarMate = () => {
    if(cebando) return;
    setCebando(true);
    setFrase(null);

    // After animation delay, show random phrase
    setTimeout(() => {
      const idx = Math.floor(Math.random() * frasesMateras.length);
      setFrase(frasesMateras[idx]);
      setCebando(false);
    }, 2800);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}><Sparkles size={18} /> El Cebador Virtual</h3>
      <p style={styles.subtitle}>Tocá el termo para recibir sabiduría matera</p>

      <div style={styles.interactiveArea} onClick={cebarMate}>
         {/* Simple CSS Art of a Thermos and Mate */}
         <div style={styles.thermosContainer}>
            <div className={`termo ${cebando ? 'pouring' : ''}`} style={styles.termo}></div>
            <div className={`water-stream ${cebando ? 'active' : ''}`} style={styles.stream}></div>
         </div>
         <div style={styles.mateGourd}>
            <div className={`steam ${cebando ? 'active' : ''}`}></div>
            <div className={`steam steam-2 ${cebando ? 'active' : ''}`}></div>
         </div>
      </div>

      {frase && (
        <div className="frase-box" style={styles.fraseBox}>
          <p>"{frase}"</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '3rem 5%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--color-bg-dark)',
    color: 'var(--color-text-light)',
    borderTop: '1px solid var(--glass-border)',
    borderBottom: '1px solid var(--glass-border)',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '0.5rem'
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: '2rem'
  },
  interactiveArea: {
    position: 'relative',
    height: '250px',
    width: '300px',
    cursor: 'pointer',
    border: '2px dashed var(--glass-border)',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '2rem'
  },
  thermosContainer: {
    position: 'absolute',
    top: '30px',
    left: '140px',
    transformOrigin: 'bottom left',
  },
  termo: {
    width: '40px',
    height: '100px',
    backgroundColor: '#8b0000', /* Red Thermos */
    borderRadius: '8px 8px 0 0',
    border: '4px solid #333',
    position: 'relative',
    transition: 'transform 0.5s ease'
  },
  stream: {
    position: 'absolute',
    left: '-5px',
    top: '20px',
    width: '4px',
    height: '0',
    backgroundColor: '#8ad2de', /* Water */
    opacity: 0,
    transition: 'height 2s ease, opacity 0.5s'
  },
  mateGourd: {
    width: '60px',
    height: '60px',
    backgroundColor: '#5c4233',
    borderRadius: '10px 10px 40px 40px',
    border: '3px solid #3b2d07',
    position: 'absolute',
    bottom: '30px',
    left: '60px',
    boxShadow: 'inset 0 10px 0 #24421b' /* Yerba */
  },
  fraseBox: {
    marginTop: '2rem',
    padding: '1.5rem 2.5rem',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid var(--color-accent)',
    borderRadius: '12px',
    fontStyle: 'italic',
    fontSize: '1.2rem',
    color: 'var(--color-accent)',
    animation: 'fadeIn 0.5s forwards',
    maxWidth: '600px'
  }
};

// Inject keyframes and dynamic classes
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .termo.pouring {
      transform: rotate(-60deg);
    }
    .water-stream.active {
      height: 120px;
      opacity: 0.8;
      animation: pour 2s forwards;
    }
    .steam {
      position: absolute;
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      top: -10px;
      left: 15px;
      opacity: 0;
      filter: blur(8px);
    }
    .steam.active {
      animation: rise 3s infinite 1s;
    }
    .steam.steam-2.active {
      left: 35px;
      animation: rise 3s infinite 1.5s;
    }

    @keyframes pour {
      0% { opacity: 0; height: 0; transform: translateY(0); }
      10% { opacity: 0.8; height: 120px; transform: translateY(0); }
      90% { opacity: 0.8; height: 120px; transform: translateY(0); }
      100% { opacity: 0; height: 0; transform: translateY(120px); }
    }
    @keyframes rise {
      0% { transform: translateY(0) scale(1); opacity: 0; }
      20% { opacity: 0.6; }
      100% { transform: translateY(-50px) scale(3); opacity: 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default CebadorVirtual;
