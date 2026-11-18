import { useEffect, useRef } from 'react';

/**
 * Soft trailing cursor ring for fine-pointer (mouse) devices. Does NOT hide the
 * native cursor (keeps accessibility/usability for forms and text selection) —
 * it just adds a premium, portfolio-style follower that grows over interactive elements.
 */
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    let ringX = 0, ringY = 0, targetX = 0, targetY = 0;
    let rafId;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.transform = `translate(${targetX}px, ${targetY}px)`;

      const target = e.target.closest('a, button, [role="button"], input, .magnetic-btn, .product-card');
      ring.classList.toggle('is-active', !!target);
    };

    const onMouseLeaveWindow = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };
    const onMouseEnterWindow = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    const tick = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeaveWindow);
    document.addEventListener('mouseenter', onMouseEnterWindow);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeaveWindow);
      document.removeEventListener('mouseenter', onMouseEnterWindow);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
};

export default CustomCursor;
