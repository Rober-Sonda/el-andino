import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('el_andino_user');
    return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
  });

  useEffect(() => {
    localStorage.setItem('el_andino_user', JSON.stringify(userData));
  }, [userData]);

  const addToCart = (product, format, formattedPrice, quantity) => {
    const cartItemId = `${product.id}-${format}`;
    
    // Safety check for bulk minimum
    if (format === 'granel' && quantity > 0 && quantity < 5) {
       quantity = 5;
    }

    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item);
      }
      return [...prev, { ...product, cartItemId, format, formattedPrice, quantity }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const getQuantity = (productId, format) => {
    const cartItemId = `${productId}-${format}`;
    const item = cart.find(i => i.cartItemId === cartItemId);
    return item ? item.quantity : 0;
  };

  // Total distinct items in cart UI
  const totalItemsCount = cart.length;

  // Calculate total kilograms in the cart
  const totalKilos = cart.reduce((acc, item) => {
    if (item.format === '500g') return acc + (item.quantity * 0.5);
    if (item.format === '1kg' || item.format === 'granel') return acc + item.quantity;
    return acc;
  }, 0);

  const totalPrice = cart.reduce((acc, item) => acc + (item.formattedPrice * item.quantity), 0);

  const isFreeShipping = totalKilos >= 40;

  const generateWhatsAppLink = (checkoutData) => {
    const WHATSAPP_NUMBER = "2317472432";
    
    let message = `*¡Hola El Andino!* 🧉🌿\n\nQuiero hacer un pedido desde su tienda:\n\n`;
    
    cart.forEach(item => {
      let variantText = item.format === '500g' ? '½ Kilo' : item.format === '1kg' ? '1 Kilo' : 'A Granel (Kilos)';
      message += `• ${item.quantity} x ${item.name} (${variantText}) - $${item.formattedPrice * item.quantity}\n`;
    });
    
    message += `\n*Suma de Kilos: ${totalKilos}kg*\n`;
    message += `*Total estimado: $${totalPrice}*\n`;
    if (isFreeShipping) {
      message += `🎁 *¡Califica para Envío Gratis (>40kg)!*\n`;
    }
    message += `\n*Mis Datos:*\n`;
    message += `👤 Nombre: ${checkoutData.name}\n`;
    message += `📍 Dirección: ${checkoutData.address}\n`;
    if(checkoutData.notes) {
      message += `📝 Notas: ${checkoutData.notes}\n`;
    }
    
    message += `\n¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      getQuantity,
      totalItemsCount,
      totalKilos,
      totalPrice,
      isFreeShipping,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      userData,
      setUserData,
      generateWhatsAppLink
    }}>
      {children}
    </CartContext.Provider>
  );
};
