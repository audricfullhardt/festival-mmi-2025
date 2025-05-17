import React, { useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';

const TiltCard = ({ title, content }) => {
  const tiltRef = useRef(null);
  
  useEffect(() => {
    // Initialize vanilla-tilt on the element
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, {
        max: 7,               // Légère inclinaison pour un effet subtil
        speed: 2000,           // Vitesse de transition plus rapide pour plus de fluidité
        perspective: 1000,    // Profondeur de la perspective
        scale: 1.05,          // Légère augmentation de taille
        transition: true,     // Active les transitions
        easing: "cubic-bezier(.03,.98,.52,.99)", // Courbe d'accélération douce
        glare: true,          // Effet de brillance
        "max-glare": 0.3,     // Brillance subtile
        reset: true,          // Réinitialise à la position initiale
        "reset-to-start": true // Retour en douceur à la position initiale
      });
    }
    
    // Clean up
    return () => {
      if (tiltRef.current && tiltRef.current.vanillaTilt) {
        tiltRef.current.vanillaTilt.destroy();
      }
    };
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes holo-float {
          0% { transform: translateY(0) scale(1); box-shadow: 0 0 32px 8px #00fff7, 0 0 80px 0px #00bfff44; }
          100% { transform: translateY(-12px) scale(1.025); box-shadow: 0 0 48px 16px #00fff7, 0 0 120px 0px #00bfff66; }
        }
        @keyframes scanline-move {
          0% { background-position-y: 0; }
          100% { background-position-y: 12px; }
        }
      `}</style>
      <div className='tiltcard' ref={tiltRef} style={{
        position: 'relative',
        width: '500px',
        height: '600px',
        background: 'rgba(30, 255, 255, 0.10)',
        boxShadow: '0 0 16px 4px #00fff7, 0 0 40px 0px #00bfff44',
        overflow: 'hidden',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        clipPath: 'path("M490 10H40V425L10 458V598H40H460L490 565V10Z")',
        WebkitClipPath: 'path("M490 10H40V425L10 458V598H40H460L490 565V10Z")',
        boxSizing: 'border-box',
        padding: '60px 40px 50px 70px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: "'Orbitron', sans-serif"
      }}>
        {/* SVG border sur le clipPath */}
        <svg 
          xmlns="http://www.w3.org/2000/svg"
          width="500" 
          height="600" 
          viewBox="0 0 500 600"
          fill="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <path 
            d="M490 10H40V425L10 458V598H40H460L490 565V10Z"
            stroke="#00fff7"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        {/* Scanlines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 3,
          background: 'repeating-linear-gradient(to bottom, rgba(0,255,255,0.08) 0px, rgba(0,255,255,0.08) 2px, transparent 2px, transparent 6px)',
          mixBlendMode: 'screen',
          opacity: 0.5,
          animation: 'scanline-move 2.5s linear infinite',
        }}></div>
        {/* Reflet */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 4,
          background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(0,255,255,0.08) 60%, transparent 100%)',
          opacity: 0.35,
          mixBlendMode: 'screen',
        }}></div>
        {title && <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#00fff7',
          margin: 0,
          marginTop: '10px',
          padding: 10,
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '1px',
          textTransform: 'uppercase',
          zIndex: 2,
          maxWidth: '85%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          alignSelf: 'center',
        }}>{title}</h3>}
        {content && <p style={{
          fontSize: '1.2rem',
          color: '#b2ffff',
          margin: 0,
          marginBottom: '10px',
          padding: 10,
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '0.5px',
          lineHeight: '1.6',
          textAlign: 'center',
          overflowY: 'scroll',
          maxHeight: '390px',
          textShadow: '0 0 6px #00fff7, 0 0 12px #00bfff',
          zIndex: 2,
          background: 'linear-gradient(90deg, rgba(0,255,255,0.08) 0%, rgba(0,255,255,0.18) 100%)',
          borderRadius: '8px',
          padding: '8px 10px',
          boxShadow: '0 0 12px #00fff733',
          maxWidth: '90%',
          alignSelf: 'center',
          scrollbarWidth: 'none'
        }}>{content}</p>}
      </div>
    </>
  );
};

export default TiltCard;