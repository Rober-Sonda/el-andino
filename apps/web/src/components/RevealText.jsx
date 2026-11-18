import React, { useEffect, useRef, useState } from 'react';

/**
 * Splits text into words and reveals them with a staggered slide/fade-up
 * animation the first time the element scrolls into view.
 */
// eslint-disable-next-line no-unused-vars -- Component is used as a JSX tag name below
const RevealText = ({ text, as: Component = 'span', className = '', style, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <Component ref={ref} className={`reveal-text ${className}`} style={style}>
      {words.map((word, i) => (
        <span className="reveal-text-word" key={`${word}-${i}`}>
          <span
            className={`reveal-text-inner${isVisible ? ' is-visible' : ''}`}
            style={{ transitionDelay: `${delay + i * 0.05}s` }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
};

export default RevealText;
