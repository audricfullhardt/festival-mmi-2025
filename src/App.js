import TiltCard        from './components/TiltCard';         // toujours dispo
import Button          from './components/Button.jsx';
import PlanetSpec      from './components/PlanetSpec';
import GalaxyScene     from './GalaxyScene';
import React, { useState, useEffect, useRef } from 'react';
import Loader3D        from './components/Loader3D.jsx';
import PlanetSection   from './components/PlanetSection';
import TextSection     from './components/TextSection';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollToPlugin);

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function App() {
  /* loader ---------------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  /* UI & caméra ----------------------------------------------------- */
  const [scrollY, setScrollY] = useState(0);
  const [hideUI,  setHideUI]  = useState(false);

  const [showTitle,   setShowTitle]   = useState(false);
  const [titleOp,     setTitleOp]     = useState(0);
  const [titleTransf, setTitleTransf] = useState('translateY(20px)');

  // Flag pour indiquer que l'animation est terminée
  const [animationFinished, setAnimationFinished] = useState(false);

  const sectionsRef = useRef([]);
  const timeoutRef  = useRef(null);

  const [allowScroll, setAllowScroll] = useState(false);
  const [pendingScrollTo, setPendingScrollTo] = useState(false);

  // Pour le fade-in du bouton 'Commencer le voyage'
  const [showStartBtn, setShowStartBtn] = useState(false);

  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);

  /* data planètes & textes ----------------------------------------- */
  const randomTexts = [
    {
      title: 'Pianeta Rossa',
      cardContent:
        "Monde aride aux vastes déserts et canyons. L'atmosphère y est ténue mais riche en oxyde de fer …",
      planetSpec: 'Diamètre : 6 792 km | Gravité : 0,38 g | Atmosphère : CO₂ 95 %'
    },
    {
      title: 'Nebulosa Azure',
      cardContent:
        "Géante gazeuse bleu-turquoise parcourue d'éclairs titanesques …",
      planetSpec: 'Diamètre : 49 500 km | Gravité : 1,12 g | Atmosphère : H₂, He'
    },
    {
      title: 'Chrysalis Prime',
      cardContent:
        "Monde tropical à montagnes flottantes et faune volante …",
      planetSpec: 'Diamètre : 12 104 km | Gravité : 0,91 g | Atmosphère : N₂, O₂'
    }
  ];

  const storyTexts = [
    "Notre vaisseau s'éloigne de Pianeta Rossa …",
    "Après avoir navigué à travers les anneaux de Nebulosa Azure …"
  ];

  const combinedSections = [];
  // Ajoute un texte d'intro avant la première planète
  combinedSections.push({ type: 'text', text: "Lancement de l'odyssée...", index: 'intro' });
  randomTexts.forEach((p,i)=>{
    combinedSections.push({ type:'planet', data:p, index:i });
    if(i<randomTexts.length-1)
      combinedSections.push({ type:'text', text:storyTexts[i], index:`text-${i}` });
  });

  /* fake loader ----------------------------------------------------- */
  useEffect(()=>{
    if(!loading) return;
    let v=0;
    const id=setInterval(()=>{
      v+=Math.floor(Math.random()*2)+1;
      if(v>=100){setProgress(100);clearInterval(id);setTimeout(()=>setFadeOut(true),250);}
      else setProgress(v);
    },75);
    return()=>clearInterval(id);
  },[loading]);

  useEffect(()=>{ if(fadeOut){const id=setTimeout(()=>setLoading(false),600);return()=>clearTimeout(id);} },[fadeOut]);

  // Ajout de l'interpolation douce pour animatedProgress
  useEffect(() => {
    if (!loading) return;
    let raf;
    const animate = () => {
      setAnimatedProgress(prev => prev + (progress - prev) * 0.18);
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [progress, loading]);

  /* titre après intro ---------------------------------------------- */
  useEffect(()=>{
    if(loading) return;
    const show=()=>{
      setShowTitle(true);
      setTimeout(()=>{setTitleOp(1);setTitleTransf('translateY(0)');},100);
    };
    const half=()=>show();
    const end=()=>{
      show();
      // Marquer l'animation comme terminée
      setAnimationFinished(true);
    };
    window.addEventListener('galaxyAnimation50Percent',half);
    window.addEventListener('galaxyAnimationComplete', end);
    timeoutRef.current=setTimeout(show,15000);
    return()=>{
      window.removeEventListener('galaxyAnimation50Percent',half);
      window.removeEventListener('galaxyAnimationComplete', end);
      clearTimeout(timeoutRef.current);
    };
  },[loading]);

  /* scroll → caméra ------------------------------------------------- */
  useEffect(()=>{
    // On ne configure le système de caméra par défilement qu'après la fin de l'animation
    if (!animationFinished) return;
    
    // Points du chemin (à ajuster selon la galaxie)
    const pathPoints = [
      new THREE.Vector3(-15, 2, -30),
      new THREE.Vector3(-10, 3, -15),
      new THREE.Vector3(-5, 4, 0),
      new THREE.Vector3(0, 2, 10),
      new THREE.Vector3(5, 0, 20),
      new THREE.Vector3(10, -2, 30),
      new THREE.Vector3(15, 1, 40),
      new THREE.Vector3(20, 3, 50),
      new THREE.Vector3(25, 5, 60)
    ];
    const cameraCurve = new THREE.CatmullRomCurve3(pathPoints);

    const onScroll=()=>{
      const max=document.body.scrollHeight-window.innerHeight;
      if(max<=0) return;
      setScrollY(window.scrollY);
      setHideUI(window.scrollY>50);

      // Trouver la section planète la plus proche du centre du viewport
      const planetSections = combinedSections
        .map((sec, i) => ({...sec, domIndex: i}))
        .filter(sec => sec.type === 'planet');
      const viewportCenter = window.scrollY + window.innerHeight/2;
      let minDist = Infinity;
      let idx = 0;
      planetSections.forEach((sec, i) => {
        const el = sectionsRef.current[sec.domIndex];
        if (el) {
          const rect = el.getBoundingClientRect();
          const sectionCenter = rect.top + window.scrollY + rect.height/2;
          const dist = Math.abs(sectionCenter - viewportCenter);
          if (dist < minDist) {
            minDist = dist;
            idx = i;
          }
        }
      });
      setCurrentPlanetIndex(idx);
    };
    
    // Mettre à jour l'UI et la position de la caméra initialement
    onScroll();
    
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[animationFinished, combinedSections]);

  /* helper scrollTo ------------------------------------------------- */
  const scrollTo=(idx)=>{
    const el = sectionsRef.current[idx];
    if (el) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: el, offsetY: 0 },
        ease: 'power2.inOut'
      });
    }
  };

  // Bloquer le scroll tant que l'utilisateur n'a pas cliqué sur le bouton
  useEffect(() => {
    document.body.style.overflowX = 'hidden'; // Toujours désactiver le scroll horizontal
    document.documentElement.style.overflowX = 'hidden';
    if (!allowScroll) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowX = '';
    };
  }, [allowScroll]);

  // Autoriser le scroll et scroller après la fin de l'animation d'intro
  useEffect(() => {
    if (animationFinished && pendingScrollTo) {
      setAllowScroll(true);
      setTimeout(() => {
        // Scroll instantané vers la première planète (t=0.2 max)
        const planetCount = randomTexts.length;
        const max = document.body.scrollHeight - window.innerHeight;
        let targetT = planetCount > 1 ? 1/(planetCount-1) : 0;
        targetT = Math.min(targetT, 0.2); // Ne va pas trop loin
        const targetY = max * targetT;
        window.scrollTo(0, targetY);
      }, 0);
      setPendingScrollTo(false);
    }
  }, [animationFinished, pendingScrollTo, randomTexts.length]);

  // Pour le fade-in du bouton 'Commencer le voyage'
  useEffect(() => {
    if (animationFinished) {
      // Petit délai pour l'effet
      const t = setTimeout(() => setShowStartBtn(true), 400);
      return () => clearTimeout(t);
    } else {
      setShowStartBtn(false);
    }
  }, [animationFinished]);

  /* rendu ----------------------------------------------------------- */
  if(loading) return <Loader3D progress={animatedProgress} fadeOut={fadeOut}/>;

  // Calcul du scroll progress (0 = haut, 1 = bas)
  const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

  // Mapping précis : pour chaque section, associer un t sur la courbe (0, 0.5, 1, 1.5, ...)
  const sectionCurveT = [];
  let planetIdx = 0;
  for (let i = 0; i < combinedSections.length; i++) {
    if (combinedSections[i].type === 'planet') {
      sectionCurveT.push(planetIdx);
      planetIdx++;
    } else {
      // Si c'est le tout premier texte (intro), t=0 (début de la courbe)
      if (i === 0) {
        sectionCurveT.push(0);
      } else {
        // Texte : juste après la planète précédente (20% du chemin)
        sectionCurveT.push(planetIdx - 1 + 0.2);
      }
    }
  }
  // Normaliser pour que t aille de 0 à 1 sur la courbe
  const maxT = Math.max(...sectionCurveT);
  const normalizedSectionCurveT = sectionCurveT.map(t => t / maxT);

  // Calcul du t de la planète de départ pour chaque section
  const sectionPlanetT = [];
  planetIdx = 0;
  for (let i = 0; i < combinedSections.length; i++) {
    if (combinedSections[i].type === 'planet') {
      sectionPlanetT.push(planetIdx / maxT);
      planetIdx++;
    } else {
      sectionPlanetT.push((planetIdx - 1) / maxT);
    }
  }

  // Trouver la section courante et interpoler entre t de la section courante et suivante
  let curveProgress = 0;
  let cameraProgress = 0;
  if (combinedSections.length > 1) {
    const sectionIndex = Math.floor(scrollProgress * (combinedSections.length - 1));
    const sectionStart = sectionIndex / (combinedSections.length - 1);
    const sectionEnd = (sectionIndex + 1) / (combinedSections.length - 1);
    const sectionT = (scrollProgress - sectionStart) / (sectionEnd - sectionStart);
    const tA = normalizedSectionCurveT[sectionIndex];
    const tB = normalizedSectionCurveT[Math.min(sectionIndex + 1, normalizedSectionCurveT.length - 1)];
    curveProgress = tA + (tB - tA) * sectionT;
    // Caméra : si section texte, on interpole entre planète de départ et t_vaisseau
    const isText = combinedSections[sectionIndex].type === 'text';
    if (isText) {
      const tPlanet = sectionPlanetT[sectionIndex];
      cameraProgress = tPlanet + (curveProgress - tPlanet) * 0.5; // 0.5 = milieu, ajuste si besoin
    } else {
      cameraProgress = curveProgress;
    }
  }

  return (
    <div className="App" style={{ position:'relative' }}>
      {/* scène 3D */}
      <div style={{ position:'fixed', inset:0, zIndex:-1 }}>
        <GalaxyScene currentPlanetIndex={currentPlanetIndex} scrollProgress={curveProgress} cameraProgress={cameraProgress}/>
      </div>

      {/* intro plein écran + flèche */}
      <section style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{
          position:'absolute', bottom:30, left:'50%', transform:'translateX(-50%)',
          opacity:hideUI?0:1, transition:'opacity .5s', pointerEvents:'auto'
        }}>
          <div onClick={()=>allowScroll && scrollTo(0)} style={{ cursor:'pointer', animation:'bounce 2s infinite', padding:20 }}>
            <style>{`
              @keyframes bounce{
                0%,20%,50%,80%,100%{transform:translateY(0);}
                40%{transform:translateY(-15px);}
                60%{transform:translateY(-7px);}
              }`}</style>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M12 19L5 12M12 19L19 12"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* titre flottant */}
      {!hideUI && showTitle && (
        <div style={{
          position:'fixed', inset:0, display:'flex', justifyContent:'center', alignItems:'center',
          pointerEvents:'none', opacity:titleOp, transform:titleTransf,
          transition:'opacity 1.5s, transform 1.8s', zIndex:1000
        }}>
          <div style={{ 
            textAlign:'center', maxWidth:800, pointerEvents:'auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
          }}>
            <h1 style={{
              fontSize:'3rem', color:'#fff', marginBottom:'2rem', fontFamily:"'Orbitron',sans-serif",
              textShadow:'0 0 10px rgba(255,0,0,.5),0 0 20px rgba(0,0,255,.3)'
            }}>
              Odyssey-42 : Voyage vers le Néant
            </h1>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                opacity: animationFinished && showStartBtn ? 1 : 0,
                transform: animationFinished && showStartBtn ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.5s cubic-bezier(.4,1,.4,1), transform 0.5s cubic-bezier(.4,1,.4,1)',
                pointerEvents: animationFinished && showStartBtn ? 'auto' : 'none',
                width: '100%', display: 'flex', justifyContent: 'center'
              }}>
                <Button text="Commencer le voyage" onClick={() => {
                  setPendingScrollTo(true);
                }}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* sections planètes + textes */}
      {combinedSections.map((sec,i)=>(
        <section key={i} ref={el=>sectionsRef.current[i]=el}
          style={{ height:'100vh', width:'100vw', display:'flex', alignItems:'center',
                   justifyContent:'center', overflow:'hidden', position:'relative' }}>
          {sec.type==='planet' ? (
            <PlanetSection
              planetName={sec.data.title}
              planetDescription={sec.data.planetSpec}
              cardTitle={sec.data.title}
              cardContent={sec.data.cardContent}
              index={sec.index}
              onNavigateNext={()=>scrollTo(i+1)}
              invertLayout={sec.index%2!==0}
              isVisible={scrollY>window.innerHeight*0.5+i*window.innerHeight}
            />
          ) : (
            <TextSection
              text={sec.text}
              onNavigateNext={()=>scrollTo(i+1)}
              isVisible={scrollY>window.innerHeight*0.5+i*window.innerHeight}
            />
          )}
        </section>
      ))}
    </div>
  );
}

export default App;
