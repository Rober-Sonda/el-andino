import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const AIAssistant = ({ orders, config, expenses }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: '¡Hola! Soy tu Analista de Negocios de El Andino impulsado por IA. Tengo acceso a tu inventario, ventas y costos. ¿Qué te gustaría saber hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'es-AR';
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        if(event.error === 'not-allowed') {
          alert("Por favor permite el acceso al micrófono en tu navegador para usar esta función.");
        } else if (event.error === 'network') {
          alert("Error de red del micrófono. Si estás usando navegadores como Brave, Opera o Chromium, estos suelen bloquear el servicio gratuito de voz de Google. Por favor, inténtalo desde Google Chrome oficial.");
        } else if (event.error === 'no-speech') {
          console.warn("No se detectó voz. Se apagó el micrófono automáticamente.");
          // No mostramos un alert invasivo aquí porque es normal que se apague si hay silencio prolongado
        } else {
          console.error('Error de micrófono:', event.error);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    // Cargar voces para que estén listas
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    
    // Cleanup
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta el reconocimiento de voz nativo. Por favor usa Chrome o Safari.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    // Limpiar markdown básico para no leer asteriscos ni hashtags
    const cleanText = text.replace(/[*_#`]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-AR'; // Español de Argentina o genérico
    utterance.rate = 1.05; 
    
    const voices = window.speechSynthesis.getVoices();
    // Intentar buscar una buena voz en español
    const spanishVoice = voices.find(v => v.lang.includes('es') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Sabina')));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

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
Debes responder de manera muy profesional, super clara y directa.
Tus respuestas van a ser leídas en voz alta por el navegador, así que usa oraciones cortas y un tono natural y conversacional. 
Evita usar caracteres especiales raros, usa números y letras.
AQUÍ ESTÁN LOS DATOS ACTUALES DEL NEGOCIO EN FORMATO JSON:
${JSON.stringify(dataContext)}

INSTRUCCIONES ADICIONALES:
- Las materias primas (yerbas) tienen stock medido en "kilos" (kg).
- Las bolsas y etiquetas se miden en unidades (un).
- Si te piden calcular ganancias, resta los costos de los ingresos de pedidos.
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
      
      chatHistory.push({ role: 'user', parts: [{ text: userText }] });

      const payload = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: chatHistory,
        generationConfig: {
          temperature: 0.2,
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
      const modelText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude procesar la solicitud.";
      
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      speakText(modelText);
      
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMsg = `Error de conexión: ${error.message}`;
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
      speakText("Hubo un error de conexión.");
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
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', 
      background: 'rgba(25, 25, 30, 0.65)', backdropFilter: 'blur(16px)', 
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden', position: 'relative'
    }}>
      {/* Header Premium */}
      <div style={{
        padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(20,20,30,0.6))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', 
            padding: '10px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{margin: 0, fontSize: '1.3rem', color: '#fff', fontWeight: 'bold'}}>Analista de Negocios IA</h2>
            <span style={{fontSize: '0.85rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px'}}>
              <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#10b981', boxShadow: '0 0 8px #10b981'}}></div> 
              Sistema Online y Listo
            </span>
          </div>
        </div>
        
        {/* Toggle de Voz */}
        <button 
          onClick={() => {
             setVoiceEnabled(!voiceEnabled);
             if (window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          title={voiceEnabled ? "Desactivar respuestas por voz" : "Activar respuestas por voz"}
          style={{
            background: voiceEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${voiceEnabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: voiceEnabled ? '#10b981' : '#aaa',
            padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
          }}
        >
          {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span style={{fontSize:'0.85rem', fontWeight:'bold'}}>{voiceEnabled ? 'Voz Activada' : 'Voz Mutada'}</span>
        </button>
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
              <div style={{background: 'linear-gradient(135deg, #1f2937, #111827)', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)'}}>
                <Bot size={22} color="var(--color-primary)" />
              </div>
            )}
            
            <div style={{
              background: msg.role === 'user' ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'rgba(30, 30, 40, 0.7)',
              backdropFilter: msg.role === 'model' ? 'blur(10px)' : 'none',
              color: '#fff',
              padding: '1.2rem 1.5rem',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              border: msg.role === 'model' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              fontSize: '0.95rem'
            }}>
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div style={{background: 'rgba(255,255,255,0.1)', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)'}}>
                <User size={20} color="#fff" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{display: 'flex', gap: '12px', alignSelf: 'flex-start'}}>
            <div style={{background: 'linear-gradient(135deg, #1f2937, #111827)', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)'}}>
              <Bot size={22} color="var(--color-primary)" />
            </div>
            <div style={{padding: '1rem 1.5rem', background: 'rgba(30,30,40,0.7)', borderRadius: '20px 20px 20px 4px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Loader2 size={18} className="spin" color="var(--color-primary)" />
              <span style={{color: '#aaa', fontStyle:'italic'}}>El Andino está analizando tus datos...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '1.2rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', 
        background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(20,20,30,0.3))'
      }}>
        <div style={{
          display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.4)', 
          padding: '8px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
        }}>
          {/* Mic Button */}
          <button
            onClick={toggleListen}
            style={{
              background: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)',
              color: isListening ? '#fff' : '#aaa',
              border: 'none', borderRadius: '50%', width: '48px', height: '48px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
            title="Dictar por voz"
          >
            {isListening ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Escuchando... Habla ahora" : "Escribe o dicta tu consulta..."}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: '#fff',
              padding: '12px 8px', resize: 'none', minHeight: '48px', maxHeight: '120px',
              fontFamily: 'inherit', outline: 'none', fontSize: '1rem'
            }}
            disabled={isLoading}
          />
          
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              background: input.trim() && !isLoading ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'rgba(255,255,255,0.05)',
              color: input.trim() && !isLoading ? '#fff' : '#666',
              border: 'none', borderRadius: '50%', width: '48px', height: '48px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              boxShadow: input.trim() && !isLoading ? '0 4px 15px rgba(212, 175, 55, 0.4)' : 'none'
            }}
          >
            <Send size={20} style={{marginLeft: '2px'}} />
          </button>
        </div>
        <div style={{textAlign: 'center', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.6}}>
          <AlertCircle size={12} color="#aaa" />
          <span style={{fontSize: '0.75rem', color: '#aaa'}}>Procesamiento de voz seguro a través de Web Speech API (Gratis)</span>
        </div>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
