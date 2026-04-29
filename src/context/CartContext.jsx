import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  const clearCart = () => {
    setCart([]);
    setCurrentOrderId(null);
  };
  
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('el_andino_user');
    return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
  });

  const DEFAULT_PRICING = {
    products: {
      'premium': { costo_kg: 3500, prices: { '500g': 4000, '1kg': 7500, 'granel': 7500, 'granel_mayorista': 6000 } },
      'ahumada': { costo_kg: 4000, prices: { '500g': 4000, '1kg': 7500, 'granel': 7500, 'granel_mayorista': 6000 } },
      'uruguaya-despalada': { costo_kg: 3800, prices: { '500g': 4000, '1kg': 7500, 'granel': 7500, 'granel_mayorista': 6000 } },
      'uruguaya-molida': { costo_kg: 3200, prices: { '500g': 4000, '1kg': 7500, 'granel': 7500, 'granel_mayorista': 6000 } },
      'blend': { costo_kg: 4500, prices: { '500g': 4500, '1kg': 8500, 'granel': 8500, 'granel_mayorista': 7000 } }
    },
    general: {
      costo_paquete_500g: 150,
      costo_paquete_1kg: 200,
      costo_etiqueta: 50,
      costo_distribucion: 1000
    }
  };

  const [pricingConfig, setPricingConfig] = useState(DEFAULT_PRICING);

  useEffect(() => {
    localStorage.setItem('el_andino_user', JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const docRef = doc(db, 'config', 'admin');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().products) {
          setPricingConfig(snap.data());
        }
      } catch (e) {
        console.error("No se pudo cargar la configuración de precios dinámica. Usando por defecto.", e);
      }
    };
    fetchPricing();
  }, []);

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

  const totalKilos = cart.reduce((acc, item) => {
    if (item.format === '500g') return acc + (item.quantity * 0.5);
    if (item.format === '1kg' || item.format === 'granel') return acc + item.quantity;
    return acc;
  }, 0);

  const getPriceForProduct = (productId, format, totalKilosCart) => {
    // Determine the product key (blends are custom ids, so fallback to 'blend' or 'premium')
    let productKey = productId;
    if (productId?.startsWith('blend-')) productKey = 'blend';
    if (!pricingConfig.products[productKey]) productKey = 'premium'; // safe fallback
    
    const prodConfig = pricingConfig.products[productKey];
    if (!prodConfig?.prices) return 7500; // ultimate fallback

    if (format === '500g') return prodConfig.prices['500g'] || 4000;
    if (format === '1kg') return prodConfig.prices['1kg'] || 7500;
    if (format === 'granel') {
       const isWholesale = totalKilosCart > 40;
       return isWholesale ? (prodConfig.prices['granel_mayorista'] || 6000) : (prodConfig.prices['granel'] || 7500);
    }
    return prodConfig.prices['1kg'] || 7500;
  };

  const calculatedCart = cart.map(item => {
    const computedPrice = getPriceForProduct(item.id, item.format, totalKilos);
    return { ...item, formattedPrice: computedPrice };
  });

  const totalPrice = calculatedCart.reduce((acc, item) => acc + (item.formattedPrice * item.quantity), 0);

  const isFreeShipping = totalKilos >= 40;

  const generateWhatsAppLink = (userName) => {
    const WHATSAPP_NUMBER = "2317472432";
    
    let message = `*¡Hola El Andino!* 🧉🌿\n\nSoy *${userName || 'un cliente'}* y quiero hacer un pedido desde su tienda:\n\n`;
    
    calculatedCart.forEach(item => {
      let variantText = item.format === '500g' ? '½ Kilo' : item.format === '1kg' ? '1 Kilo' : 'A Granel (Kilos)';
      let profileText = item.profile ? ` [Perfil: ${item.profile}]` : '';
      message += `• ${item.quantity} x ${item.name}${profileText} (${variantText}) - $${item.formattedPrice * item.quantity}\n`;
    });
    
    message += `\n*Suma de Kilos: ${totalKilos}kg*\n`;
    message += `*Total estimado: $${totalPrice}*\n`;
    if (isFreeShipping) {
      message += `🎁 *¡Califica para Envío Gratis (>40kg)!*\n`;
    }
    
    message += `\n¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  };

  return (
    <CartContext.Provider value={{
      cart: calculatedCart,
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
      generateWhatsAppLink,
      currentOrderId,
      setCurrentOrderId,
      clearCart,
      pricingConfig,
      getPriceForProduct
    }}>
      {children}
    </CartContext.Provider>
  );
};
