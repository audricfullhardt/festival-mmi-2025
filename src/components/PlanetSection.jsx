import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import TiltCard from './TiltCard';
import PlanetSpec from './PlanetSpec';
import { gsap } from 'gsap';

// Composant pour la planète
function Planet({ color, hovered, setHovered, index }) {
  const planetRef = useRef();
  
  // Couleurs pour chaque planète au lieu des textures
  const planetColors = [
    '#ff5a5a',  // Rouge pour la première planète (Mars)
    '#5a7aff',  // Bleu pour la deuxième planète (Neptune)
    '#5affaa'   // Vert-bleu pour la troisième planète (Terre)
  ];
  
  // Paramètres low poly en fonction de l'index
  const getLowPolyParams = (idx) => {
    const params = [
      { segments: 16, detail: 0 },  // Première planète - moins détaillée
      { segments: 12, detail: 0 },  // Deuxième planète - encore moins détaillée
      { segments: 8, detail: 0 }    // Troisième planète - très low poly
    ];
    return params[idx] || params[0];
  };
  
  const lowPolyParams = getLowPolyParams(index);
  
  useEffect(() => {
    // Animation d'apparition de la planète
    gsap.to(planetRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      delay: 0.3
    });
  }, []);
  
  useFrame((state, delta) => {
    if (planetRef.current) {
      // Rotation lente de la planète quand elle n'est pas survolée
      if (!hovered) {
        planetRef.current.rotation.y += delta * 0.1;
      }
    }
  });

  return (
    <mesh 
      ref={planetRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[0.1, 0.1, 0.1]} // Commence petit pour l'animation
    >
      {/* Utiliser une géométrie avec moins de segments pour effet low poly */}
      <icosahedronGeometry args={[2, lowPolyParams.detail]} />
      <meshStandardMaterial 
        color={planetColors[index]}
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}

// Composant pour ajouter des étoiles en arrière-plan
function Stars() {
  const starsRef = useRef();
  const starsCount = 200;
  
  // Créer les positions aléatoires pour les étoiles
  const positions = useMemo(() => {
    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, [starsCount]);
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" />
    </points>
  );
}

// Composant principal pour la section de planète
const PlanetSection = ({ 
  planetName, 
  planetDescription, 
  cardTitle, 
  cardContent, 
  index,
  isLast,
  onNavigateNext,
  invertLayout,
  isVisible
}) => {
  const [hovered, setHovered] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const sectionRef = useRef(null);
  const controlsRef = useRef(null);
  
  // Activer l'animation en fonction du défilement et de la visibilité
  useEffect(() => {
    if (isVisible) {
      // On active l'animation avec un petit délai pour avoir un effet cinématique
      const timer = setTimeout(() => {
        setAnimateIn(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isVisible]);
  
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
      { threshold: 0.4 }
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
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: invertLayout ? 'row-reverse' : 'row'
      }}
    >
      {/* Section de la planète et du vaisseau spatial */}
      <div 
        style={{ 
          width: '50%', 
          height: '100%', 
          position: 'relative',
          opacity: animateIn ? 1 : 0,
          transform: animateIn 
            ? 'translateX(0)' 
            : `translateX(${invertLayout ? '-' : ''}100px)`,
          transition: 'opacity 1.2s ease-out, transform 1.5s ease-out',
          transitionDelay: '0.1s'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 40 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars />
          <Planet 
            color="#ff0000" 
            hovered={hovered} 
            setHovered={setHovered} 
            index={index}
          />
          <OrbitControls 
            ref={controlsRef}
            enableZoom={false} 
            enablePan={false}
            enableRotate={true}
          />
        </Canvas>
        
        {/* Afficher les spécifications de la planète au survol */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          [invertLayout ? 'right' : 'left']: hovered ? '60%' : '55%', 
          transform: 'translateY(-50%)',
          opacity: hovered ? 1 : 0,
          transition: 'all 0.3s ease-in-out'
        }}>
          <PlanetSpec title={planetName} text={planetDescription} />
        </div>
      </div>
      
      {/* Section de la carte d'information */}
      <div 
        style={{ 
          width: '40%', 
          display: 'flex', 
          justifyContent: 'center',
          opacity: animateIn ? 1 : 0,
          transform: animateIn 
            ? 'translateX(0)' 
            : `translateX(${invertLayout ? '' : '-'}100px)`,
          transition: 'opacity 1.2s ease-out, transform 1.5s ease-out',
          transitionDelay: '0.4s'
        }}
      >
        <TiltCard title={cardTitle} content={cardContent} />
      </div>
      
      {/* Bouton pour passer à la section suivante */}
      {!isLast && (
        <div 
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: `translateX(-50%) ${animateIn ? 'translateY(0)' : 'translateY(30px)'}`,
            cursor: 'pointer',
            zIndex: 10,
            opacity: animateIn ? 1 : 0,
            transition: 'opacity 1s ease-out, transform 1s ease-out',
            transitionDelay: '0.8s'
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
      )}
    </div>
  );
};

export default PlanetSection; 