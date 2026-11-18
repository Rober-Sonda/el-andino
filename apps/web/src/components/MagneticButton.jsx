import React, { useRef } from 'react';

/**
 * Wraps a button/link so it subtly "pulls" toward the cursor while hovered,
 * then springs back on mouse leave. Degrades gracefully (no-op) on touch devices.
 */
// eslint-disable-next-line no-unused-vars -- Component is used as a JSX tag name below
const MagneticButton = ({ children, className = '', style, as: Component = 'button', strength = 0.35, ...rest }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    el.style.transition = 'transform 0.1s ease-out';
    el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = 'translate(0px, 0px)';
  };

  return (
    <Component
      ref={ref}
      className={`magnetic-btn ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default MagneticButton;
