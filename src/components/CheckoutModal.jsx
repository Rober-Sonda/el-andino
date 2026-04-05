import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Send, User } from 'lucide-react';

const CheckoutModal = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    userData, 
    setUserData, 
    generateWhatsAppLink,
    cart 
  } = useCart();
  const { currentUser, loginWithGoogle } = useAuth();

  if (!isCheckoutOpen) return null;

  const handleSubmit = () => {
    if(cart.length === 0) return;
    
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
            <button onClick={loginWithGoogle} style={{...styles.submitBtn, backgroundColor: '#4285F4', marginTop: '1.5rem'}}>
              Continuar con Google
            </button>
          </div>
        ) : (
          <div style={styles.form}>
            <p style={styles.instruction}>
              ¡Hola, <strong>{currentUser.displayName}</strong>! Haz clic en el botón para enviar tu pedido directamente por WhatsApp y coordinar el pago y la entrega.
            </p>
            <button onClick={handleSubmit} style={styles.submitBtn}>
              <Send size={20} />
              Enviar a WhatsApp
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
    maxWidth: '500px',
    backgroundColor: 'var(--color-bg-light)',
    borderRadius: '24px',
    zIndex: 2001,
    overflow: 'hidden',
    animation: 'zoomIn 0.3s forwards',
  },
  header: {
    padding: '2rem 2rem 1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: 'var(--color-primary-dark)',
  },
  closeBtn: {
    color: 'var(--color-text)',
    padding: '0.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  loginPrompt: {
    padding: '0 2rem 3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  form: {
    padding: '0 2rem 2rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  instruction: {
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '0.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  input: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    marginTop: '1rem',
    width: '100%',
    padding: '1.2rem',
    backgroundColor: '#25D366', /* WhatsApp Green */
    color: '#fff',
    fontWeight: '800',
    fontSize: '1.2rem',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
    transition: 'transform 0.2s, background-color 0.2s',
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
  `;
  document.head.appendChild(styleSheet);
}

export default CheckoutModal;
