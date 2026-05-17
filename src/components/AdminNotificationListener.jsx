import React, { useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'rober.junin@gmail.com';

const playSoftPop = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Un sonido de "gota" o "pop" muy suave y agradable
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime); // Volumen muy bajo y sutil
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {
    console.log('Audio contextual bloqueado:', e);
  }
};

const AdminNotificationListener = () => {
  const { currentUser } = useAuth();
  // Usamos una variable estática fuera del effect o un ref para controlar el spam de sonidos
  const lastSoundTimeRef = React.useRef(0);

  useEffect(() => {
    if (currentUser?.email !== ADMIN_EMAIL) return;

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(50) // Escuchamos los últimos para poder agruparlos si entran varios
    );

    let isFirstLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad) {
        isFirstLoad = false;
        return; 
      }

      const newOrders = snapshot.docChanges().filter(change => change.type === 'added');
      
      if (newOrders.length > 0) {
        const now = Date.now();
        // Solo reproducimos sonido y mandamos notificación si pasaron al menos 8 segundos
        // Esto evita el spam masivo si entran 100 pedidos de golpe
        if (now - lastSoundTimeRef.current > 8000) {
          lastSoundTimeRef.current = now;
          
          playSoftPop();

          if ('Notification' in window && Notification.permission === 'granted') {
            if (newOrders.length === 1) {
              const order = newOrders[0].doc.data();
              new Notification('Nuevo Pedido - El Andino', {
                body: `¡${order.customerName} hizo un pedido por $${order.totalPrice}!`,
                icon: '/favicon.ico'
              });
            } else {
              new Notification('Nuevos Pedidos Masivos - El Andino', {
                body: `¡Acaban de ingresar ${newOrders.length} pedidos nuevos!`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  return null;
};

export default AdminNotificationListener;
