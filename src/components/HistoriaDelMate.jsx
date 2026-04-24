import React, { useEffect } from 'react';
import { ArrowLeft, Leaf, Coffee, Settings2, Wind, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HistoriaDelMate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="historia-page" style={styles.page}>
      
      {/* Hero Section */}
      <header style={styles.hero}>
        <style>{`
          .force-black-text {
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
          }
          .history-card:hover .bg-icon,
          .history-card:active .bg-icon {
            transform: scale(1.15) translate(-10px, 10px) !important;
            color: var(--color-accent) !important;
            opacity: 0.08 !important;
          }
          @media (max-width: 768px) {
            .small-drop-cap {
              display: none !important;
            }
            .history-card {
              padding: 2rem 1.5rem !important;
            }
            .inner-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <p className="force-black-text" style={styles.kicker}>La Herencia Sagrada</p>
          <h1 className="force-black-text" style={styles.title}>Historia y Mística del Mate</h1>
          <p style={styles.subtitle}>De la selva paranaense a tu mesa. La infusión milenaria que forjó la identidad de un continente.</p>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.cardsContainer}>
          
          {/* Orígenes */}
          <section className="history-card" style={styles.card}>
            <div className="bg-icon" style={styles.bgIcon}><MapPin size={200} /></div>
            <div style={styles.cardContent}>
              <div className="small-drop-cap" style={styles.smallIcon}><MapPin size={32} color="var(--color-accent)" /></div>
              <h2 style={styles.cardTitle}>El Origen: El Regalo de Caá Yarí</h2>
              <p style={styles.text}>
                Mucho antes de que los europeos pisaran suelo sudamericano, las tribus Tupí-Guaraní ya conocían los secretos de la selva paranaense. Ellos no descubrieron la yerba mate (el <strong>"Ka’a"</strong>), creían que les fue obsequiada por los dioses. Según la leyenda, la deidad Tupá premió la hospitalidad de un anciano chamán regalándole una planta que garantizaría vitalidad y amistad eterna a su pueblo, dejando a su hija Caá Yarí como la diosa protectora de los yerbales.
              </p>
              <p style={styles.text}>
                Para los guaraníes, el mate no era solo nutrición, era un vehículo espiritual que unía a la tribu, daba resistencia física a los guerreros y se utilizaba en ceremonias sagradas. La masticaban cruda o la preparaban en infusiones frías usando cuencos hechos de calabazas pequeñas.
              </p>
            </div>
          </section>

          {/* Expansión */}
          <section className="history-card" style={styles.card}>
            <div className="bg-icon" style={styles.bgIcon}><Leaf size={200} /></div>
            <div style={styles.cardContent}>
              <div className="small-drop-cap" style={styles.smallIcon}><Leaf size={32} color="var(--color-accent)" /></div>
              <h2 style={styles.cardTitle}>Los Jesuitas y los Gauchos: La Expansión</h2>
              <p style={styles.text}>
                En el siglo XVII, los misioneros jesuitas descubrieron las impresionantes propiedades energéticas de la yerba. Aunque al principio la llamaron "hierba del demonio", pronto domesticaron su cultivo y monopolizaron su producción, creando inmensas plantaciones en lo que hoy es Misiones (Argentina), Paraguay y el sur de Brasil. Ellos bautizaron a la infusión como "Té de los Jesuitas".
              </p>
              <p style={styles.text}>
                Fueron los <strong>Gauchos</strong> quienes, cabalgando solitarios por las vastas llanuras pampeanas, adoptaron el mate caliente como su compañero inseparable. El mate pasó a ser el fuego portátil, la pausa en la soledad y el lazo inquebrantable de hospitalidad alrededor del fogón. Así, el mate se coronó como la identidad indiscutida del Río de la Plata.
              </p>
            </div>
          </section>

          {/* Recipientes */}
          <section className="history-card" style={styles.card}>
            <div className="bg-icon" style={styles.bgIcon}><Coffee size={200} /></div>
            <div style={styles.cardContent}>
              <div className="small-drop-cap" style={styles.smallIcon}><Coffee size={32} color="var(--color-accent)" /></div>
              <h2 style={styles.cardTitle}>El Recipiente: Mates Activos vs. Mates Pasivos</h2>
              <p style={styles.text}>
                El verdadero conocedor sabe que el recipiente (el "mate") no es un mero contenedor; es el crisol donde ocurre la alquimia. Dependiendo del material, un mate puede cambiar por completo el perfil de sabor de tu yerba.
              </p>
              
              <div className="inner-grid" style={styles.grid}>
                <div style={styles.innerCard}>
                  <h3 style={styles.innerCardTitle}>Mates Activos</h3>
                  <p style={styles.innerCardText}>
                    <strong>Calabaza (Porongo) y Maderas (Algarrobo, Palo Santo).</strong><br/><br/>
                    Se llaman "activos" porque están vivos. Tienen poros y resinas que interactúan químicamente con la yerba, aportando notas dulces, ahumadas o leñosas. Absorben los aceites esenciales con cada cebada, creando un historial de sabor único.
                  </p>
                </div>
                <div style={styles.innerCard}>
                  <h3 style={styles.innerCardTitle}>Mates Pasivos</h3>
                  <p style={styles.innerCardText}>
                    <strong>Vidrio, Cerámica, Acero Inoxidable, Plata y Alpaca.</strong><br/><br/>
                    Son materiales impermeables que no transfieren absolutamente ningún sabor a la infusión. Lo que entra, sale. Son ideales si estás catando una yerba nueva, probando un blend frutal o si prefieres higiene impecable.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bombilla */}
          <section className="history-card" style={styles.card}>
            <div className="bg-icon" style={styles.bgIcon}><Wind size={200} /></div>
            <div style={styles.cardContent}>
              <div className="small-drop-cap" style={styles.smallIcon}><Wind size={32} color="var(--color-accent)" /></div>
              <h2 style={styles.cardTitle}>La Bombilla: De la Caña a la Plata</h2>
              <p style={styles.text}>
                Los guaraníes originales no usaban bombillas metálicas; filtraban la infusión con los dientes o utilizaban pequeñas cañas huecas llamadas <em>"Takuapý"</em> que tenían una fina red de fibras vegetales en un extremo para bloquear las hojas.
              </p>
              <p style={styles.text}>
                Con la llegada del metalurgia colonial, nacieron los filtros metálicos. Hoy existen diversas formas, pero el material lo es todo:
                <br/><br/>
                • <strong>Plata, Alpaca y Acero Quirúrgico:</strong> Son los reyes indiscutidos. No transmiten calor a los labios y no alteran el sabor (no dejan gusto metálico).<br/>
                • <strong>Formatos:</strong> La bombilla "cuchara" es la más versátil, ideal para yerbas con mucho polvo (uruguayas y brasileñas) porque su amplia superficie de filtrado nunca se tapa y además sirve para "acomodar" la montañita.
              </p>
            </div>
          </section>

          {/* Variedades */}
          <section className="history-card" style={styles.card}>
            <div className="bg-icon" style={styles.bgIcon}><Settings2 size={200} /></div>
            <div style={styles.cardContent}>
              <div className="small-drop-cap" style={styles.smallIcon}><Settings2 size={32} color="var(--color-accent)" /></div>
              <h2 style={styles.cardTitle}>Variedades de Yerba y Recomendaciones</h2>
              <p style={styles.text}>No todas las yerbas nacen iguales. La molienda y el secado definen tu experiencia:</p>
              
              <div style={styles.listContainer}>
                <div style={styles.listItem}>
                  <h4 style={styles.listTitle}>Con Palo (Tradición Argentina)</h4>
                  <p style={styles.listDesc}>Tiene hojas grandes, palo y poco polvo. El palo actúa como "esqueleto", evitando que la bombilla se tape y diluyendo el amargor. <strong>Ideal para:</strong> Principiantes y cebadas largas y suaves. <strong>Mate recomendado:</strong> Calabaza clásica o Algarrobo.</p>
                </div>
                
                <div style={styles.listItem}>
                  <h4 style={styles.listTitle}>Despalada o "Pura Hoja" (Estilo Uruguayo/Brasileño)</h4>
                  <p style={styles.listDesc}>Sin palos, con un altísimo contenido de polvo y hojas molidas casi impalpables. Su sabor es excepcionalmente intenso, cremoso y espumoso, pero requiere mucha técnica para cebar sin que se tape. <strong>Ideal para:</strong> Bebedores experimentados. <strong>Mate recomendado:</strong> Porongo uruguayo (boca ancha) y bombilla cuchara.</p>
                </div>
                
                <div style={styles.listItem}>
                  <h4 style={styles.listTitle}>Barbacuá (El Sabor Ahumado)</h4>
                  <p style={styles.listDesc}>Se seca artesanalmente exponiendo las hojas al fuego y humo de leñas aromáticas durante días. Tiene un perfil intenso, profundo y acaramelado, que recuerda a un buen whisky o un té Lapsang Souchong. <strong>Ideal para:</strong> Tardes frías de invierno. <strong>Mate recomendado:</strong> Palo Santo.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
        
        <div style={{ textAlign: 'center', marginTop: '6rem', marginBottom: '2rem' }}>
          <button onClick={() => { window.scrollTo(0, 0); navigate('/'); }} className="hero-btn" style={styles.bottomButton}>
            Volver a la Tienda
          </button>
        </div>

      </main>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    minHeight: '100vh',
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    padding: '1.5rem 5%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '0.8rem 1.5rem',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  hero: {
    height: '60vh',
    minHeight: '500px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url("/hero_argentino.png")', // Traditional Argentine aesthetic
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), var(--color-bg))',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '900px',
    padding: '0 2rem',
  },
  kicker: {
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontWeight: '800',
    marginBottom: '1rem',
    textShadow: '0 0 8px rgba(255,255,255,0.8), 0 0 15px rgba(255,255,255,0.4)',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(3rem, 6vw, 5rem)',
    color: '#000',
    lineHeight: '1.1',
    marginBottom: '1.5rem',
    textShadow: '0 0 12px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
  },
  subtitle: {
    fontSize: '1.3rem',
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: '1.6',
    textWrap: 'balance',
    textShadow: '0 2px 10px rgba(0,0,0,0.9)',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '4rem 5%',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: 'var(--glass-bg)',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    padding: '3rem',
    boxShadow: 'var(--shadow-soft)',
    overflow: 'hidden'
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: 'var(--color-primary-dark)',
    marginBottom: '1.5rem',
  },
  smallIcon: {
    background: 'rgba(189, 83, 25, 0.1)',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    float: 'left',
    marginRight: '1.5rem',
    marginBottom: '0.5rem',
  },
  bgIcon: {
    position: 'absolute',
    top: '-30px',
    right: '-10px',
    color: 'var(--color-text)',
    opacity: 0.03,
    zIndex: 0,
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    pointerEvents: 'none',
  },
  text: {
    fontSize: '1.15rem',
    lineHeight: '1.8',
    marginBottom: '1.5rem',
    opacity: 0.85,
    textAlign: 'justify',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  innerCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '2rem',
  },
  innerCardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-accent)',
    marginBottom: '1rem',
    paddingBottom: '0.8rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  innerCardText: {
    fontSize: '1.05rem',
    lineHeight: '1.7',
    opacity: 0.9,
    textAlign: 'justify',
  },
  listContainer: {
    marginTop: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  listItem: {
    paddingLeft: '1.5rem',
    borderLeft: '3px solid var(--color-accent)',
  },
  listTitle: {
    fontSize: '1.4rem',
    color: 'var(--color-primary-dark)',
    marginBottom: '0.5rem',
  },
  listDesc: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    opacity: 0.85,
    textAlign: 'justify',
  },
  bottomButton: {
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    padding: '1.2rem 3rem',
    borderRadius: '50px',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '1px',
    boxShadow: '0 10px 30px rgba(189, 83, 25, 0.3)',
    transition: 'all 0.3s ease',
  }
};

export default HistoriaDelMate;
