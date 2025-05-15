import TiltCard from './components/TiltCard';
import Button from './components/Button.jsx';
import PlanetSpec from './components/PlanetSpec';
import GalaxyScene from './GalaxyScene';
import React, { useState, useEffect, useRef } from 'react';
import Loader3D from './components/Loader3D.jsx';
import PlanetSection from './components/PlanetSection';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hideGalaxyUI, setHideGalaxyUI] = useState(false);
  const [cameraPosition, setCameraPosition] = useState({ x: 3, y: 3, z: 3 });
  const sectionsRef = useRef([]);
  const appRef = useRef(null);
  const galaxyRef = useRef(null);

  useEffect(() => {
    if (loading) {
      let current = 0;
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 2) + 1;
        if (current >= 100) {
          current = 100;
          setProgress(current);
          clearInterval(interval);
          setTimeout(() => setFadeOut(true), 200);
        } else {
          setProgress(current);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  // Gérer le défilement et les animations basées sur le scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Masquer l'UI de la galaxie dès qu'on commence à défiler
      if (window.scrollY > 50) {
        setHideGalaxyUI(true);
      } else {
        setHideGalaxyUI(false);
      }
      
      // Animer la caméra de la galaxie en fonction du défilement
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = window.scrollY / totalHeight;
      
      // Calculer la position de la caméra en fonction du défilement
      const newCameraPositions = [
        { x: 3, y: 3, z: 3 },             // Position initiale
        { x: -2, y: 4, z: 5 },            // Vers première planète
        { x: 6, y: -2, z: 4 },            // Vers deuxième planète
        { x: -1, y: 5, z: 6 }             // Vers troisième planète
      ];
      
      // Déterminer dans quelle section nous sommes
      const scrollThresholds = [0, 0.25, 0.5, 0.75, 1];
      let currentSection = 0;
      
      for (let i = 0; i < scrollThresholds.length - 1; i++) {
        if (scrollProgress >= scrollThresholds[i] && scrollProgress < scrollThresholds[i + 1]) {
          currentSection = i;
          break;
        }
      }
      
      // Si nous sommes entre deux sections, calculer une interpolation
      const sectionProgress = (scrollProgress - scrollThresholds[currentSection]) / 
                              (scrollThresholds[currentSection + 1] - scrollThresholds[currentSection]);
      
      if (currentSection < newCameraPositions.length - 1) {
        const start = newCameraPositions[currentSection];
        const end = newCameraPositions[currentSection + 1];
        
        setCameraPosition({
          x: start.x + (end.x - start.x) * sectionProgress,
          y: start.y + (end.y - start.y) * sectionProgress,
          z: start.z + (end.z - start.z) * sectionProgress
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Textes aléatoires pour les cartes et les planètes
  const randomTexts = [
    {
      title: "Pianeta Rossa",
      cardContent: "Monde aride aux vastes déserts et canyons. L'atmosphère y est ténue mais riche en oxyde de fer, donnant à sa surface cette teinte rouge caractéristique. Des tempêtes de poussière gigantesques peuvent parfois envelopper la planète entière pendant des mois.",
      planetSpec: "Diamètre: 6 792 km\nGravité: 0.38g\nAtmosphère: CO2 (95%)\nTempérature: -63°C"
    },
    {
      title: "Nebulosa Azure",
      cardContent: "Géante gazeuse aux incroyables nuances de bleu et turquoise. Son atmosphère tumultueuse est parcourue d'éclairs titanesques et de tempêtes qui durent depuis des siècles. Ses anneaux majestueux, composés de glace et de poussière, s'étendent sur des milliers de kilomètres.",
      planetSpec: "Diamètre: 49 500 km\nGravité: 1.12g\nAtmosphère: H2, He\nTempérature: -145°C"
    },
    {
      title: "Chrysalis Prime",
      cardContent: "Monde tropical aux océans peu profonds et à la végétation luxuriante. Des montagnes flottantes défient la gravité, suspendues par des champs magnétiques naturels. La faune y est principalement aquatique ou volante, adaptée à l'environnement unique de la planète.",
      planetSpec: "Diamètre: 12 104 km\nGravité: 0.91g\nAtmosphère: N2, O2\nTempérature: +27°C"
    }
  ];

  const handleScrollToSection = (index) => {
    if (sectionsRef.current[index]) {
      sectionsRef.current[index].scrollIntoView({ 
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <Loader3D progress={progress} fadeOut={fadeOut} />;
  }

  return (
    <div className="App" style={{ position: 'relative' }} ref={appRef}>
      {/* Galaxie en arrière-plan fixe */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: -1 // Arrière-plan 3D seulement
      }}>
        <GalaxyScene 
          hideUI={hideGalaxyUI} 
          cameraPosition={cameraPosition}
          ref={galaxyRef}
        />
      </div>
      
      {/* Section d'intro (première vue) */}
      <section 
        style={{ 
          height: '100vh', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none' // Permettre les clics à travers pour atteindre le bouton
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: hideGalaxyUI ? 0 : 1,
          transition: 'opacity 0.5s ease-out',
          zIndex: 10,
          pointerEvents: 'auto' // Rétablir les clics pour le bouton de défilement
        }}>
          <div 
            onClick={() => handleScrollToSection(0)}
            style={{
              cursor: 'pointer',
              animation: 'bounce 2s infinite',
              padding: '20px'
            }}
          >
            <style>
              {`
                @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                  40% {transform: translateY(-15px);}
                  60% {transform: translateY(-7px);}
                }
              `}
            </style>
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
      </section>
      
      {/* Couche UI de titre flottante au-dessus de tout */}
      {!hideGalaxyUI && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // Par défaut, pas de capture d'événements
          zIndex: 1000, // S'assurer qu'il est au-dessus de tout
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            pointerEvents: 'auto', // Rétablir les interactions pour ce div spécifique
            width: '100%',
            maxWidth: '800px',
            padding: '0 20px'
          }}>
            <h1 style={{ 
              fontSize: '3rem', 
              color: 'white',
              marginBottom: '2rem',
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 10px rgba(255,0,0,0.5), 0 0 20px rgba(0,0,255,0.3)'
            }}>
              Odyssey-42 : Voyage vers le Néant
            </h1>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}>
              <Button 
                text="Commencer le voyage" 
                onClick={() => handleScrollToSection(0)} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Sections des planètes */}
      {randomTexts.map((text, index) => (
        <section 
          key={index} 
          ref={el => sectionsRef.current[index] = el}
          style={{ 
            height: '100vh', 
            width: '100vw',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <PlanetSection 
            planetName={text.title} 
            planetDescription={text.planetSpec}
            cardTitle={text.title}
            cardContent={text.cardContent}
            index={index}
            isLast={index === randomTexts.length - 1}
            onNavigateNext={() => handleScrollToSection(index + 1)}
            invertLayout={index % 2 !== 0} // Alterner la mise en page pour chaque section
            isVisible={scrollY > window.innerHeight * 0.5 + (index * window.innerHeight)}
          />
        </section>
      ))}
    </div>
  );
}

export default App;
