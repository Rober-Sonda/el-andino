import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('el_andino_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('el_andino_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-btn"
      title="Cambiar Modo"
      style={{
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.5rem 1rem',
          borderRadius: '24px'
      }}
    >
      {theme === 'light' ? (
          <>
            <Moon size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Oscuro</span>
          </>
      ) : (
          <>
            <Sun size={18} color="#facc15" />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#facc15' }}>Claro</span>
          </>
      )}
    </button>
  );
};

export default ThemeToggle;
