import React, { useState, useEffect, useRef } from 'react';

const TextSection = ({ text, onNavigateNext, isVisible }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const sectionRef = useRef(null);
  const fullTextRef = useRef(null);
  
  // Effet pour l'animation de visibilité basée sur le défilement
  useEffect(() => {
    if (isVisible) {
      // On active l'animation avec un petit délai pour avoir un effet cinématique
      const timer = setTimeout(() => {
        setAnimateIn(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      setTextIndex(0);
      setDisplayedText('');
    }
  }, [isVisible]);
  
  // Effet pour l'animation de typage du texte
  useEffect(() => {
    if (animateIn && textIndex < text.length) {
      const typingTimer = setTimeout(() => {
        setDisplayedText(text.substring(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 30); // Vitesse de typage
      
      return () => clearTimeout(typingTimer);
    }
  }, [animateIn, textIndex, text]);
  
  // Observer l'intersection avec le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animateIn) {
          // Délai avant de déclencher l'animation
          setTimeout(() => {
            setAnimateIn(true);
          }, 200);
        }
      },
      { threshold: 0.5 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  return (
    <div 
      ref={sectionRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          maxWidth: '800px',
          padding: '20px',
          textAlign: 'center',
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease-out, transform 1.2s ease-out',
          position: 'relative',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {/* Texte invisible pour réserver l'espace */}
        <p 
          ref={fullTextRef}
          style={{ 
            fontSize: '2rem',
            lineHeight: '1.6',
            color: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            visibility: 'hidden',
            fontFamily: "'Orbitron', sans-serif",
            whiteSpace: 'pre-line',
            pointerEvents: 'none'
          }}
        >
          {text}
        </p>
        
        {/* Texte visible animé */}
        <p style={{ 
          fontSize: '2rem',
          lineHeight: '1.6',
          color: '#ffffff',
          fontFamily: "'Orbitron', sans-serif",
          textShadow: '0 0 10px rgba(0, 100, 255, 0.7)',
          whiteSpace: 'pre-line',
          margin: 0,
          padding: 0
        }}>
          {displayedText}<span className="cursor-blink">|</span>
        </p>
        
        <style>
          {`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .cursor-blink {
              animation: blink 1s infinite;
              color: #5a9cff;
              font-weight: bold;
            }
          `}
        </style>
      </div>
      
      {/* Bouton pour passer à la section suivante */}
      <div 
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: `translateX(-50%) ${animateIn && textIndex >= text.length ? 'translateY(0)' : 'translateY(30px)'}`,
          cursor: 'pointer',
          zIndex: 10,
          opacity: animateIn && textIndex >= text.length ? 1 : 0,
          transition: 'opacity 1s ease-out, transform 1s ease-out',
          transitionDelay: '0.5s'
        }}
        onClick={onNavigateNext}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path 
            d="M12 5V19M12 19L5 12M12 19L19 12" 
            stroke="#ffffff" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default TextSection; 