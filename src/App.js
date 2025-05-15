import TiltCard from './components/TiltCard';
import Button from './components/Button.jsx';
import PlanetSpec from './components/PlanetSpec';
import GalaxyScene from './GalaxyScene';
import React, { useState, useEffect, useRef } from 'react';
import Loader3D from './components/Loader3D.jsx';
import PlanetSection from './components/PlanetSection';
import TextSection from './components/TextSection';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hideGalaxyUI, setHideGalaxyUI] = useState(false);
  const [showTitleAndButton, setShowTitleAndButton] = useState(false);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [titleTransform, setTitleTransform] = useState('translateY(20px)');
  const [cameraPosition, setCameraPosition] = useState({ x: 3, y: 3, z: 3 });
  const sectionsRef = useRef([]);
  const appRef = useRef(null);
  const galaxyRef = useRef(null);
  const animationTimeoutRef = useRef(null);

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
      const timer = setTimeout(() => {
        setLoading(false);
        setShowTitleAndButton(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  useEffect(() => {
    if (!loading) {
      // Attendre la fin de l'animation de galaxie
      const handleGalaxyAnimationComplete = () => {
        console.log("Animation de galaxie terminée, affichage du titre et bouton");
        setShowTitleAndButton(true);
        // Démarrer le fade in après un court délai
        setTimeout(() => {
          setTitleOpacity(1);
          setTitleTransform('translateY(0)');
        }, 100);
      };
      
      // Attendre 50% de l'animation pour afficher le titre et le bouton
      const handleGalaxyAnimation50Percent = () => {
        console.log("50% de l'animation de galaxie atteints, affichage du titre et bouton");
        setShowTitleAndButton(true);
        // Démarrer le fade in après un court délai
        setTimeout(() => {
          setTitleOpacity(1);
          setTitleTransform('translateY(0)');
        }, 100);
      };
      
      // Écouter l'événement de 50% de l'animation de la galaxie
      window.addEventListener('galaxyAnimation50Percent', handleGalaxyAnimation50Percent);
      
      // Écouter l'événement de fin d'animation de la galaxie comme fallback
      window.addEventListener('galaxyAnimationComplete', handleGalaxyAnimationComplete);
      
      // Fallback timer au cas où les événements ne se déclenchent pas
      animationTimeoutRef.current = setTimeout(() => {
        setShowTitleAndButton(true);
        // Démarrer le fade in après un court délai
        setTimeout(() => {
          setTitleOpacity(1);
          setTitleTransform('translateY(0)');
        }, 100);
      }, 15000); // 15 secondes comme fallback maximum
      
      return () => {
        window.removeEventListener('galaxyAnimation50Percent', handleGalaxyAnimation50Percent);
        window.removeEventListener('galaxyAnimationComplete', handleGalaxyAnimationComplete);
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
      };
    }
  }, [loading]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (window.scrollY > 50) {
        setHideGalaxyUI(true);
      } else {
        setHideGalaxyUI(false);
      }
      
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = window.scrollY / totalHeight;
      
      const newCameraPositions = [
        { x: 3, y: 3, z: 3 },             // Position initiale
        { x: -2, y: 4, z: 5 },            // Vers première planète
        { x: 6, y: -2, z: 4 },            // Vers deuxième planète
        { x: -1, y: 5, z: 6 }             // Vers troisième planète
      ];
      
      const scrollThresholds = [0, 0.25, 0.5, 0.75, 1];
      let currentSection = 0;
      
      for (let i = 0; i < scrollThresholds.length - 1; i++) {
        if (scrollProgress >= scrollThresholds[i] && scrollProgress < scrollThresholds[i + 1]) {
          currentSection = i;
          break;
        }
      }
      
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

  // Textes narratifs pour les sections intermédiaires
  const storyTexts = [
    "Notre vaisseau s'éloigne de Pianeta Rossa, laissant derrière lui les tempêtes de poussière rouge qui dansent sur les vastes plaines désolées.\n\nLe voyage à travers le vide interstellaire commence. Les étoiles défilent comme des traces lumineuses tandis que nous nous dirigeons vers notre prochaine destination...",
    "Après avoir navigué à travers les anneaux majestueux de Nebulosa Azure, notre vaisseau plonge dans l'espace profond.\n\nLe vide devient plus dense, presque palpable, alors que nous nous rapprochons de notre destination finale, un joyau vert-bleu qui brille dans l'obscurité cosmique."
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

  // Créer un tableau combiné de sections de planètes et de texte
  const combinedSections = [];
  randomTexts.forEach((planetData, index) => {
    // Ajouter section de planète
    combinedSections.push({
      type: 'planet',
      data: planetData,
      index
    });
    
    // Ajouter section de texte après chaque planète (sauf la dernière)
    if (index < randomTexts.length - 1) {
      combinedSections.push({
        type: 'text',
        text: storyTexts[index],
        index: `text-${index}`
      });
    }
  });

  return (
    <div className="App" style={{ position: 'relative' }} ref={appRef}>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: -1
      }}>
        <GalaxyScene 
          hideUI={hideGalaxyUI} 
          cameraPosition={cameraPosition}
          ref={galaxyRef}
        />
      </div>
      
      <section 
        style={{ 
          height: '100vh', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
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
          pointerEvents: 'auto'
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
      {!hideGalaxyUI && showTitleAndButton && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: titleOpacity,
          transform: titleTransform,
          transition: 'opacity 1.5s ease-out, transform 1.8s ease-out'
        }}>
          <div style={{
            textAlign: 'center',
            pointerEvents: 'auto',
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
      
      {/* Sections combinées (planètes et texte) */}
      {combinedSections.map((section, index) => (
        <section 
          key={section.type + '-' + (typeof section.index === 'string' ? section.index : section.index)}
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
          {section.type === 'planet' ? (
            <PlanetSection 
              planetName={section.data.title} 
              planetDescription={section.data.planetSpec}
              cardTitle={section.data.title}
              cardContent={section.data.cardContent}
              index={section.index}
              isLast={index === combinedSections.length - 1}
              onNavigateNext={() => handleScrollToSection(index + 1)}
              invertLayout={section.index % 2 !== 0}
              isVisible={scrollY > window.innerHeight * 0.5 + (index * window.innerHeight)}
            />
          ) : (
            <TextSection
              text={section.text}
              onNavigateNext={() => handleScrollToSection(index + 1)}
              isVisible={scrollY > window.innerHeight * 0.5 + (index * window.innerHeight)}
            />
          )}
        </section>
      ))}
    </div>
  );
}

export default App;
