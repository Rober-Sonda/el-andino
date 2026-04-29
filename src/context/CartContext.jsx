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

  const DEFAULT_CATALOG = {
    'premium': {
      id: 'premium',
      name: 'Yerba Premium',
      category: 'yerbas',
      description: 'Estacionada naturalmente por 24 meses. Suave, duradera y de molienda equilibrada. Ideal para largas rondas.',
      image: '/premium_full.jpg',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 3500,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: '1kg', name: '1 Kilo', price: 7500 },
        { id: 'granel', name: 'A Granel', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    },
    'ahumada': {
      id: 'ahumada',
      name: 'Yerba Ahumada',
      category: 'yerbas',
      description: 'Secada con maderas seleccionadas (Barbacuá). Un sabor intenso, profundo y con carácter de monte.',
      image: '/ahumada_full.jpg',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 4000,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: '1kg', name: '1 Kilo', price: 7500 },
        { id: 'granel', name: 'A Granel', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    },
    'uruguaya-despalada': {
      id: 'uruguaya-despalada',
      name: 'Uruguaya Despalada',
      category: 'yerbas',
      description: 'Corte fino sin palo, pura hoja. Estilo canario para un mate fuerte, espumoso y de sabor prologando.',
      image: '/despalada_full.jpg',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 3800,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: '1kg', name: '1 Kilo', price: 7500 },
        { id: 'granel', name: 'A Granel', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    },
    'uruguaya-molida': {
      id: 'uruguaya-molida',
      name: 'Uruguaya Molida',
      category: 'yerbas',
      description: 'Tradicional molienda fina con equilibrio perfecto. La clásica y elegante elección oriental.',
      image: '/molida_full.jpg',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 3200,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: '1kg', name: '1 Kilo', price: 7500 },
        { id: 'granel', name: 'A Granel', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    },
    'blend-herencia': {
      id: 'blend-herencia',
      name: 'Blend: Herencia del Sembrador',
      category: 'blends',
      description: 'Equilibrada. Una combinación artesanal diseñada para verdaderos apasionados. Estacionada naturalmente con hoja uruguaya.',
      image: '/kraft_bag.png',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 3500,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    },
    'blend-fuego': {
      id: 'blend-fuego',
      name: 'Blend: Fuego del Andino',
      category: 'blends',
      description: 'Intensa. Carácter de monte, secada con leña bajo el proceso Barbacuá. Intensa y maderera con un toque de reserva.',
      image: '/kraft_bag.png',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 3800,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    },
    'blend-charrua': {
      id: 'blend-charrua',
      name: 'Blend: Tradición Charrúa',
      category: 'blends',
      description: 'Clásica. Molienda fina perfecta. Rendimiento impecable para el cebador experimentado oriental.',
      image: '/kraft_bag.png',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 3400,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    },
    'blend-alma': {
      id: 'blend-alma',
      name: 'Blend: Alma de Monte',
      category: 'blends',
      description: 'Suave y Compleja. Pura hoja uruguaya, estilo canario para un mate fuerte, espumoso y prolongado que no perdona.',
      image: '/kraft_bag.png',
      isOrganic: true,
      isSinTacc: true,
      isAntiacid: true,
      costo_produccion: 3900,
      formats: [
        { id: '500g', name: '½ Kilo', price: 4000 },
        { id: 'granel', name: 'A Granel (Mín. 5Kg)', price: 7500 },
        { id: 'granel_mayorista', name: 'Mayorista >40kg', price: 6000 }
      ]
    }
  };

  const DEFAULT_PRICING = {
    products: DEFAULT_CATALOG,
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
          const dbData = snap.data();
          const mergedProducts = { ...DEFAULT_CATALOG }; // Keep defaults for missing items

          Object.keys(dbData.products).forEach(key => {
            const dbProd = dbData.products[key];
            const defProd = DEFAULT_CATALOG[key] || {};
            
            // Si el producto en DB tiene 'prices' (estructura vieja), lo convertimos a formats array
            let finalFormats = dbProd.formats;
            if (!finalFormats && dbProd.prices) {
               finalFormats = [
                 { id: '500g', name: '½ Kilo', price: dbProd.prices['500g'] || 4000 },
                 { id: '1kg', name: '1 Kilo', price: dbProd.prices['1kg'] || 7500 },
                 { id: 'granel', name: 'A Granel', price: dbProd.prices['granel'] || 7500 },
                 { id: 'granel_mayorista', name: 'Mayorista >40kg', price: dbProd.prices['granel_mayorista'] || 6000 }
               ];
            }

            mergedProducts[key] = {
              id: key,
              name: dbProd.name || defProd.name || 'Producto Nuevo',
              category: dbProd.category || defProd.category || 'otros',
              description: dbProd.description || defProd.description || '',
              image: dbProd.image || defProd.image || '/blend_bg.jpg',
              isOrganic: dbProd.isOrganic ?? defProd.isOrganic ?? false,
              isSinTacc: dbProd.isSinTacc ?? defProd.isSinTacc ?? false,
              isAntiacid: dbProd.isAntiacid ?? defProd.isAntiacid ?? false,
              costo_produccion: dbProd.costo_produccion ?? dbProd.costo_kg ?? defProd.costo_produccion ?? 3500,
              formats: finalFormats || defProd.formats || [{id: 'unidad', name: '1 Unidad', price: 5000}]
            };
          });

          setPricingConfig({
            general: { ...DEFAULT_PRICING.general, ...dbData.general },
            products: mergedProducts
          });
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

  const getPriceForProduct = (productId, formatId, totalKilosCart) => {
    let productKey = productId;
    
    // We don't override custom dynamic blends starting with 'blend-' unless it exists in config
    if (!pricingConfig.products[productKey]) {
      // Dynamic fallback for generated blends not stored in config
      if (productKey?.startsWith('blend-')) {
         return formatId === 'granel' && totalKilosCart > 40 ? 6000 : (formatId === '500g' ? 4000 : 7500);
      }
      return 7500;
    }
    
    const prodConfig = pricingConfig.products[productKey];
    if (!prodConfig?.formats) return 7500;

    const formatObj = prodConfig.formats.find(f => f.id === formatId);
    if (!formatObj) return prodConfig.formats[0]?.price || 7500;

    if (formatId === 'granel') {
       const isWholesale = totalKilosCart > 40;
       if (isWholesale) {
          const wholesaleFormat = prodConfig.formats.find(f => f.id === 'granel_mayorista');
          if (wholesaleFormat) return wholesaleFormat.price;
       }
    }
    return formatObj.price;
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
      getPriceForProduct,
      catalog: Object.values(pricingConfig.products)
    }}>
      {children}
    </CartContext.Provider>
  );
};
