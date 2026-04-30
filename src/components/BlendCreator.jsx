import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Scale, Beaker, Plus, Star, Award, Flame, Leaf, Coffee } from 'lucide-react';

const featuredBlends = [
  { 
    name: "Herencia del Sembrador", 
    ratios: { premium: 50, ahumada: 0, molida: 0, despalada: 50 }, 
    icon: <Award size={18} />,
    profile: "Equilibrada",
    description: "Una combinación artesanal diseñada para verdaderos apasionados. Estacionada naturalmente con hoja uruguaya." 
  },
  { 
    name: "Fuego del Andino", 
    ratios: { premium: 15, ahumada: 75, despalada: 10, molida: 0 }, 
    icon: <Flame size={18} />,
    profile: "Intensa",
    description: "Carácter de monte, secada con leña bajo el proceso Barbacuá. Intensa y maderera con un toque de reserva." 
  },
  { 
    name: "Tradición Charrúa", 
    ratios: { premium: 40, ahumada: 0, despalada: 20, molida: 40 }, 
    icon: <Leaf size={18} />,
    profile: "Clásica",
    description: "Molienda fina perfecta. Rendimiento impecable para el cebador experimentado oriental." 
  },
  { 
    name: "Alma de Monte", 
    ratios: { premium: 0, ahumada: 20, despalada: 80, molida: 0 }, 
    icon: <Coffee size={18} />,
    profile: "Suave y Compleja",
    description: "Pura hoja uruguaya, estilo canario para un mate fuerte, espumoso y prolongado que no perdona." 
  },
  {
    name: "Pura Premium",
    ratios: { premium: 100, ahumada: 0, despalada: 0, molida: 0 },
    icon: <Star size={18} />,
    profile: "Tradicional",
    description: "Nuestra yerba base de la más alta calidad, sin mezclas. Sabor tradicional y duradero."
  },
  {
    name: "Pura Ahumada",
    ratios: { premium: 0, ahumada: 100, despalada: 0, molida: 0 },
    icon: <Flame size={18} />,
    profile: "Muy Intensa",
    description: "100% secanza barbacuá. Un viaje directo al monte con notas profundas a madera y humo."
  },
  {
    name: "Pura Despalada",
    ratios: { premium: 0, ahumada: 0, despalada: 100, molida: 0 },
    icon: <Leaf size={18} />,
    profile: "Fuerte",
    description: "Sin palo, pura hoja. Máxima intensidad y rendimiento para mates que no se lavan."
  },
  {
    name: "Pura Molida",
    ratios: { premium: 0, ahumada: 0, despalada: 0, molida: 100 },
    icon: <Coffee size={18} />,
    profile: "Estilo Uruguayo",
    description: "Molienda extra fina. Sabor fuerte y constante desde el primer mate, ideal para mate de camionero."
  }
];

const BlendCreator = () => {
  const { addToCart, totalKilos } = useCart();
  const [selectedFormat, setSelectedFormat] = useState('500g');
  
  const [ratios, setRatios] = useState({
    premium: 25,
    ahumada: 25,
    despalada: 25,
    molida: 25
  });

  const getBlendData = (r) => {
    const exactMatch = featuredBlends.find(fb => 
      fb.ratios.premium === r.premium &&
      fb.ratios.ahumada === r.ahumada &&
      fb.ratios.despalada === r.despalada &&
      fb.ratios.molida === r.molida
    );
    if (exactMatch) return { name: exactMatch.name, profile: exactMatch.profile, description: exactMatch.description };

    let closestBlend = featuredBlends[0];
    let minDistance = Infinity;

    for (let i = 0; i < 4; i++) {
        const fb = featuredBlends[i];
        const dist = Math.abs(fb.ratios.premium - r.premium) + 
                     Math.abs(fb.ratios.ahumada - r.ahumada) + 
                     Math.abs(fb.ratios.despalada - r.despalada) + 
                     Math.abs(fb.ratios.molida - r.molida);
        if (dist < minDistance) {
            minDistance = dist;
            closestBlend = fb;
        }
    }

    return { 
      name: closestBlend.name, 
      profile: closestBlend.profile, 
      description: closestBlend.description 
    };
  };

  const { name: currentBlendName, profile: currentBlendProfile, description: currentBlendDesc } = getBlendData(ratios);

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
    if (format === '500g') return 4000;
    if (format === 'granel') return totalKilos > 40 ? 6000 : 7500;
    return 7500; 
  };
  const isBulk = selectedFormat === 'granel';
  const price = getPrice(selectedFormat);

  const handleAddCart = () => {
    const product = {
        id: `blend-${ratios.premium}-${ratios.ahumada}-${ratios.despalada}-${ratios.molida}`,
        name: `Blend: ${currentBlendName}`,
        profile: currentBlendProfile,
        description: currentBlendDesc,
        image: '/kraft_bag.png',
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
          <h2 style={styles.title}>Armá tu Propia Yerba</h2>
          <p style={styles.subtitle}>Prepará una mezcla a tu medida con la esencia del campo. Ajustá las proporciones a tu gusto o probá una de nuestras combinaciones recomendadas.</p>
        </div>
        
        <div className="blend-grid">
          <div className="controls-section">
             <div style={{ marginBottom: '2rem' }}>
                 <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center' }}>Nuestras 4 Variedades Puras y 4 Blends</p>
                 <div className="featured-grid">
                    {featuredBlends.map((blend, idx) => {
                        const isCurrent = currentBlendName === blend.name;
                        return (
                            <button 
                                key={idx} 
                                className={`featured-pill-btn ${isCurrent ? 'active' : ''}`} 
                                onClick={() => setRatios(blend.ratios)} 
                                title={blend.name}
                            >
                               {blend.icon}
                            </button>
                        );
                    })}
                 </div>
             </div>

             <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '2rem', textAlign: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                 <p style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 'bold', letterSpacing: '2px' }}>Tu Mezcla Exclusiva</p>
                 <h4 className="immersive-title">
                     {currentBlendName.includes(' ') ? (
                         <>
                             {currentBlendName.substring(0, currentBlendName.lastIndexOf(' '))}
                             <br />
                             {currentBlendName.substring(currentBlendName.lastIndexOf(' ') + 1)}
                         </>
                     ) : currentBlendName}
                 </h4>
                 <p style={{ margin: '0 0 0.8rem 0', fontSize: '1.1rem', color: 'var(--color-text)', fontWeight: '600', fontStyle: 'italic' }}>Perfil: <span style={{ color: 'var(--color-accent)' }}>{currentBlendProfile}</span></p>
                 <div style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text)', fontStyle: 'italic', lineHeight: '1.5' }}>{currentBlendDesc}</p>
                 </div>
             </div>

             <h3 style={{marginBottom: '1.5rem', fontSize:'1.1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Ajuste Fino (Escala 5%)</h3>
             
             <div className="sliders-wrapper">
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
  featuredBox: {
    background: 'rgba(74, 124, 46, 0.05)',
    border: '1px solid rgba(74, 124, 46, 0.2)',
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
    accentColor: 'var(--color-accent)',
    height: '6px',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '8px',
    outline: 'none',
    WebkitAppearance: 'none'
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
    color: '#ffffff',
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
    background: 'var(--color-primary)',
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: '800',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'var(--transition-fast)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(42, 51, 37, 0.3)',
    cursor: 'pointer'
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    .featured-pill-btn {
      background: transparent;
      border: 1.5px solid var(--color-accent);
      color: var(--color-text);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      transition: all 0.2s ease;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .featured-pill-btn:hover {
      background: var(--color-accent);
      color: #ffffff !important;
    }
    .featured-pill-btn.active {
      background: var(--color-accent);
      color: #ffffff !important;
      box-shadow: 0 0 10px rgba(74, 124, 46, 0.5);
    }
    [data-theme='dark'] .featured-pill-btn:not(.active) {
      color: #F4F0EA;
    }
    .featured-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .blend-grid {
      display: grid;
      grid-template-columns: 1fr;
      align-items: start;
      max-width: 800px;
      margin: 0 auto;
    }
    .controls-section {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: var(--shadow-soft);
    }
    .sliders-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    @media (min-width: 768px) {
      .featured-grid {
        gap: 16px;
      }
      .controls-section {
        padding: 2.5rem;
      }
      .sliders-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      .immersive-title {
        max-width: 100%;
      }
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-accent);
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    input[type=range]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-accent);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .immersive-title {
      font-family: var(--font-serif);
      font-size: clamp(1.8rem, 6vw, 2.4rem);
      text-transform: uppercase;
      background: linear-gradient(45deg, var(--color-accent), #8dd660);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 12px rgba(74, 124, 46, 0.15);
      margin: 0.5rem auto 0.2rem auto;
      line-height: 1.1;
      height: 2.2em;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      letter-spacing: 1px;
    }
    [data-theme='dark'] .immersive-title {
      background: linear-gradient(45deg, #76b54d, #a2f277);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 20px rgba(118, 181, 77, 0.3);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default BlendCreator;
