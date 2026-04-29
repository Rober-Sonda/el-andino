import React, { useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'rober.junin@gmail.com';

const AdminNotificationListener = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.email !== ADMIN_EMAIL) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Listen to the most recent order to trigger a notification
    // We order by createdAt desc, limit 1.
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    let isFirstLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad) {
        isFirstLoad = false;
        return; // Don't notify on initial load
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const order = change.doc.data();
          
          // Play sound
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play blocked:', e));
          } catch (e) {}

          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nuevo Pedido - El Andino', {
              body: `¡${order.customerName} hizo un pedido por $${order.totalPrice}!`,
              icon: '/favicon.ico' // Assuming there is a favicon
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  return null; // Invisible component
};

export default AdminNotificationListener;
