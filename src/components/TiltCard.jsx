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

  const cardStyle = {
    position: 'relative',
    width: '500px',
    height: '600px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    clipPath: 'path("M490 10H40V425L10 458V598H40H460L490 565V10Z")',
    boxSizing: 'border-box',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
    padding: 10,
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: '1px',
    textTransform: 'uppercase'
  };

  const contentStyle = {
    fontSize: '1.2rem',
    color: '#fff',
    margin: 0,
    padding: 10,
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: '0.5px',
    lineHeight: '1.6'
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className='tiltcard' ref={tiltRef} style={cardStyle}>
        {title && <h3 style={titleStyle}>{title}</h3>}
        {content && <p style={contentStyle}>{content}</p>}
      </div>
    </>
  );
};

export default TiltCard;