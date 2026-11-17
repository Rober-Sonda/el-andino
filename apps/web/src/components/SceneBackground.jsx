import React, { useEffect, useState } from 'react';

// Ids of the Home sections, in scroll order, and the real photograph + color wash
// used to set the mood for each one. The sections themselves become translucent
// panels (see App.css ".scene-glass-panel") so this cinematic backdrop reads through.
const SCENES = [
  { id: 'inicio', image: null, wash: 'transparent' }, // Hero already has its own full photo
  { id: 'beneficios', image: '/hero_campo.png', wash: 'rgba(74, 124, 46, 0.35)' },
  { id: 'variedades', image: '/hero_historia.png', wash: 'rgba(61, 44, 34, 0.4)' },
  { id: 'alquimista', image: '/despalada_full.jpg', wash: 'rgba(189, 83, 25, 0.35)' },
  { id: 'sabiduria', image: '/ahumada_full.jpg', wash: 'rgba(214, 170, 90, 0.4)' },
];

/**
 * Fixed, full-bleed cinematic backdrop for the homepage: real photographs cross-fade
 * (with a slow Ken Burns pan/zoom and a brand color wash) as the user scrolls from
 * one section to the next, tying every section together visually.
 */
const SceneBackground = () => {
  const [activeId, setActiveId] = useState('inicio');

  useEffect(() => {
    const sections = SCENES.map((scene) => document.getElementById(scene.id)).filter(Boolean);
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scene-background" aria-hidden="true">
      {SCENES.filter((scene) => scene.image).map((scene) => (
        <div key={scene.id} className={`scene-frame${activeId === scene.id ? ' is-active' : ''}`}>
          <img src={scene.image} alt="" loading="lazy" />
          <div className="scene-wash" style={{ backgroundColor: scene.wash }} />
        </div>
      ))}
      <div className="scene-vignette" />
    </div>
  );
};

export default SceneBackground;
