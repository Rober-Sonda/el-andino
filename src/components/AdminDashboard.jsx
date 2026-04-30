import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, query, orderBy, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Settings, LayoutDashboard, ListTodo, Package, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'rober.junin@gmail.com';

const STATUSES = [
  { id: 'pending', label: 'Pendiente', color: '#f59e0b', icon: ListTodo },
  { id: 'prepared', label: 'Preparado', color: '#3b82f6', icon: Package },
  { id: 'shipped', label: 'Enviado', color: '#8b5cf6', icon: Truck },
  { id: 'closed', label: 'Cerrado', color: '#10b981', icon: CheckCircle2 }
];

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [mobileActiveStatus, setMobileActiveStatus] = useState('pending');
  const [editingProductKey, setEditingProductKey] = useState(null);
  const [catalogFilter, setCatalogFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const DEFAULT_CONFIG = {
    products: {
      'premium': {
        id: 'premium', name: 'Yerba Premium', category: 'yerbas', description: 'Estacionada naturalmente por 24 meses. Suave, duradera y de molienda equilibrada. Ideal para largas rondas.', image: '/premium_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 3500, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      },
      'ahumada': {
        id: 'ahumada', name: 'Yerba Ahumada', category: 'yerbas', description: 'Secada con maderas seleccionadas (Barbacuá). Un sabor intenso, profundo y con carácter de monte.', image: '/ahumada_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 4000, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      },
      'uruguaya-despalada': {
        id: 'uruguaya-despalada', name: 'Uruguaya Despalada', category: 'yerbas', description: 'Corte fino sin palo, pura hoja. Estilo canario para un mate fuerte, espumoso y de sabor prologando.', image: '/despalada_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 3800, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      },
      'uruguaya-molida': {
        id: 'uruguaya-molida', name: 'Uruguaya Molida', category: 'yerbas', description: 'Tradicional molienda fina con equilibrio perfecto. La clásica y elegante elección oriental.', image: '/molida_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 3200, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      },
      'blend-herencia': {
        id: 'blend-herencia', name: 'Blend: Herencia del Sembrador', category: 'blends', description: 'Equilibrada. Una combinación artesanal diseñada para verdaderos apasionados. Estacionada naturalmente con hoja uruguaya.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3500, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      },
      'blend-fuego': {
        id: 'blend-fuego', name: 'Blend: Fuego del Andino', category: 'blends', description: 'Intensa. Carácter de monte, secada con leña bajo el proceso Barbacuá. Intensa y maderera con un toque de reserva.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3800, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      },
      'blend-charrua': {
        id: 'blend-charrua', name: 'Blend: Tradición Charrúa', category: 'blends', description: 'Clásica. Molienda fina perfecta. Rendimiento impecable para el cebador experimentado oriental.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3400, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      },
      'blend-alma': {
        id: 'blend-alma', name: 'Blend: Alma de Monte', category: 'blends', description: 'Suave y Compleja. Pura hoja uruguaya, estilo canario para un mate fuerte, espumoso y prolongado que no perdona.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3900, formats: [ { id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 } ]
      }
    },
    general: {
      costo_paquete_500g: 150,
      costo_paquete_1kg: 200,
      costo_etiqueta: 50,
      costo_distribucion: 1000
    }
  };

  // Cost config
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (currentUser?.email !== ADMIN_EMAIL) return;

    // Load config
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'admin');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.products) {
            let mergedData = { ...data };
            if (!mergedData.general.costo_paquete_500g) {
               mergedData.general.costo_paquete_500g = data.general?.costo_envasado || 150;
               mergedData.general.costo_paquete_1kg = data.general?.costo_envasado || 200;
               mergedData.general.costo_etiqueta = 50;
            }

            let mergedProducts = { ...DEFAULT_CONFIG.products };
            Object.keys(mergedData.products || {}).forEach(key => {
              mergedProducts[key] = mergedData.products[key];
            });

            // Convert old prices object to formats array
            Object.keys(mergedProducts).forEach(key => {
              const p = mergedProducts[key];
              if (!p.formats && p.prices) {
                p.formats = [
                  { id: '500g', name: '½ Kilo', price: p.prices['500g'] || 4000 },
                  { id: '1kg', name: '1 Kilo', price: p.prices['1kg'] || 7500 },
                  { id: 'granel', name: 'A Granel', price: p.prices['granel'] || 7500 },
                  { id: 'granel_mayorista', name: 'Mayorista >40kg', price: p.prices['granel_mayorista'] || 6000 }
                ];
              }
              if (!p.id) p.id = key;
              if (!p.category) p.category = 'otros';
              if (p.isActive === undefined) p.isActive = true;
              if (p.discountPercentage === undefined) p.discountPercentage = 0;
              if (p.costo_produccion === undefined) p.costo_produccion = p.costo_kg || 3500;
            });
            
            mergedData.products = mergedProducts;
            setConfig(mergedData);
          }
        }
      } catch (e) {
        console.log("Error loading config, using defaults:", e);
      }
    };
    loadConfig();

    // Listen to orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = [];
      snapshot.forEach(doc => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (e) {
      console.error('Error updating status', e);
    }
  };

  const saveConfig = async () => {
    try {
      await setDoc(doc(db, 'config', 'admin'), config);
      alert('Configuración y precios guardados! Si tenés abierta la tienda pública, recargá para ver los cambios.');
    } catch (e) {
      console.error('Error saving config', e);
    }
  };

  const updateGeneral = (field, value) => {
    setConfig(prev => ({ ...prev, general: { ...prev.general, [field]: Number(value) } }));
  };

  const updateProduct = (key, field, value) => {
    setConfig(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [key]: { ...prev.products[key], [field]: value }
      }
    }));
  };

  const updateFormat = (prodKey, formatId, field, value) => {
    setConfig(prev => {
      const prod = prev.products[prodKey];
      const newFormats = prod.formats.map(f => f.id === formatId ? { ...f, [field]: value } : f);
      return {
        ...prev,
        products: {
          ...prev.products,
          [prodKey]: { ...prod, formats: newFormats }
        }
      };
    });
  };

  const addFormat = (prodKey) => {
    const id = Date.now().toString();
    setConfig(prev => {
      const prod = prev.products[prodKey];
      return {
        ...prev,
        products: {
          ...prev.products,
          [prodKey]: { ...prod, formats: [...prod.formats, { id, name: 'Nuevo Formato', price: 0 }] }
        }
      };
    });
  };

  const removeFormat = (prodKey, formatId) => {
    setConfig(prev => {
      const prod = prev.products[prodKey];
      return {
        ...prev,
        products: {
          ...prev.products,
          [prodKey]: { ...prod, formats: prod.formats.filter(f => f.id !== formatId) }
        }
      };
    });
  };

  const addProduct = () => {
    const newId = 'prod_' + Date.now();
    setConfig(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [newId]: {
          id: newId,
          name: 'Nuevo Producto',
          category: 'otros',
          isActive: true,
          discountPercentage: 0,
          description: '',
          image: '',
          costo_produccion: 0,
          formats: [{ id: 'unidad', name: '1 Unidad', price: 0 }]
        }
      }
    }));
    setEditingProductKey(newId);
  };

  const removeProduct = (key) => {
    if(!window.confirm("¿Estás seguro de eliminar este producto del catálogo?")) return;
    setConfig(prev => {
      const newProds = { ...prev.products };
      delete newProds[key];
      return { ...prev, products: newProds };
    });
    setEditingProductKey(null);
  };

  if (currentUser?.email !== ADMIN_EMAIL) {
    return <div style={{padding: '5rem', textAlign:'center'}}>Cargando o Acceso Denegado...</div>;
  }

  // Calculate Metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  let monthlySales = 0;
  let totalKilosSold = 0;
  let totalOrdersThisMonth = 0;
  let totalCost = 0;

  orders.forEach(o => {
    if (o.createdAt) {
      const d = o.createdAt.toDate();
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        monthlySales += o.totalPrice || 0;
        totalOrdersThisMonth += 1;
        
        o.items?.forEach(item => {
           let kilos = 0;
           let unitCost = 0;
           if (item.format === '500g') {
             kilos = 0.5 * item.quantity;
             unitCost = (config.general.costo_paquete_500g || 150) + (config.general.costo_etiqueta || 50);
           } else if (item.format === '1kg') {
             kilos = 1 * item.quantity;
             unitCost = (config.general.costo_paquete_1kg || 200) + (config.general.costo_etiqueta || 50);
           } else {
             kilos = 1 * item.quantity;
             unitCost = 0;
           }
           
           totalKilosSold += kilos;

           let productKey = item.id;
           if (productKey?.startsWith('blend-')) productKey = 'blend';
           if (!config.products[productKey]) productKey = 'premium';
           
           totalCost += kilos * (config.products[productKey]?.costo_produccion || 3500);
           totalCost += unitCost * item.quantity;
        });
      }
    }
  });

  totalCost += (totalOrdersThisMonth * config.general.costo_distribucion);
  const netProfit = monthlySales - totalCost;

  return (
    <div style={styles.container} className="admin-container glass">
      <div style={styles.header}>
        <h1 style={styles.title}><LayoutDashboard size={28} /> Centro de Control El Andino</h1>
        <div style={styles.tabs} className="admin-tabs">
          <button className="admin-tab-btn" style={{...styles.tabBtn, ...(activeTab === 'board' ? styles.tabActive : {})}} onClick={() => setActiveTab('board')}>
            Gestión de Pedidos
          </button>
          <button className="admin-tab-btn" style={{...styles.tabBtn, ...(activeTab === 'finance' ? styles.tabActive : {})}} onClick={() => { setActiveTab('finance'); setEditingProductKey(null); }}>
            Finanzas
          </button>
          <button className="admin-tab-btn" style={{...styles.tabBtn, ...(activeTab === 'catalog' ? styles.tabActive : {})}} onClick={() => setActiveTab('catalog')}>
            Catálogo
          </button>
        </div>
      </div>

      {activeTab === 'board' ? (
        <div className="admin-board-wrapper">
          <div className="mobile-only" style={styles.segmentControl}>
            {STATUSES.map(s => {
               const count = orders.filter(o => (o.status || 'pending') === s.id).length;
               const showIndicator = count > 0 && s.id !== 'closed';
               return (
                 <button 
                   key={`seg-${s.id}`} 
                   onClick={() => setMobileActiveStatus(s.id)}
                   style={{
                     ...styles.segmentBtn, 
                     ...(mobileActiveStatus === s.id ? { background: s.color, color: 'white' } : {})
                   }}
                 >
                   {s.label}
                   {showIndicator && (
                     <span style={{
                       display: 'inline-block',
                       width: '8px',
                       height: '8px',
                       backgroundColor: mobileActiveStatus === s.id ? '#fff' : s.color,
                       borderRadius: '50%',
                       marginLeft: '6px'
                     }} />
                   )}
                 </button>
               );
            })}
          </div>
          <div style={styles.board} className="admin-board">
            {STATUSES.map(col => {
              const colOrders = orders.filter(o => (o.status || 'pending') === col.id);
              const Icon = col.icon;
              return (
                <div key={col.id} className={`admin-column ${mobileActiveStatus === col.id ? 'active-mobile' : ''}`} style={styles.column}>
                  <div style={{...styles.columnHeader, borderBottom: `3px solid ${col.color}`}}>
                  <Icon size={20} color={col.color} />
                  <h3>{col.label}</h3>
                  <span style={styles.countBadge}>{colOrders.length}</span>
                </div>
                <div style={styles.columnContent}>
                  {colOrders.map(order => (
                    <div key={order.id} style={styles.orderCard}>
                      <div style={styles.cardHeader}>
                        <strong>{order.customerName}</strong>
                        <span style={styles.date}>{order.createdAt ? order.createdAt.toDate().toLocaleDateString() : ''}</span>
                      </div>
                      <div style={styles.cardBody}>
                        <p>{order.items?.length || 0} items ({order.totalKilos}kg)</p>
                        <p style={styles.price}>${order.totalPrice}</p>
                      </div>
                      <div style={styles.cardFooter}>
                        <select 
                          value={order.status || 'pending'} 
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={styles.statusSelect}
                        >
                          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <a 
                          href={`https://wa.me/2317472432`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={styles.waBtn}
                        >
                          Chat
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : activeTab === 'finance' ? (
        <div style={styles.financePanel}>
          <div style={styles.metricsGrid}>
            <div style={{...styles.metricCard, borderLeft: '4px solid #3b82f6'}}>
              <div style={styles.metricTitle}>Ventas del Mes (Bruto)</div>
              <div style={styles.metricValue}>${monthlySales.toLocaleString()}</div>
            </div>
            <div style={{...styles.metricCard, borderLeft: '4px solid #f59e0b'}}>
              <div style={styles.metricTitle}>Costos Totales</div>
              <div style={styles.metricValue}>${totalCost.toLocaleString()}</div>
            </div>
            <div style={{...styles.metricCard, borderLeft: '4px solid #10b981'}}>
              <div style={styles.metricTitle}>Ganancia Neta</div>
              <div style={{...styles.metricValue, color: '#10b981'}}>${netProfit.toLocaleString()}</div>
            </div>
            <div style={{...styles.metricCard, borderLeft: '4px solid #8b5cf6'}}>
              <div style={styles.metricTitle}>Kilos Vendidos</div>
              <div style={styles.metricValue}>{totalKilosSold} kg</div>
            </div>
          </div>

          <div style={styles.settingsGrid}>
            <div style={styles.generalCostsCard}>
              <h3 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom: '1.5rem'}}><Settings size={20}/> Costos Globales</h3>
              <div style={styles.inputGroup}>
                <label>Costo Paquete ½ Kilo</label>
                <input type="number" value={config.general.costo_paquete_500g} onChange={(e) => updateGeneral('costo_paquete_500g', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label>Costo Paquete 1 Kilo</label>
                <input type="number" value={config.general.costo_paquete_1kg} onChange={(e) => updateGeneral('costo_paquete_1kg', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label>Costo Etiqueta (Uniforme)</label>
                <input type="number" value={config.general.costo_etiqueta} onChange={(e) => updateGeneral('costo_etiqueta', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label>Costo Distribución (por Pedido total)</label>
                <input type="number" value={config.general.costo_distribucion} onChange={(e) => updateGeneral('costo_distribucion', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.infoBox}>
                <p>El costo de envasado (Paquete + Etiqueta) se descuenta al calcular la ganancia de <strong>½ Kilo</strong> y <strong>1 Kilo</strong> correspondientes. La venta a Granel asume despacho directo sin estos costos unitarios.</p>
              </div>
            </div>
          </div>
          <button onClick={saveConfig} style={styles.saveBtnFull}>Guardar Costos Globales</button>
        </div>
      ) : activeTab === 'catalog' ? (
        <div style={styles.financePanel}>
          {!editingProductKey ? (
            <>
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
                 <button onClick={() => setCatalogFilter('all')} style={{...styles.segmentBtn, background: catalogFilter === 'all' ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)', color: catalogFilter === 'all' ? '#fff' : '#555'}}>Todos</button>
                 <button onClick={() => setCatalogFilter('yerbas')} style={{...styles.segmentBtn, background: catalogFilter === 'yerbas' ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)', color: catalogFilter === 'yerbas' ? '#fff' : '#555'}}>Yerbas Clásicas</button>
                 <button onClick={() => setCatalogFilter('blends')} style={{...styles.segmentBtn, background: catalogFilter === 'blends' ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)', color: catalogFilter === 'blends' ? '#fff' : '#555'}}>Blends de Autor</button>
                 <button onClick={() => setCatalogFilter('accesorios')} style={{...styles.segmentBtn, background: catalogFilter === 'accesorios' ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)', color: catalogFilter === 'accesorios' ? '#fff' : '#555'}}>Accesorios</button>
                 <button onClick={() => setCatalogFilter('otros')} style={{...styles.segmentBtn, background: catalogFilter === 'otros' ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)', color: catalogFilter === 'otros' ? '#fff' : '#555'}}>Otros</button>
              </div>
              <div style={styles.catalogGrid}>
                {Object.keys(config.products)
                  .filter(key => catalogFilter === 'all' || (config.products[key].category || 'otros') === catalogFilter)
                  .map(key => {
                   const prod = config.products[key];
                   return (
                     <div key={key} style={{...styles.catalogItemCard, opacity: prod.isActive ? 1 : 0.5}} onClick={() => setEditingProductKey(key)}>
                        <div style={styles.catalogItemImgContainer}>
                           <img src={prod.image || '/blend_bg.jpg'} alt={prod.name} style={styles.catalogItemImg} />
                           {!prod.isActive && <span style={{...styles.catalogItemBadge, position: 'absolute', top: 10, left: 10, background: '#555'}}>Pausado</span>}
                           {prod.discountPercentage > 0 && <span style={{...styles.catalogItemBadge, position: 'absolute', top: 10, right: 10, background: '#ef4444'}}>{prod.discountPercentage}% OFF</span>}
                        </div>
                        <div style={styles.catalogItemBody}>
                           <h4 style={styles.catalogItemTitle}>{prod.name}</h4>
                           <p style={styles.catalogItemCost}>Costo: ${prod.costo_produccion}</p>
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                              <span style={styles.catalogItemBadge}>{prod.formats?.length || 0} formatos</span>
                              <span style={{fontSize: '0.7rem', color: '#888', textTransform: 'uppercase'}}>{prod.category || 'otros'}</span>
                           </div>
                        </div>
                     </div>
                   );
                })}
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap'}}>
                 <button onClick={addProduct} style={{...styles.saveBtnFull, background: '#3b82f6', marginTop: 0, flex: 1}}>+ Añadir Producto</button>
                 <button onClick={saveConfig} style={{...styles.saveBtnFull, marginTop: 0, flex: 1}}>Guardar Cambios de Catálogo</button>
              </div>
            </>
          ) : (
            (() => {
               const key = editingProductKey;
               const prod = config.products[key];
               if (!prod) { setEditingProductKey(null); return null; }
               
               const costoEnvase500 = (config.general.costo_paquete_500g || 150) + (config.general.costo_etiqueta || 50);
               const costoEnvase1kg = (config.general.costo_paquete_1kg || 200) + (config.general.costo_etiqueta || 50);

               return (
                 <div style={{...styles.productCostCard, padding: '1rem'}}>
                   <button onClick={() => setEditingProductKey(null)} style={styles.backBtn}>← Volver al Listado</button>
                   
                   <div style={{display:'flex', gap: '10px', flexWrap: 'wrap', justifyContent:'space-between', alignItems:'center', marginBottom: '1.5rem', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                     <input 
                        type="text" 
                        value={prod.name} 
                        onChange={(e) => updateProduct(key, 'name', e.target.value)}
                        style={{...styles.inputNoBorder, flex: '1 1 150px', minWidth: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', padding: '0'}}
                     />
                     <button onClick={() => removeProduct(key)} style={{...styles.deleteBtn, flexShrink: 0}}>Eliminar</button>
                   </div>
                   
                   <div style={{display:'flex', gap: '1rem', flexWrap: 'wrap'}}>
                     <div style={{...styles.inputGroup, flex: '1 1 200px', minWidth: 0}}>
                       <label>URL de Imagen</label>
                       <input type="text" value={prod.image || ''} onChange={(e) => updateProduct(key, 'image', e.target.value)} style={{...styles.input, minWidth: 0}} placeholder="/premium_full.jpg o https://..." />
                     </div>
                     <div style={{...styles.inputGroup, flex: '1 1 150px', minWidth: 0}}>
                       <label>Categoría</label>
                       <select value={prod.category || 'otros'} onChange={(e) => updateProduct(key, 'category', e.target.value)} style={{...styles.input, minWidth: 0}}>
                         <option value="yerbas">Yerbas Clásicas</option>
                         <option value="blends">Blends de Autor</option>
                         <option value="accesorios">Accesorios</option>
                         <option value="otros">Otros</option>
                       </select>
                     </div>
                   </div>

                   <div style={{display:'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden'}}>
                     <div style={{...styles.inputGroup, flex: '1 1 150px', marginBottom: 0, minWidth: 0}}>
                       <label style={{fontWeight: 'bold'}}>Estado del Producto</label>
                       <select value={prod.isActive ? 'true' : 'false'} onChange={(e) => updateProduct(key, 'isActive', e.target.value === 'true')} style={{...styles.input, fontWeight: 'bold', color: prod.isActive ? '#10b981' : '#555', minWidth: 0}}>
                         <option value="true">🟢 Activo (Visible)</option>
                         <option value="false">⚪ Pausado (Oculto)</option>
                       </select>
                     </div>
                     <div style={{...styles.inputGroup, flex: '1 1 150px', marginBottom: 0, minWidth: 0}}>
                       <label style={{fontWeight: 'bold', color: '#ef4444'}}>% de Oferta (Descuento)</label>
                       <div style={styles.inputPrefix}>
                         <input type="number" min="0" max="100" value={prod.discountPercentage || 0} onChange={(e) => updateProduct(key, 'discountPercentage', Number(e.target.value))} style={{...styles.inputNoBorder, minWidth: 0}} />
                         <span style={{fontWeight: 'bold', color: '#ef4444'}}>% OFF</span>
                       </div>
                     </div>
                   </div>
                   <div style={styles.inputGroup}>
                     <label>Descripción corta</label>
                     <textarea value={prod.description || ''} onChange={(e) => updateProduct(key, 'description', e.target.value)} style={{...styles.input, minHeight: '60px', minWidth: 0, width: '100%', boxSizing: 'border-box'}} />
                   </div>

                   <div style={styles.inputGroup}>
                     <label>Costo Producción (por Unidad base o KG)</label>
                     <div style={styles.inputPrefix}>
                       <span>$</span>
                       <input type="number" value={prod.costo_produccion || 0} onChange={(e) => updateProduct(key, 'costo_produccion', Number(e.target.value))} style={styles.inputNoBorder} />
                     </div>
                   </div>

                   <div style={styles.formatBreakdown}>
                     <h4 style={{marginTop: '1.5rem', marginBottom: '1rem', color: '#555', fontSize: '0.9rem', textTransform: 'uppercase', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        Formatos y Precios
                        <button onClick={() => addFormat(key)} style={styles.addFormatBtn}>+ Agregar Formato</button>
                     </h4>
                     
                     {prod.formats?.map((format, index) => {
                       let deductions = 0;
                       let calculationText = `Cálculo: $${format.price} - $${prod.costo_produccion} (Costo base)`;
                       
                       if (format.id === '500g') {
                         deductions = (prod.costo_produccion/2) + costoEnvase500;
                         calculationText = `Cálculo: $${format.price} - $${prod.costo_produccion/2} (Costo/2) - $${costoEnvase500} (Envase)`;
                       } else if (format.id === '1kg') {
                         deductions = prod.costo_produccion + costoEnvase1kg;
                         calculationText = `Cálculo: $${format.price} - $${prod.costo_produccion} (Costo) - $${costoEnvase1kg} (Envase)`;
                       } else {
                         deductions = prod.costo_produccion;
                       }
                       
                       const ganancia = format.price - deductions;

                       return (
                         <div key={format.id} style={styles.formatRow}>
                            <div style={{display:'flex', gap: '10px', flexWrap: 'wrap', minWidth: 0}}>
                              <div style={{flex: '1 1 120px', minWidth: 0}}>
                                <label style={styles.smallLabel}>Nombre del Formato</label>
                                <input type="text" value={format.name} onChange={(e) => updateFormat(key, format.id, 'name', e.target.value)} style={{...styles.inputPrefixSmall, width: '100%', boxSizing: 'border-box', minWidth: 0}} />
                              </div>
                              <div style={{flex: '1 1 150px', minWidth: 0}}>
                                <label style={styles.smallLabel}>Precio Final</label>
                                <div style={{display: 'flex', gap: '5px', alignItems: 'stretch', minWidth: 0}}>
                                  <div style={{...styles.inputPrefixSmall, flex: 1, boxSizing: 'border-box', minWidth: 0}}>
                                    <span>$</span>
                                    <input type="number" value={format.price} onChange={(e) => updateFormat(key, format.id, 'price', Number(e.target.value))} style={{...styles.inputNoBorderSmall, width: '100%', boxSizing: 'border-box', minWidth: 0}} />
                                  </div>
                                  <button onClick={() => removeFormat(key, format.id)} style={{...styles.deleteBtn, padding: '0 15px', margin: 0, height: 'auto', flexShrink: 0}}>X</button>
                                </div>
                              </div>
                            </div>
                           <div style={styles.profitInfo}>
                             <strong style={{color: 'var(--color-primary)'}}>Ganancia Neta: ${ganancia}</strong>
                             <span style={{fontSize: '0.7rem'}}>{calculationText}</span>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                   
                   <div style={{marginTop: '2rem'}}>
                      <button onClick={saveConfig} style={styles.saveBtnFull}>Guardar Catálogo</button>
                   </div>
                 </div>
               );
            })()
          )}
        </div>
      ) : null}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    minHeight: '80vh',
    marginTop: '100px',
    marginBottom: '20px',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '98%',
    borderRadius: '16px',
    backgroundColor: 'var(--color-bg-light)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow)',
    fontFamily: 'var(--font-sans)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    paddingBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--color-primary-dark)',
    fontSize: '1.8rem',
    fontFamily: 'var(--font-serif)',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabBtn: {
    padding: '0.8rem 1.5rem',
    border: 'none',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: 'var(--color-text)',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--color-primary)',
    color: 'white',
    boxShadow: '0 4px 10px rgba(74, 124, 46, 0.3)',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))',
    gap: '1.5rem',
    alignItems: 'start',
    overflowX: 'auto',
    paddingBottom: '1rem',
  },
  segmentControl: {
    width: '100%',
    marginBottom: '1.5rem',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '12px',
    padding: '4px',
    gap: '2px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  segmentBtn: {
    flex: 1,
    padding: '8px 2px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    color: '#555',
    transition: 'all 0.2s',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  column: {
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '12px',
    padding: '1rem',
    border: '1px solid rgba(0,0,0,0.05)',
    minHeight: '500px'
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  countBadge: {
    marginLeft: 'auto',
    background: 'rgba(0,0,0,0.1)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  orderCard: {
    background: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  },
  date: {
    color: '#888',
    fontSize: '0.8rem'
  },
  cardBody: {
    fontSize: '0.9rem',
    color: '#444',
    marginBottom: '1rem'
  },
  price: {
    fontWeight: 'bold',
    color: 'var(--color-primary)',
    fontSize: '1.1rem',
    marginTop: '4px'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  statusSelect: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  waBtn: {
    padding: '4px 8px',
    background: '#25D366',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  financePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  metricCard: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  metricTitle: {
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '0.5rem'
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#222'
  },
  settingsBox: {
    background: 'rgba(255,255,255,0.7)',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    maxWidth: '500px'
  },
  inputGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  saveBtn: {
    marginTop: '1rem',
    width: '100%',
    padding: '1rem',
    background: 'var(--color-primary-dark)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1.1rem'
  },
  settingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  generalCostsCard: {
    background: 'rgba(255,255,255,0.8)',
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  infoBox: {
    background: 'rgba(0,0,0,0.03)',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '1rem',
    borderLeft: '4px solid var(--color-primary)'
  },
  productCostCard: {
    background: '#fff',
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  inputPrefix: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '0 1rem',
    background: '#f9f9f9'
  },
  inputNoBorder: {
    flex: 1,
    padding: '0.8rem',
    border: 'none',
    background: 'transparent',
    fontSize: '1rem',
    outline: 'none'
  },
  formatBreakdown: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #eaeaea'
  },
  formatRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  smallLabel: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#444',
    display: 'block',
    marginBottom: '4px'
  },
  inputPrefixSmall: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0 0.5rem',
    background: '#fff'
  },
  inputNoBorderSmall: {
    flex: 1,
    padding: '0.5rem',
    border: 'none',
    background: 'transparent',
    fontSize: '0.9rem',
    outline: 'none'
  },
  profitInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: 'rgba(74, 124, 46, 0.05)',
    padding: '0.8rem',
    borderRadius: '8px',
    marginTop: '0.5rem'
  },
  saveBtnFull: {
    marginTop: '2rem',
    width: '100%',
    padding: '1.2rem',
    background: 'var(--color-primary-dark)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1.2rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  deleteBtn: {
    padding: '4px 8px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  addFormatBtn: {
    padding: '4px 10px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  catalogItemCard: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    border: '1px solid var(--glass-border)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  catalogItemImgContainer: {
    height: '140px',
    background: '#1a1a1a',
    overflow: 'hidden'
  },
  catalogItemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  catalogItemBody: {
    padding: '1rem',
  },
  catalogItemTitle: {
    fontSize: '1rem',
    color: 'var(--color-primary-dark)',
    marginBottom: '0.2rem'
  },
  catalogItemCost: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.5rem'
  },
  catalogItemBadge: {
    fontSize: '0.75rem',
    background: 'rgba(74, 124, 46, 0.1)',
    color: 'var(--color-primary)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: 'bold'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    padding: '0.5rem 0',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

export default AdminDashboard;
