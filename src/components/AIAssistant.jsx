import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const AIAssistant = ({ orders, config, expenses }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: '¡Hola! Soy tu Analista de Negocios de El Andino impulsado por IA. Tengo acceso a tu inventario, ventas y costos. ¿Qué te gustaría saber hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSystemContext = () => {
    const dataContext = {
      config: config,
      gastos: expenses.map(e => ({ fecha: e.date?.toDate?.()?.toLocaleDateString('es-AR') || 'fecha desconocida', descripcion: e.description, monto: e.amount, categoria: e.category })),
      pedidos: orders.map(o => ({ 
        id: o.id, 
        fecha: o.createdAt?.toDate?.()?.toLocaleDateString('es-AR') || 'fecha desconocida', 
        estado: o.status, 
        total: o.totalPrice, 
        items: o.items 
      }))
    };

    return `Eres el Analista de Negocios e Inventario de 'El Andino', una marca de yerba mate uruguaya de especialidad en Argentina.
El dueño del negocio te está consultando sobre el estado de la empresa.
Debes responder de manera profesional, directa, clara y amigable.
Utiliza formato Markdown (negritas, listas) para estructurar tus respuestas y hacerlas fáciles de leer.
Si te piden cálculos (ej. ganancias, costos, proyecciones), usa los datos proporcionados a continuación.
Si no encuentras el dato exacto, da la mejor estimación posible y acláralo.

AQUÍ ESTÁN LOS DATOS ACTUALES DEL NEGOCIO EN FORMATO JSON:
${JSON.stringify(dataContext)}

INSTRUCCIONES ADICIONALES:
- Las materias primas (yerbas) tienen stock medido en "kilos" (kg).
- Las bolsas y etiquetas se miden en unidades (un).
- Si el usuario pregunta qué tiene que comprar, revisa el 'currentStock' frente al 'minStock' en el objeto config.materials.
- Calcula ganancias restando los costos (costo_produccion, costo de empaques, gastos operativos) a los ingresos totales de los pedidos ('closed' o 'shipped' o 'prepared').
`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No se encontró la API Key de Gemini. Asegúrate de tener VITE_GEMINI_API_KEY en tu archivo .env");
      }

      const systemInstruction = generateSystemContext();
      
      const chatHistory = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      // Add the new user message to history
      chatHistory.push({ role: 'user', parts: [{ text: userText }] });

      const payload = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: chatHistory,
        generationConfig: {
          temperature: 0.2, // Low temperature for more analytical/factual responses
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Error en la API de Gemini");
      }

      const data = await response.json();
      const modelText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta clara. ¿Puedes replantear tu pregunta?";
      
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ Error de conexión: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', 
      background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)',
      overflow: 'hidden', position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem', borderBottom: '1px solid var(--glass-border)', 
        display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(20, 20, 20, 0.4)'
      }}>
        <div style={{background: 'var(--color-primary)', padding: '10px', borderRadius: '12px'}}>
          <Sparkles size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{margin: 0, fontSize: '1.2rem', color: 'var(--color-text)'}}>Analista de Negocios IA</h2>
          <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Conectado en tiempo real a tus datos</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex', gap: '12px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%'
          }}>
            {msg.role === 'model' && (
              <div style={{background: 'var(--color-accent)', minWidth: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Bot size={20} color="#fff" />
              </div>
            )}
            
            <div style={{
              background: msg.role === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              padding: '1rem 1.2rem',
              borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
              border: msg.role === 'model' ? '1px solid var(--glass-border)' : 'none',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div style={{background: 'var(--color-text-muted)', minWidth: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <User size={20} color="#fff" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{display: 'flex', gap: '12px', alignSelf: 'flex-start'}}>
            <div style={{background: 'var(--color-accent)', minWidth: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Bot size={20} color="#fff" />
            </div>
            <div style={{padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px 16px 16px 0', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Loader2 size={18} className="spin" color="var(--color-text-muted)" />
              <span style={{color: 'var(--color-text-muted)'}}>Analizando datos...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1.2rem', borderTop: '1px solid var(--glass-border)', 
        background: 'rgba(20, 20, 20, 0.4)'
      }}>
        <div style={{
          display: 'flex', gap: '10px', background: 'var(--color-bg)', 
          padding: '8px', borderRadius: '16px', border: '1px solid var(--glass-border)'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntame sobre tus ventas, costos o inventario... (Enter para enviar)"
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--color-text)',
              padding: '8px', resize: 'none', minHeight: '44px', maxHeight: '120px',
              fontFamily: 'inherit', outline: 'none'
            }}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              background: input.trim() && !isLoading ? 'var(--color-primary)' : 'var(--color-bg-light)',
              color: input.trim() && !isLoading ? '#fff' : 'var(--color-text-muted)',
              border: 'none', borderRadius: '12px', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            <Send size={20} />
          </button>
        </div>
        <div style={{textAlign: 'center', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.7}}>
          <AlertCircle size={12} color="var(--color-text-muted)" />
          <span style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>La IA tiene acceso de lectura a tus datos actuales para dar respuestas precisas.</span>
        </div>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AIAssistant;
