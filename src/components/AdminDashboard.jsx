import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, query, orderBy, setDoc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Settings, LayoutDashboard, ListTodo, Package, Truck, CheckCircle2, Search, X, PlusCircle, Trash2, Save } from 'lucide-react';
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

  // Search and Pagination State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderViewMode, setOrderViewMode] = useState('board'); // 'board' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;

  // Manual Order Form State
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [manualOrderForm, setManualOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: 'closed',
    items: []
  });

  const DEFAULT_CONFIG = {
    products: {
      'premium': {
        id: 'premium', name: 'Yerba Premium', category: 'yerbas', description: 'Estacionada naturalmente por 24 meses. Suave, duradera y de molienda equilibrada. Ideal para largas rondas.', image: '/premium_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 3500, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
      },
      'ahumada': {
        id: 'ahumada', name: 'Yerba Ahumada', category: 'yerbas', description: 'Secada con maderas seleccionadas (Barbacuá). Un sabor intenso, profundo y con carácter de monte.', image: '/ahumada_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 4000, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
      },
      'uruguaya-despalada': {
        id: 'uruguaya-despalada', name: 'Uruguaya Despalada', category: 'yerbas', description: 'Corte fino sin palo, pura hoja. Estilo canario para un mate fuerte, espumoso y de sabor prologando.', image: '/despalada_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 3800, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
      },
      'uruguaya-molida': {
        id: 'uruguaya-molida', name: 'Uruguaya Molida', category: 'yerbas', description: 'Tradicional molienda fina con equilibrio perfecto. La clásica y elegante elección oriental.', image: '/molida_full.jpg',
        isActive: true, discountPercentage: 0, costo_produccion: 3200, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: '1kg', name: '1 Kilo', price: 7500 }, { id: 'granel', name: 'A Granel', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
      },
      'blend-herencia': {
        id: 'blend-herencia', name: 'Blend: Herencia del Sembrador', category: 'blends', description: 'Base Premium • Pura Hoja • Molienda media. Equilibrio entre el estacionamiento premium y la intensidad de la hoja pura despalada. Esta fusión crea un mate de textura suave, un sabor más ligero y con un rendimiento excepcional.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3500, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
      },
      'blend-fuego': {
        id: 'blend-fuego', name: 'Blend: Fuego Andino', category: 'blends', description: 'Base Barbacuá • Toques Premium • Con palo. Intensa base ahumada barbacuá equilibrada con sutiles hojas puras y premium. Brinda un sabor profundo, cuerpo robusto y matices leñosos, logrando un mate de gran carácter y persistencia.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3800, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
      },
      'blend-charrua': {
        id: 'blend-charrua', name: 'Blend: Tradición Charrúa', category: 'blends', description: 'Corte Oriental • Molienda fina • Gran espuma. Fusión de molienda fina, hoja pura y un toque premium. Este clásico oriental brinda un mate intenso, logrando un sabor fuerte y bien definido.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3400, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
      },
      'blend-alma': {
        id: 'blend-alma', name: 'Blend: Alma de Monte', category: 'blends', description: 'Base Despalada • Toque Ahumado • Sin palo. Base de pura hoja despalada coronada con sutiles notas ahumadas. El resultado es un mate con un sabor imponente, con matices a leña que logran capturar la verdadera esencia del monte.', image: '/kraft_bag.png',
        isActive: true, discountPercentage: 0, costo_produccion: 3900, formats: [{ id: '500g', name: '½ Kilo', price: 4000 }, { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 }, { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }]
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

  const handleAddManualItem = () => {
    const activeProducts = Object.keys(config.products).filter(k => config.products[k].isActive);
    if (activeProducts.length === 0) return;
    const firstProdKey = activeProducts[0];
    const firstProd = config.products[firstProdKey];
    const format = firstProd.formats && firstProd.formats.length > 0 ? firstProd.formats[0] : { id: 'unidad', price: 0 };
    setManualOrderForm(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: firstProdKey,
        formatId: format.id,
        quantity: 1,
        customPrice: format.price
      }]
    }));
  };

  const handleManualItemChange = (index, field, value) => {
    setManualOrderForm(prev => {
      const newItems = [...prev.items];
      const item = newItems[index];
      
      if (field === 'productId') {
        const prod = config.products[value];
        item.productId = value;
        const format = prod.formats && prod.formats.length > 0 ? prod.formats[0] : { id: 'unidad', price: 0 };
        item.formatId = format.id;
        item.customPrice = format.price;
      } else if (field === 'formatId') {
        const prod = config.products[item.productId];
        const format = prod.formats.find(f => f.id === value);
        item.formatId = value;
        item.customPrice = format ? format.price : 0;
      } else if (field === 'quantity') {
        item.quantity = Number(value);
      } else if (field === 'customPrice') {
        item.customPrice = Number(value);
      }
      return { ...prev, items: newItems };
    });
  };

  const removeManualItem = (index) => {
    setManualOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const submitManualOrder = async () => {
    if (!manualOrderForm.customerName) {
      alert("Ingrese nombre del cliente");
      return;
    }
    if (manualOrderForm.items.length === 0) {
      alert("Agregue al menos un producto");
      return;
    }

    let totalKilos = 0;
    let totalPrice = 0;
    const itemsToSave = manualOrderForm.items.map(i => {
      const prod = config.products[i.productId];
      let kilos = 0;
      if (i.formatId === '500g') kilos = 0.5 * i.quantity;
      else if (i.formatId === '1kg' || i.formatId === 'granel') kilos = 1 * i.quantity;
      
      totalKilos += kilos;
      totalPrice += i.customPrice * i.quantity;

      return {
        id: i.productId,
        name: prod.name,
        format: i.formatId,
        quantity: i.quantity,
        formattedPrice: i.customPrice,
        image: prod.image || ''
      };
    });

    try {
      await addDoc(collection(db, 'orders'), {
        customerName: manualOrderForm.customerName,
        customerEmail: manualOrderForm.customerEmail,
        customerPhone: manualOrderForm.customerPhone,
        status: manualOrderForm.status,
        items: itemsToSave,
        totalKilos,
        totalPrice,
        createdAt: serverTimestamp(),
        isManual: true
      });
      setIsManualOrderModalOpen(false);
      setManualOrderForm({ customerName: '', customerEmail: '', customerPhone: '', status: 'closed', items: [] });
      alert("Pedido manual creado correctamente");
    } catch (e) {
      console.error(e);
      alert("Error al crear pedido");
    }
  };

  const handleOpenManualModal = () => {
    const activeProducts = Object.keys(config.products).filter(k => config.products[k].isActive);
    let initialItems = [];
    if (activeProducts.length > 0) {
      const firstProdKey = activeProducts[0];
      const firstProd = config.products[firstProdKey];
      const format = firstProd.formats && firstProd.formats.length > 0 ? firstProd.formats[0] : { id: 'unidad', price: 0 };
      initialItems = [{
        productId: firstProdKey,
        formatId: format.id,
        quantity: 1,
        customPrice: format.price
      }];
    }
    setManualOrderForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      status: 'closed',
      items: initialItems
    });
    setIsManualOrderModalOpen(true);
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
    if (!window.confirm("¿Estás seguro de eliminar este producto del catálogo?")) return;
    setConfig(prev => {
      const newProds = { ...prev.products };
      delete newProds[key];
      return { ...prev, products: newProds };
    });
    setEditingProductKey(null);
  };

  if (currentUser?.email !== ADMIN_EMAIL) {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>Cargando o Acceso Denegado...</div>;
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
          <button className="admin-tab-btn" style={{ ...styles.tabBtn, ...(activeTab === 'board' ? styles.tabActive : {}) }} onClick={() => setActiveTab('board')}>
            Gestión de Pedidos
          </button>
          <button className="admin-tab-btn" style={{ ...styles.tabBtn, ...(activeTab === 'finance' ? styles.tabActive : {}) }} onClick={() => { setActiveTab('finance'); setEditingProductKey(null); }}>
            Finanzas
          </button>
          <button className="admin-tab-btn" style={{ ...styles.tabBtn, ...(activeTab === 'catalog' ? styles.tabActive : {}) }} onClick={() => setActiveTab('catalog')}>
            Catálogo
          </button>
        </div>
      </div>

      {activeTab === 'board' ? (
        <div className="admin-board-wrapper">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', flex: 1, gap: '10px', minWidth: '250px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar cliente, email o teléfono..." 
                  value={orderSearchQuery}
                  onChange={(e) => {setOrderSearchQuery(e.target.value); setCurrentPage(1);}}
                  style={{ ...styles.input, paddingLeft: '35px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <select value={orderStatusFilter} onChange={(e) => {setOrderStatusFilter(e.target.value); setCurrentPage(1);}} style={styles.input}>
                <option value="all">Todos los estados</option>
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setOrderViewMode(orderViewMode === 'board' ? 'list' : 'board')}
                style={{ ...styles.saveBtn, marginTop: 0, padding: '0.8rem 1rem', background: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center' }}
              >
                {orderViewMode === 'board' ? 'Ver como Lista' : 'Ver como Tablero'}
              </button>
              <button 
                onClick={handleOpenManualModal}
                style={{ ...styles.saveBtn, marginTop: 0, padding: '0.8rem 1rem', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid var(--color-primary-dark)' }}
              >
                <PlusCircle size={18} /> Nuevo Manual
              </button>
            </div>
          </div>

          {/* Render Board or List */}
          {(() => {
            const filteredOrders = orders.filter(o => {
              if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
              if (orderSearchQuery) {
                const q = orderSearchQuery.toLowerCase();
                const matchName = o.customerName?.toLowerCase().includes(q);
                const matchEmail = o.customerEmail?.toLowerCase().includes(q);
                const matchPhone = o.customerPhone?.toLowerCase().includes(q);
                if (!matchName && !matchEmail && !matchPhone) return false;
              }
              return true;
            });

            if (orderViewMode === 'board') {
              return (
                <>
                  <div className="mobile-only" style={styles.segmentControl}>
                    {STATUSES.map(s => {
                      const count = filteredOrders.filter(o => (o.status || 'pending') === s.id).length;
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
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: mobileActiveStatus === s.id ? '#fff' : s.color, borderRadius: '50%', marginLeft: '6px' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div style={styles.board} className="admin-board">
                    {STATUSES.map(col => {
                      const colOrders = filteredOrders.filter(o => (o.status || 'pending') === col.id);
                      const Icon = col.icon;
                      return (
                        <div key={col.id} className={`admin-column ${mobileActiveStatus === col.id ? 'active-mobile' : ''}`} style={styles.column}>
                          <div style={{ ...styles.columnHeader, borderBottom: `3px solid ${col.color}` }}>
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
                                  <select value={order.status || 'pending'} onChange={(e) => updateStatus(order.id, e.target.value)} style={styles.statusSelect}>
                                    {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                  </select>
                                  <a href={`https://wa.me/${order.customerPhone || '2317472432'}`} target="_blank" rel="noreferrer" style={styles.waBtn}>Chat</a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            } else {
              // LIST VIEW
              const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
              const paginatedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

              return (
                <div style={{ background: 'var(--glass-bg)', borderRadius: '12px', padding: '1rem', overflowX: 'auto', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                        <th style={{ padding: '12px 8px' }}>Fecha</th>
                        <th style={{ padding: '12px 8px' }}>Cliente</th>
                        <th style={{ padding: '12px 8px' }}>Contacto</th>
                        <th style={{ padding: '12px 8px' }}>Kilos</th>
                        <th style={{ padding: '12px 8px' }}>Total</th>
                        <th style={{ padding: '12px 8px' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)' }}>{order.createdAt ? order.createdAt.toDate().toLocaleDateString() : ''}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{order.customerName} {order.isManual && <span style={{fontSize:'0.7rem', background:'var(--color-primary)', color:'#fff', padding:'2px 6px', borderRadius:'10px', marginLeft: '5px'}}>Manual</span>}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)' }}>
                            <div>{order.customerEmail || '-'}</div>
                            <div style={{ fontSize: '0.8rem' }}>{order.customerPhone || '-'}</div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{order.totalKilos}kg</td>
                          <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--color-accent)' }}>${order.totalPrice}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <select value={order.status || 'pending'} onChange={(e) => updateStatus(order.id, e.target.value)} style={{ ...styles.statusSelect, background: 'var(--color-bg-light)', color: 'var(--color-text)', border: '1px solid var(--glass-border)' }}>
                              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {paginatedOrders.length === 0 && (
                        <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay pedidos que coincidan.</td></tr>
                      )}
                    </tbody>
                  </table>
                  
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                      <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(p => p - 1)}
                        style={{ padding: '6px 12px', background: currentPage === 1 ? 'transparent' : 'var(--color-primary)', color: currentPage === 1 ? 'var(--color-text-muted)' : '#fff', borderRadius: '6px', border: currentPage === 1 ? '1px solid var(--glass-border)' : 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                      >Anterior</button>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>Página {currentPage} de {totalPages}</span>
                      <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(p => p + 1)}
                        style={{ padding: '6px 12px', background: currentPage === totalPages ? 'transparent' : 'var(--color-primary)', color: currentPage === totalPages ? 'var(--color-text-muted)' : '#fff', borderRadius: '6px', border: currentPage === totalPages ? '1px solid var(--glass-border)' : 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                      >Siguiente</button>
                    </div>
                  )}
                </div>
              );
            }
          })()}
        </div>
      ) : activeTab === 'finance' ? (
        <div style={styles.financePanel}>
          <div style={styles.metricsGrid}>
            <div style={{ ...styles.metricCard, borderLeft: '4px solid #3b82f6' }}>
              <div style={styles.metricTitle}>Ventas del Mes (Bruto)</div>
              <div style={styles.metricValue}>${monthlySales.toLocaleString()}</div>
            </div>
            <div style={{ ...styles.metricCard, borderLeft: '4px solid #f59e0b' }}>
              <div style={styles.metricTitle}>Costos Totales</div>
              <div style={styles.metricValue}>${totalCost.toLocaleString()}</div>
            </div>
            <div style={{ ...styles.metricCard, borderLeft: '4px solid #10b981' }}>
              <div style={styles.metricTitle}>Ganancia Neta</div>
              <div style={{ ...styles.metricValue, color: '#10b981' }}>${netProfit.toLocaleString()}</div>
            </div>
            <div style={{ ...styles.metricCard, borderLeft: '4px solid #8b5cf6' }}>
              <div style={styles.metricTitle}>Kilos Vendidos</div>
              <div style={styles.metricValue}>{totalKilosSold} kg</div>
            </div>
          </div>

          <div style={styles.settingsGrid}>
            <div style={styles.generalCostsCard}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}><Settings size={20} /> Costos Globales</h3>
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
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setCatalogFilter('all')} style={{ ...styles.segmentBtn, background: catalogFilter === 'all' ? 'var(--color-primary)' : 'transparent', border: catalogFilter === 'all' ? 'none' : '1px solid var(--glass-border)', color: catalogFilter === 'all' ? '#fff' : 'var(--color-text-muted)' }}>Todos</button>
                <button onClick={() => setCatalogFilter('yerbas')} style={{ ...styles.segmentBtn, background: catalogFilter === 'yerbas' ? 'var(--color-primary)' : 'transparent', border: catalogFilter === 'yerbas' ? 'none' : '1px solid var(--glass-border)', color: catalogFilter === 'yerbas' ? '#fff' : 'var(--color-text-muted)' }}>Yerbas Puras</button>
                <button onClick={() => setCatalogFilter('blends')} style={{ ...styles.segmentBtn, background: catalogFilter === 'blends' ? 'var(--color-primary)' : 'transparent', border: catalogFilter === 'blends' ? 'none' : '1px solid var(--glass-border)', color: catalogFilter === 'blends' ? '#fff' : 'var(--color-text-muted)' }}>Yerbas Compuestas</button>
                <button onClick={() => setCatalogFilter('accesorios')} style={{ ...styles.segmentBtn, background: catalogFilter === 'accesorios' ? 'var(--color-primary)' : 'transparent', border: catalogFilter === 'accesorios' ? 'none' : '1px solid var(--glass-border)', color: catalogFilter === 'accesorios' ? '#fff' : 'var(--color-text-muted)' }}>Accesorios</button>
                <button onClick={() => setCatalogFilter('otros')} style={{ ...styles.segmentBtn, background: catalogFilter === 'otros' ? 'var(--color-primary)' : 'transparent', border: catalogFilter === 'otros' ? 'none' : '1px solid var(--glass-border)', color: catalogFilter === 'otros' ? '#fff' : 'var(--color-text-muted)' }}>Otros</button>
              </div>
              <div style={styles.catalogGrid}>
                {Object.keys(config.products)
                  .filter(key => catalogFilter === 'all' || (config.products[key].category || 'otros') === catalogFilter)
                  .map(key => {
                    const prod = config.products[key];
                    return (
                      <div key={key} style={{ ...styles.catalogItemCard, opacity: prod.isActive ? 1 : 0.5 }} onClick={() => setEditingProductKey(key)}>
                        <div style={styles.catalogItemImgContainer}>
                          <img src={prod.image || '/blend_bg.jpg'} alt={prod.name} style={styles.catalogItemImg} />
                          {!prod.isActive && <span style={{ ...styles.catalogItemBadge, position: 'absolute', top: 10, left: 10, background: '#555' }}>Pausado</span>}
                          {prod.discountPercentage > 0 && <span style={{ ...styles.catalogItemBadge, position: 'absolute', top: 10, right: 10, background: '#ef4444' }}>{prod.discountPercentage}% OFF</span>}
                        </div>
                        <div style={styles.catalogItemBody}>
                          <h4 style={styles.catalogItemTitle}>{prod.name}</h4>
                          <p style={styles.catalogItemCost}>Costo: ${prod.costo_produccion}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={styles.catalogItemBadge}>{prod.formats?.length || 0} formatos</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{prod.category || 'otros'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button onClick={addProduct} style={{ padding: '1rem 1.5rem', background: 'var(--glass-bg)', color: 'var(--color-text)', border: '2px dashed var(--color-text-muted)', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', flex: 1, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <PlusCircle size={20} /> Añadir Producto
                </button>
                <button onClick={saveConfig} style={{ padding: '1rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: '1px solid var(--color-primary-dark)', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', flex: 1, textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(74, 124, 46, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Save size={20} /> Guardar Cambios de Catálogo
                </button>
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
                <div style={{ ...styles.productCostCard, padding: '1rem' }}>
                  <button onClick={() => setEditingProductKey(null)} style={styles.backBtn}>← Volver al Listado</button>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                    <input
                      type="text"
                      value={prod.name}
                      onChange={(e) => updateProduct(key, 'name', e.target.value)}
                      style={{ ...styles.inputNoBorder, flex: '1 1 150px', minWidth: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', padding: '0' }}
                    />
                    <button onClick={() => removeProduct(key)} style={{ ...styles.deleteBtn, flexShrink: 0 }}>Eliminar</button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ ...styles.inputGroup, flex: '1 1 200px', minWidth: 0 }}>
                      <label style={{ color: 'var(--color-text)', fontWeight: 'bold', fontSize: '0.9rem' }}>URL de Imagen</label>
                      <input type="text" value={prod.image || ''} onChange={(e) => updateProduct(key, 'image', e.target.value)} style={{ ...styles.input, minWidth: 0 }} placeholder="/premium_full.jpg o https://..." />
                    </div>
                    <div style={{ ...styles.inputGroup, flex: '1 1 150px', minWidth: 0 }}>
                      <label style={{ color: 'var(--color-text)', fontWeight: 'bold', fontSize: '0.9rem' }}>Categoría</label>
                      <select value={prod.category || 'otros'} onChange={(e) => updateProduct(key, 'category', e.target.value)} style={{ ...styles.input, minWidth: 0 }}>
                        <option value="yerbas">Yerbas Puras</option>
                        <option value="blends">Yerbas Compuestas</option>
                        <option value="accesorios">Accesorios</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', background: 'var(--color-bg-light)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                    <div style={{ ...styles.inputGroup, flex: '1 1 150px', marginBottom: 0, minWidth: 0 }}>
                      <label style={{ fontWeight: 'bold', color: 'var(--color-text)', fontSize: '0.9rem' }}>Estado del Producto</label>
                      <select value={prod.isActive ? 'true' : 'false'} onChange={(e) => updateProduct(key, 'isActive', e.target.value === 'true')} style={{ ...styles.input, fontWeight: 'bold', color: prod.isActive ? '#10b981' : 'var(--color-text-muted)', minWidth: 0 }}>
                        <option value="true">🟢 Activo (Visible)</option>
                        <option value="false">⚪ Pausado (Oculto)</option>
                      </select>
                    </div>
                    <div style={{ ...styles.inputGroup, flex: '1 1 150px', marginBottom: 0, minWidth: 0 }}>
                      <label style={{ fontWeight: 'bold', color: '#ef4444' }}>% de Oferta (Descuento)</label>
                      <div style={styles.inputPrefix}>
                        <input type="number" min="0" max="100" value={prod.discountPercentage || 0} onChange={(e) => updateProduct(key, 'discountPercentage', Number(e.target.value))} style={{ ...styles.inputNoBorder, minWidth: 0 }} />
                        <span style={{ fontWeight: 'bold', color: '#ef4444' }}>% OFF</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={{ color: 'var(--color-text)', fontWeight: 'bold', fontSize: '0.9rem' }}>Descripción corta</label>
                    <textarea value={prod.description || ''} onChange={(e) => updateProduct(key, 'description', e.target.value)} style={{ ...styles.input, minHeight: '60px', minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={{ color: 'var(--color-text)', fontWeight: 'bold', fontSize: '0.9rem' }}>Costo Producción (por Unidad base o KG)</label>
                    <div style={styles.inputPrefix}>
                      <span>$</span>
                      <input type="number" value={prod.costo_produccion || 0} onChange={(e) => updateProduct(key, 'costo_produccion', Number(e.target.value))} style={styles.inputNoBorder} />
                    </div>
                  </div>

                  <div style={styles.formatBreakdown}>
                    <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Formatos y Precios
                      <button onClick={() => addFormat(key)} style={styles.addFormatBtn}>+ Agregar Formato</button>
                    </h4>

                    {prod.formats?.map((format, index) => {
                      let deductions = 0;
                      let calculationText = `Cálculo: $${format.price} - $${prod.costo_produccion} (Costo base)`;

                      if (format.id === '500g') {
                        deductions = (prod.costo_produccion / 2) + costoEnvase500;
                        calculationText = `Cálculo: $${format.price} - $${prod.costo_produccion / 2} (Costo/2) - $${costoEnvase500} (Envase)`;
                      } else if (format.id === '1kg') {
                        deductions = prod.costo_produccion + costoEnvase1kg;
                        calculationText = `Cálculo: $${format.price} - $${prod.costo_produccion} (Costo) - $${costoEnvase1kg} (Envase)`;
                      } else {
                        deductions = prod.costo_produccion;
                      }

                      const ganancia = format.price - deductions;

                      return (
                        <div key={format.id} style={styles.formatRow}>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', minWidth: 0 }}>
                            <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                              <label style={styles.smallLabel}>Nombre del Formato</label>
                              <input type="text" value={format.name} onChange={(e) => updateFormat(key, format.id, 'name', e.target.value)} style={{ ...styles.inputPrefixSmall, width: '100%', boxSizing: 'border-box', minWidth: 0 }} />
                            </div>
                            <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                              <label style={styles.smallLabel}>Precio Final</label>
                              <div style={{ display: 'flex', gap: '5px', alignItems: 'stretch', minWidth: 0 }}>
                                <div style={{ ...styles.inputPrefixSmall, flex: 1, boxSizing: 'border-box', minWidth: 0 }}>
                                  <span>$</span>
                                  <input type="number" value={format.price} onChange={(e) => updateFormat(key, format.id, 'price', Number(e.target.value))} style={{ ...styles.inputNoBorderSmall, width: '100%', boxSizing: 'border-box', minWidth: 0 }} />
                                </div>
                                <button onClick={() => removeFormat(key, format.id)} style={{ ...styles.deleteBtn, padding: '0 15px', margin: 0, height: 'auto', flexShrink: 0 }}>X</button>
                              </div>
                            </div>
                          </div>
                          <div style={styles.profitInfo}>
                            <strong style={{ color: 'var(--color-primary)' }}>Ganancia Neta: ${ganancia}</strong>
                            <span style={{ fontSize: '0.7rem' }}>{calculationText}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <button onClick={saveConfig} style={{ padding: '1rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: '1px solid var(--color-primary-dark)', borderRadius: '12px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', width: '100%', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(74, 124, 46, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Save size={20} /> Guardar Catálogo
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      ) : null}

      {/* Manual Order Modal */}
      {isManualOrderModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--color-bg-light)', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', position: 'relative', border: '1px solid var(--glass-border)' }}>
            <button onClick={() => setIsManualOrderModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--color-text-muted)" />
            </button>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={24} /> Crear Pedido Manual
            </h2>

            <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem 1.5rem' }}>
                <div style={styles.inputGroup}>
                  <label style={{ color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre del Cliente</label>
                  <input type="text" placeholder="Ej. Juan Pérez" value={manualOrderForm.customerName} onChange={(e) => setManualOrderForm(p => ({ ...p, customerName: e.target.value }))} style={{...styles.input, background: 'var(--color-bg-light)'}} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={{ color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email <span style={{fontWeight:'normal', color:'var(--color-text-muted)', textTransform:'none'}}>(Opcional)</span></label>
                  <input type="email" placeholder="Para vincular historial..." value={manualOrderForm.customerEmail} onChange={(e) => setManualOrderForm(p => ({ ...p, customerEmail: e.target.value }))} style={{...styles.input, background: 'var(--color-bg-light)'}} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={{ color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teléfono <span style={{fontWeight:'normal', color:'var(--color-text-muted)', textTransform:'none'}}>(Opcional)</span></label>
                  <input type="tel" placeholder="Ej. 1123456789" value={manualOrderForm.customerPhone} onChange={(e) => setManualOrderForm(p => ({ ...p, customerPhone: e.target.value }))} style={{...styles.input, background: 'var(--color-bg-light)'}} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={{ color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado Inicial</label>
                  <select value={manualOrderForm.status} onChange={(e) => setManualOrderForm(p => ({ ...p, status: e.target.value }))} style={{...styles.input, background: 'var(--color-bg-light)'}}>
                    {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--glass-border)', paddingBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Items del Pedido</h3>
            
            {manualOrderForm.items.map((item, index) => {
              const activeProducts = Object.keys(config.products).filter(k => config.products[k].isActive);
              const prod = config.products[item.productId];
              const formats = prod ? prod.formats : [];
              return (
                <div key={index} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                  <div style={{ flex: '2 1 200px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>Producto</label>
                    <select value={item.productId} onChange={(e) => handleManualItemChange(index, 'productId', e.target.value)} style={{ ...styles.input, width: '100%', padding: '0.5rem' }}>
                      {activeProducts.map(k => <option key={k} value={k}>{config.products[k].name}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>Formato</label>
                    <select value={item.formatId} onChange={(e) => handleManualItemChange(index, 'formatId', e.target.value)} style={{ ...styles.input, width: '100%', padding: '0.5rem' }}>
                      {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 80px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>Cantidad</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleManualItemChange(index, 'quantity', e.target.value)} style={{ ...styles.input, width: '100%', padding: '0.5rem' }} />
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>Precio Unit. ($)</label>
                    <input type="number" min="0" value={item.customPrice} onChange={(e) => handleManualItemChange(index, 'customPrice', e.target.value)} style={{ ...styles.input, width: '100%', padding: '0.5rem' }} />
                  </div>
                  <button onClick={() => removeManualItem(index)} style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}

            <button onClick={handleAddManualItem} style={{ padding: '1rem', background: 'var(--glass-bg)', color: 'var(--color-text)', border: '2px dashed var(--color-text-muted)', borderRadius: '8px', width: '100%', cursor: 'pointer', fontWeight: 'bold', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              + Agregar Producto
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total a cobrar:</span>
                <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-primary)' }}>
                  ${manualOrderForm.items.reduce((acc, item) => acc + (item.customPrice * item.quantity), 0)}
                </h3>
              </div>
              <button onClick={submitManualOrder} style={{ padding: '1rem 2rem', background: 'var(--color-primary)', color: '#fff', border: '1px solid var(--color-primary-dark)', borderRadius: '12px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(74, 124, 46, 0.3)', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusCircle size={20} /> Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}
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
    background: 'var(--glass-bg)',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--glass-border)',
  },
  metricTitle: {
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '0.5rem'
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--color-text)'
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
    background: 'var(--glass-bg)',
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-soft)',
  },
  infoBox: {
    background: 'rgba(128,128,128,0.1)',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    marginTop: '1rem',
    borderLeft: '4px solid var(--color-primary)'
  },
  productCostCard: {
    background: 'var(--glass-bg)',
    padding: '1.5rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-soft)',
  },
  inputPrefix: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '0 1rem',
    background: 'var(--color-bg-light)'
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
    background: 'var(--glass-bg)',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)'
  },
  formatRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--glass-border)'
  },
  smallLabel: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: 'var(--color-text)',
    display: 'block',
    marginBottom: '4px'
  },
  inputPrefixSmall: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--glass-border)',
    borderRadius: '6px',
    padding: '0 0.5rem',
    background: 'var(--color-bg-light)'
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
    background: 'var(--glass-bg)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-soft)',
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
    color: 'var(--color-text)',
    marginBottom: '0.2rem'
  },
  catalogItemCost: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
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
    color: 'var(--color-text)',
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
