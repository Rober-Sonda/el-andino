import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Scale, Beaker, Plus, Star, Award, Flame, Leaf, Coffee } from 'lucide-react';

const featuredBlends = [
  { name: "La Gran Tradición", ratios: { premium: 50, ahumada: 0, molida: 0, despalada: 50 }, icon: <Award size={18} /> },
  { name: "Fuego Profundo", ratios: { premium: 15, ahumada: 75, despalada: 10, molida: 0 }, icon: <Flame size={18} /> },
  { name: "Armonía Oriental", ratios: { premium: 40, ahumada: 0, despalada: 20, molida: 40 }, icon: <Leaf size={18} /> },
  { name: "Gaucho Fuerte", ratios: { premium: 0, ahumada: 20, despalada: 80, molida: 0 }, icon: <Coffee size={18} /> }
];

const BlendCreator = () => {
  const { addToCart } = useCart();
  const [selectedFormat, setSelectedFormat] = useState('500g');
  
  const [ratios, setRatios] = useState({
    premium: 25,
    ahumada: 25,
    despalada: 25,
    molida: 25
  });

  const getBlendData = (r) => {
    const sorted = Object.entries(r).sort((a,b) => b[1] - a[1]);
    const max = sorted[0];
    const second = sorted[1];
    
    if (max[1] === 100) {
       let n = "", d = "";
       if (max[0] === 'premium') { n="Premium (Pura)"; d="Estacionada naturalmente por 24 meses. Suave, duradera y elegante. Directo de nuestro estacionamiento natural."; }
       if (max[0] === 'ahumada') { n="Ahumada (Pura)"; d="Carácter de monte, secada con leña bajo el proceso Barbacuá. Intensa y maderera."; }
       if (max[0] === 'despalada') { n="Despalada (Pura)"; d="Pura hoja uruguaya, estilo canario para un mate fuerte, espumoso y prolongado que no perdona."; }
       if (max[0] === 'molida') { n="Molida (Pura)"; d="Clásica molienda fina perfecta. Rendimiento impecable para el cebador experimentado oriental."; }
       return { name: n, description: d };
    }

    const prefixes = {
        premium: "Reserva",
        ahumada: "Fuego",
        despalada: "Alma",
        molida: "Tradición"
    };

    const nuclei = {
        premium: "de los Andes",
        ahumada: "del Monte",
        despalada: "Gaucha",
        molida: "Oriental"
    };

    let suffix = "Equilibrada";
    if (max[1] >= 65) suffix = "Intensa";
    else if (max[1] <= 35) suffix = "Suave y Compleja";

    // Prevent duplicates (e.g., Reserva de los Andes)
    const nucleus = max[0] === second[0] || (max[0] === 'premium' && second[0] === 'premium') ? "Mestra" : nuclei[second[0]];
    const name = `${prefixes[max[0]]} ${nucleus} ${suffix}`;
    
    const descriptions = [
        `Una combinación artesanal diseñada para verdaderos apasionados. Sus notas predominantes de yerba ${max[0]} resaltan en cada cebada, redondeando su perfil con la textura inconfundible de la ${second[0]}.`,
        `Directo de nuestros silos elaborada al momento. Esta alquimia perfecta lleva la fuerza de la variedad ${max[0]} equilibrada pacientemente con un toque ideal de ${second[0]}. Un mate de otro planeta.`,
        `Tu propia receta maestra guardada bajo sello. La presencia dominante de ${max[0]} (en un exacto ${max[1]}%) le da su alma, mientras que la mezcla de acompañamiento moldea un amargor noble, sedoso y muy duradero.`
    ];
    
    let descIndex = (max[1] + second[1]) % 3;
    const description = descriptions[descIndex];

    return { name, description };
  };

  const { name: currentBlendName, description: currentBlendDesc } = getBlendData(ratios);

  const handleRatioChange = (key, newStringVal) => {
    let newVal = parseInt(newStringVal, 10);
    const diff = newVal - ratios[key];
    if (diff === 0) return;

    let others = Object.keys(ratios).filter(k => k !== key);
    let othersSum = others.reduce((sum, k) => sum + ratios[k], 0);

    if (diff > othersSum) {
      newVal = ratios[key] + othersSum;
    }

    let newRatios = { ...ratios, [key]: newVal };
    let actualDiff = newVal - ratios[key];
    
    let remainsToDistribute = -actualDiff;
    others.sort((a, b) => remainsToDistribute < 0 ? newRatios[b] - newRatios[a] : newRatios[a] - newRatios[b]);

    while (remainsToDistribute !== 0) {
        let changed = false;
        for (let k of others) {
            if (remainsToDistribute < 0 && newRatios[k] >= 5) {
                newRatios[k] -= 5;
                remainsToDistribute += 5;
                changed = true;
            } else if (remainsToDistribute > 0 && newRatios[k] <= 95) {
                newRatios[k] += 5;
                remainsToDistribute -= 5;
                changed = true;
            }
            if (remainsToDistribute === 0) break;
        }
        if (!changed) break; 
    }

    setRatios(newRatios);
  };

  const getPrice = (format) => {
    if (format === '500g') return 4500;
    if (format === '1kg') return 8500;
    return 6500; 
  };
  const isBulk = selectedFormat === 'granel';
  const price = getPrice(selectedFormat);

  const handleAddCart = () => {
    const product = {
        id: `blend-${ratios.premium}-${ratios.ahumada}-${ratios.despalada}-${ratios.molida}`,
        name: `Blend: ${currentBlendName}`,
        description: currentBlendDesc,
        image: '/kraft_bag.png', // Using the photorealistic image generated
        isOrganic: true,
        isSinTacc: true,
        isAntiacid: true
    };
    
    addToCart(product, selectedFormat, price, isBulk ? 5 : 1);
  };

  const varietiesLabels = {
      premium: 'Yerba Premium',
      ahumada: 'Yerba Ahumada',
      despalada: 'Despalada',
      molida: 'Molida'
  };

  return (
    <section id="blends" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.heading}>
          <Beaker size={48} color="var(--color-accent)" style={{marginBottom: '1rem'}} />
          <h2 style={styles.title}>Alquimista del Mate</h2>
          <p style={styles.subtitle}>Armá tu propia receta exclusiva. Elegí los porcentajes usando controles precisos y nuestro maestro yerbatero preparará tu bolsa.</p>
        </div>
        
        <div className="blend-grid">
          {/* Controls Side */}
          <div style={styles.controlsSection}>
             <div style={styles.featuredBox}>
                 <h4 style={styles.featuredTitle}><Star size={16}/> Recetas Destacadas</h4>
                 <div style={styles.featuredGrid}>
                    {featuredBlends.map((blend, idx) => (
                        <button key={idx} style={styles.featuredBtn} onClick={() => setRatios(blend.ratios)}>
                           {blend.icon} {blend.name}
                        </button>
                    ))}
                 </div>
             </div>

             <h3 style={{marginBottom: '2rem', fontSize:'1.8rem', color: 'var(--color-primary)'}}>Cantidades (Escala 5%)</h3>
             
             <div style={styles.slidersWrapper}>
                 {Object.keys(ratios).map(key => (
                     <div key={key} style={styles.sliderContainer}>
                         <div style={styles.sliderHeader}>
                             <span style={styles.sliderLabel}>{varietiesLabels[key]}</span>
                             <span style={styles.sliderValue}>{ratios[key]}%</span>
                         </div>
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={ratios[key]} 
                            onChange={(e) => handleRatioChange(key, e.target.value)}
                            style={styles.rangeInput}
                         />
                     </div>
                 ))}
             </div>

             <div style={styles.checkoutBox}>
                <div style={styles.formatSelector}>
                    {['500g', '1kg', 'granel'].map(f => (
                        <button 
                            key={f}
                            className="format-btn"
                            style={{...styles.formatBtn, ...(selectedFormat === f ? styles.formatBtnActive : {})}} 
                            onClick={() => setSelectedFormat(f)}
                        >
                            {f === 'granel' ? <><Scale size={14} style={{marginRight: '4px'}}/> A Granel</> : f}
                        </button>
                    ))}
                </div>
                
                <div style={styles.priceRow}>
                    <p style={styles.price}>${price}</p>
                    <span style={styles.perKg}>
                        {selectedFormat === '500g' ? '/ 500g' : isBulk ? '/ kg (Mín. 5Kg)' : '/ kg'}
                    </span>
                </div>
                
                <button style={styles.addButton} onClick={handleAddCart}>
                    {isBulk ? 'Comprar 5Kg (Granel)' : 'Agregar Blend al Pedido'}
                </button>
             </div>
          </div>

          {/* Visual Side */}
          <div style={styles.visualSection}>
            <div style={{
                ...styles.bagMockup,
                filter: `hue-rotate(${ratios.despalada * 0.8 + ratios.molida * 0.3}deg) saturate(${100 + ratios.ahumada * 0.2}%)`
            }}>
                 <img src="/premium_full.jpg" alt="Yerba Mate Bag" style={styles.bagImage} />
                 <div style={styles.bagLabelOverlay}>
                     <img src="/favicon.png" alt="El Andino" style={styles.bagLogo} />
                     <h4 style={styles.bagTitleLabel}>BLEND EXCLUSIVO</h4>
                     <h2 style={styles.bagBlendName}>{currentBlendName}</h2>
                     <div style={styles.bagDivider}></div>
                     <ul style={styles.bagRatios}>
                         {ratios.premium > 0 && <li>Premium: {ratios.premium}%</li>}
                         {ratios.ahumada > 0 && <li>Ahumada: {ratios.ahumada}%</li>}
                         {ratios.despalada > 0 && <li>Despalada: {ratios.despalada}%</li>}
                         {ratios.molida > 0 && <li>Molida: {ratios.molida}%</li>}
                     </ul>
                 </div>
            </div>
            <div style={styles.descriptionBox}>
                <p>{currentBlendDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '6rem 5%',
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
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    marginBottom: '1rem',
    color: 'var(--color-accent)'
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '1.2rem',
    maxWidth: '700px',
    margin: '0 auto'
  },
  controlsSection: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '24px',
    padding: '2.5rem',
    boxShadow: 'var(--shadow-soft)'
  },
  featuredBox: {
    background: 'rgba(189, 83, 25, 0.05)',
    border: '1px solid rgba(189, 83, 25, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem'
  },
  featuredTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-accent)',
    fontSize: '1.1rem',
    marginBottom: '1rem',
    textTransform: 'uppercase'
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  featuredBtn: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    padding: '0.8rem',
    borderRadius: '8px',
    fontWeight: '600',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  },
  slidersWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  sliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  sliderLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--color-text)'
  },
  sliderValue: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--color-accent)'
  },
  rangeInput: {
    width: '100%',
    cursor: 'pointer',
    accentColor: 'var(--color-accent)'
  },
  checkoutBox: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--glass-border)'
  },
  formatSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    background: 'rgba(0,0,0,0.05)',
    padding: '4px',
    borderRadius: '12px'
  },
  formatBtn: {
    flex: 1,
    padding: '0.8rem 0',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast)',
    border: '1px solid transparent',
    background: 'transparent'
  },
  formatBtnActive: {
    background: 'var(--color-text)',
    color: 'var(--color-bg-light)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'var(--color-accent)',
    fontFamily: 'var(--font-serif)'
  },
  perKg: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--color-text-muted)'
  },
  addButton: {
    width: '100%',
    padding: '1.3rem',
    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
    color: '#0a0a0a',
    borderRadius: '12px',
    fontWeight: '800',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'var(--transition-fast)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(226, 186, 101, 0.3)',
    cursor: 'pointer'
  },
  visualSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bagMockup: {
    width: '100%',
    maxWidth: '380px',
    aspectRatio: '3/4',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
  },
  bagImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1
  },
  bagLabelOverlay: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(4px)',
    width: '80%',
    padding: '1.5rem',
    borderRadius: '8px',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
  },
  bagLogo: {
    height: '35px',
    marginBottom: '1rem',
    opacity: 0.9
  },
  bagTitleLabel: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--color-primary)',
    letterSpacing: '2px',
    marginBottom: '0.5rem',
    textTransform: 'uppercase'
  },
  bagBlendName: {
    fontSize: '1.6rem',
    color: '#1a1a1a', 
    fontFamily: 'var(--font-serif)',
    lineHeight: '1.1',
    marginBottom: '1rem'
  },
  bagDivider: {
    width: '40px',
    height: '2px',
    backgroundColor: 'var(--color-accent)',
    marginBottom: '1rem'
  },
  bagRatios: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    color: '#333',
    fontSize: '0.9rem',
    fontWeight: '700'
  },
  descriptionBox: {
    marginTop: '2rem',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.5rem',
    maxWidth: '380px',
    width: '100%',
    textAlign: 'center',
    color: 'var(--color-text)',
    fontWeight: '500',
    fontSize: '1.05rem',
    fontStyle: 'normal',
    lineHeight: '1.6',
    boxShadow: 'var(--shadow-soft)'
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    button[style*="background: var(--glass-bg)"]:hover {
      border-color: var(--color-accent) !important;
      background: rgba(189, 83, 25, 0.1) !important;
    }
    .blend-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: start;
    }
    @media (min-width: 900px) {
      .blend-grid {
        grid-template-columns: 1.2fr 0.8fr;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default BlendCreator;
