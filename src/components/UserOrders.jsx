import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, Truck, Info, MessageCircle } from 'lucide-react';
import Navbar from './Navbar';

const UserOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() });
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const STATUS_MAP = {
    'pending': { label: 'Pendiente', color: '#f59e0b', icon: <Clock size={20} /> },
    'prepared': { label: 'Preparado', color: '#3b82f6', icon: <Package size={20} /> },
    'shipped': { label: 'Enviado', color: '#10b981', icon: <Truck size={20} /> },
    'closed': { label: 'Entregado', color: '#6b7280', icon: <CheckCircle size={20} /> }
  };

  const WHATSAPP_NUMBER = "2317472432";

  const handleAskOrder = (order) => {
    const date = order.createdAt?.toDate().toLocaleDateString('es-AR') || 'reciente';
    const msg = `Hola El Andino, quería consultar por el estado de mi pedido del ${date} por un total de $${order.totalPrice}. ¡Gracias!`;
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <p>Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center'}}>
          <Info size={48} color="var(--color-accent)" style={{marginBottom: '1rem'}} />
          <h2>Iniciá sesión para ver tus pedidos</h2>
          <p style={{color: 'var(--color-text-muted)', marginTop: '0.5rem'}}>Debes estar conectado para hacer el seguimiento de tus compras.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-light)'}}>
      <div style={{maxWidth: '800px', margin: '100px auto 4rem', padding: '0 20px', width: '100%', boxSizing: 'border-box'}}>
        <h1 style={{fontSize: '2rem', color: 'var(--color-accent)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <Package size={28} /> Mis Pedidos
        </h1>

        {orders.length === 0 ? (
          <div style={{background: 'var(--glass-bg)', padding: '3rem 2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--glass-border)'}}>
            <Package size={48} color="var(--color-text-muted)" style={{opacity: 0.5, marginBottom: '1rem'}} />
            <h3 style={{fontSize: '1.2rem', color: 'var(--color-text)', marginBottom: '0.5rem'}}>Aún no tenés pedidos</h3>
            <p style={{color: 'var(--color-text-muted)'}}>Cuando realices una compra, aparecerá aquí para que puedas hacerle seguimiento.</p>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {orders.map(order => {
              const statusInfo = STATUS_MAP[order.status || 'pending'];
              return (
                <div key={order.id} style={{background: 'var(--glass-bg)', borderRadius: '16px', border: `1px solid var(--glass-border)`, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                  <div style={{padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                    <div>
                      <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block'}}>FECHA</span>
                      <strong style={{color: 'var(--color-text)'}}>{order.createdAt?.toDate().toLocaleDateString('es-AR') || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block'}}>TOTAL</span>
                      <strong style={{color: 'var(--color-text)'}}>${order.totalPrice}</strong>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', background: statusInfo.color, color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold'}}>
                      {statusInfo.icon} {statusInfo.label}
                    </div>
                  </div>
                  
                  <div style={{padding: '1.5rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem'}}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.8rem'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span style={{background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>{item.quantity}x</span>
                            <span style={{color: 'var(--color-text)'}}>{item.name} <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>({item.format === '500g' ? 'Medio Kilo' : item.format === '1kg' ? '1 Kilo' : 'A Granel'})</span></span>
                          </div>
                          <strong style={{color: 'var(--color-text)'}}>${item.formattedPrice * item.quantity}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                      <button 
                        onClick={() => handleAskOrder(order)}
                        style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'}}
                        onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                      >
                        <MessageCircle size={18} /> Consultar Estado
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
