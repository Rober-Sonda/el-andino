import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Send, User, Leaf, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const CheckoutModal = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    generateWhatsAppLink,
    cart,
    totalPrice,
    totalKilos,
    isFreeShipping,
    currentOrderId,
    setCurrentOrderId
  } = useCart();
  const { currentUser, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async () => {
    if(cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      let orderId = currentOrderId;
      let createNew = false;
      
      const orderData = {
        customerName: currentUser.displayName,
        customerEmail: currentUser.email,
        customerId: currentUser.uid,
        items: cart,
        totalPrice,
        totalKilos,
        isFreeShipping,
        status: 'pending',
        updatedAt: serverTimestamp()
      };

      if (orderId) {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          if (orderSnap.data().status !== 'pending') {
            createNew = true;
          }
        } else {
          createNew = true;
        }
      } else {
        createNew = true;
      }

      if (createNew) {
        const newOrderRef = doc(collection(db, 'orders'));
        orderId = newOrderRef.id;
        orderData.createdAt = serverTimestamp();
        setCurrentOrderId(orderId);
        await setDoc(newOrderRef, orderData);
      } else {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, orderData, { merge: true });
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }

    setIsSubmitting(false);
    
    // Redirect to whatsapp
    const link = generateWhatsAppLink(currentUser.displayName);
    window.location.href = link;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={() => setIsCheckoutOpen(false)}></div>
      <div style={styles.modal} className="glass">
        <div style={styles.header}>
          <h2 style={styles.title}>Finalizar Pedido</h2>
          <button style={styles.closeBtn} onClick={() => setIsCheckoutOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {!currentUser ? (
          <div style={styles.loginPrompt}>
            <User size={48} color="var(--color-accent)" style={{marginBottom: '1rem'}} />
            <h3 style={{fontFamily: 'var(--font-serif)', fontSize:'1.5rem', marginBottom:'0.5rem', color: 'var(--color-primary)'}}>Registro Necesario</h3>
            <p style={styles.instruction}>
              Para poder procesar y preparar tu pedido de manera segura, te pedimos que inicies sesión con tu cuenta de Google.
            </p>
            <button onClick={loginWithGoogle} style={{...styles.rusticSubmitBtn, backgroundColor: '#4285F4', marginTop: '1.5rem', color: '#fff', border: 'none'}}>
              Continuar con Google
            </button>
          </div>
        ) : (
          <div style={styles.content}>
            <div style={styles.summaryBox}>
              <h3 style={styles.summaryTitle}><Leaf size={20} color="var(--color-accent)" style={{marginRight: '8px', verticalAlign: 'middle'}}/>Remito de Campo</h3>
              <div className="summary-scroll" style={styles.summaryScroll}>
                {cart.map((item, idx) => (
                  <div key={idx} style={styles.summaryItem}>
                    <span style={styles.summaryItemQty}>{item.quantity}x</span>
                    <span style={styles.summaryItemName}>{item.name.replace('Blend: ', '')} {item.format === '500g' ? '(½kg)' : item.format === '1kg' ? '(1kg)' : '(Granel)'}</span>
                    <span style={styles.summaryItemPrice}>${item.formattedPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div style={styles.summaryDivider}></div>
              <div style={styles.summaryTotalRow}>
                <span>Total ({totalKilos}kg):</span>
                <span>${totalPrice}</span>
              </div>
              {isFreeShipping && (
                <div style={styles.freeShippingBadge}>✨ ¡Envío Gratis Incluido!</div>
              )}
            </div>

            <p style={styles.instruction}>
              ¡Hola, <strong>{currentUser.displayName}</strong>! Revisa tu cosecha y envíala a nuestro equipo. Te abriremos un chat de WhatsApp para coordinar el pago y la tranquera de entrega.
            </p>
            <button onClick={handleSubmit} disabled={isSubmitting} className="rustic-submit-btn" style={{...styles.rusticSubmitBtn, opacity: isSubmitting ? 0.7 : 1}}>
              {isSubmitting ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
              {isSubmitting ? 'Procesando...' : 'Enviar y Coordinar al WhatsApp'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(5px)',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'var(--color-bg-light)',
    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
    borderRadius: '16px',
    zIndex: 2001,
    overflow: 'hidden',
    animation: 'zoomIn 0.3s forwards',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
  },
  header: {
    padding: '2rem 2rem 1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.8rem',
    color: 'var(--color-primary-dark)',
  },
  closeBtn: {
    color: 'var(--color-text)',
    padding: '0.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  },
  loginPrompt: {
    padding: '0 2rem 3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  content: {
    padding: '1.5rem 2rem 2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  summaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    border: '1px dashed var(--color-primary)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
  },
  summaryTitle: {
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-primary-dark)',
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '2px'
  },
  summaryScroll: {
    maxHeight: '150px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    paddingRight: '0.5rem'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: 'var(--color-text)',
    gap: '10px'
  },
  summaryItemQty: {
    fontWeight: 'bold',
    color: 'var(--color-accent)',
    width: '25px'
  },
  summaryItemName: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  summaryItemPrice: {
    fontWeight: 'bold',
    color: 'var(--color-text-muted)'
  },
  summaryDivider: {
    height: '1px',
    borderTop: '1px dashed rgba(74, 124, 46, 0.3)',
    margin: '0.5rem 0'
  },
  summaryTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.3rem',
    fontFamily: 'var(--font-serif)',
    fontWeight: 'bold',
    color: 'var(--color-primary-dark)'
  },
  freeShippingBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.5rem',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: '800',
    marginTop: '0.5rem'
  },
  instruction: {
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    textAlign: 'center'
  },
  rusticSubmitBtn: {
    width: '100%',
    padding: '1.2rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '1.1rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(74, 124, 46, 0.3)',
    transition: 'all 0.2s ease',
    border: '1px solid var(--color-primary-dark)',
    cursor: 'pointer'
  }
};

// Inject keyframes
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    .summary-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .summary-scroll::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
    }
    .summary-scroll::-webkit-scrollbar-thumb {
      background: rgba(74, 124, 46, 0.3);
      border-radius: 4px;
    }
    .rustic-submit-btn:hover {
      background-color: var(--color-primary-dark) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74, 124, 46, 0.5) !important;
    }
    [data-theme='dark'] .summary-scroll::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
    }
    [data-theme='dark'] .summary-scroll::-webkit-scrollbar-thumb {
      background: var(--color-accent);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default CheckoutModal;
