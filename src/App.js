import TiltCard        from './components/TiltCard';
import Button          from './components/Button.jsx';
import PlanetSpec      from './components/PlanetSpec';
import GalaxyScene     from './GalaxyScene';
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [hideUI,  setHideUI]  = useState(false);
  const [showTitle,   setShowTitle]   = useState(false);
  const [titleOp,     setTitleOp]     = useState(0);
  const [titleTransf, setTitleTransf] = useState('translateY(20px)');
  const [animationFinished, setAnimationFinished] = useState(false);
  const sectionsRef = useRef([]);
  const timeoutRef  = useRef(null);
  const [allowScroll, setAllowScroll] = useState(false);
  const [pendingScrollTo, setPendingScrollTo] = useState(false);
  const [showStartBtn, setShowStartBtn] = useState(false);
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const randomTexts = [
    {
      title: 'Mornis',
      cardContent:
        "La planète Mornis n'était qu'un astre pâle, cerné de structures cristallines violettes qui diffractaient la lumière d'un soleil lointain. En approchant, Kaël sentit la tension de l'atmosphère : l'air vibrait, chargé d'électricité et de particules inconnues. Le sol était instable, formé de plaques anguleuses qui semblaient flotter au-dessus d'un abîme lumineux. Aucun signe de vie, mais une énergie étrange, presque hostile, imprégnait chaque recoin. Kaël ne s'attarda pas : ici, la survie n'était pas permise.",
      planetSpec: `Diamètre : 14 200 km | Gravité : 0,62 g | Atmosphère : Ionisée | Hostilité : Élevée | Habité : Non`
    },
    {
      title: 'Cryon',
      cardContent:
        "Sur Cryon, la lumière du soleil ne perçait pas la glace. Il descendit dans les crevasses, cherchant un abri. Une vieille balise s'y trouvait, scellée dans une prison de givre. Il passa des heures à la libérer, à écouter ses fichiers corrompus. Des voix brisées, des coordonnées vides. Un autre naufragé avait été là, avant lui. Il ne retrouva que son silence. Lorsqu'une tempête électromagnétique s'abattit, il courut vers son module, échappant de justesse au piège glacial de la planète.",
      planetSpec: 'Diamètre : 12 800 km | Gravité : 0,85 g | Atmosphère : N₂, O₂, traces de CO₂ | Hostilité : Moyenne | Habité : Non'
    },
    {
      title: 'Virelia',
      cardContent:
        "Les habitants, des êtres gracieux aux yeux brillants, l'accueillirent sans peur. Ils écoutèrent son histoire. Ils réparèrent son vaisseau. Ils lui offrirent une carte, une direction, une chance.\n\nMais avant de partir, Kaël interrogea leurs archives. Ce qu'il y découvrit le frappa en plein cœur : chaque cycle stellaire, une forme traverse le Néant. Toujours la même. Toujours seul. Toujours à la recherche d'un foyer.\n\nC'était lui. Encore. Encore. Encore.",
      planetSpec: 'Diamètre : 15 600 km | Gravité : 0,95 g | Atmosphère : N₂, O₂, traces de gaz nobles | Hostilité : Faible | Habité : Oui'
    }
  ];
  const storyTexts = [
    "Alors que son module quittait l'orbite de Mornis, Kaël resta silencieux. Il ne savait plus s'il fuyait le Néant ou s'il courait vers quelque chose. Son souffle était court, ses paupières lourdes, mais un second signal s'éveilla dans la nuit noire. Une autre chance. Une autre planète.",
    "Kaël quitta Cryon, épuisé, l'esprit fissuré par la solitude. Il programma le module pour suivre un nouveau signal, sans y croire vraiment. Mais bientôt, un chant étrange résonna dans la nuit. Virelia apparut, lumineuse, vivante, comme une oasis suspendue dans le vide."
  ];
  const combinedSections = [];
  combinedSections.push({
    type: 'text',
    text: `Kaël rouvre les yeux dans le silence glacé du cockpit secondaire de l'Odyssey-42. Autour de lui, tout est immobile : les alarmes se sont tues, les parois vibrent faiblement. De l'équipage, il ne reste que des souvenirs, enregistrés dans la mémoire du vaisseau.

Une lumière blanche, une distorsion brutale… puis le Néant. L'Odyssey-42 a été arraché de sa trajectoire, projeté dans une région inconnue du cosmos, sans étoiles ni repères.

Désorienté mais déterminé, Kaël active la navigation manuelle. Rien… puis, soudain, un signal. Ce sera sa première destination.`,
    index: 'intro'
  });
  randomTexts.forEach((p,i)=>{
    combinedSections.push({ type:'planet', data:p, index:i });
    if(i<randomTexts.length-1)
      combinedSections.push({ type:'text', text:storyTexts[i], index:`text-${i}` });
  });
  const sectionCurveT = [];
  let planetIdx = 0;
  for (let i = 0; i < combinedSections.length; i++) {
    if (combinedSections[i].type === 'planet') {
      sectionCurveT.push(planetIdx);
      planetIdx++;
    } else {
      if (i === 0) {
        sectionCurveT.push(0);
      } else {
        sectionCurveT.push(planetIdx - 1 + 0.2);
      }
    }
  }
  const maxT = Math.max(...sectionCurveT);
  const normalizedSectionCurveT = sectionCurveT.map(t => t / maxT);
  const t_planet1 = normalizedSectionCurveT.find((t, i) => combinedSections[i].type === 'planet' && combinedSections[i].index === 0) || 0.0001;
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
  useEffect(()=>{
    if(loading) return;
    const show=()=>{
      setShowTitle(true);
      setTimeout(()=>{setTitleOp(1);setTitleTransf('translateY(0)');},100);
    };
    const half=()=>show();
    const end=()=>{
      show();
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
  useEffect(()=>{
    if (!animationFinished) return;
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
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[animationFinished, combinedSections]);
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
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
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
  useEffect(() => {
    if (animationFinished && pendingScrollTo) {
      setAllowScroll(true);
      setTimeout(() => {
        const planetCount = randomTexts.length;
        const max = document.body.scrollHeight - window.innerHeight;
        let targetT = planetCount > 1 ? 1/(planetCount-1) : 0;
        targetT = Math.min(targetT, 0.2);
        const targetY = max * targetT;
        window.scrollTo(0, targetY);
      }, 0);
      setPendingScrollTo(false);
    }
  }, [animationFinished, pendingScrollTo, randomTexts.length]);
  useEffect(() => {
    if (animationFinished) {
      const t = setTimeout(() => setShowStartBtn(true), 400);
      return () => clearTimeout(t);
    } else {
      setShowStartBtn(false);
    }
  }, [animationFinished]);
  const [introAnimating, setIntroAnimating] = useState(false);
  const [introProgress, setIntroProgress] = useState(0);
  useEffect(() => {
    if (introAnimating) {
      let start = null;
      const duration = 1800;
      function animate(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const p = Math.min(elapsed / duration, 1);
        setIntroProgress(t_planet1 * p);
        if (p < 1) requestAnimationFrame(animate);
        else setIntroAnimating(false);
      }
      requestAnimationFrame(animate);
    }
  }, [introAnimating, t_planet1]);
  const [showEnding, setShowEnding] = useState(false);
  const [endingTypingDone, setEndingTypingDone] = useState(false);
  const endingText = `Le Néant n'était pas un lieu, mais une boucle. Kaël observa la courbure des étoiles, pensa à son équipage, aux mondes traversés. Il aurait pu rester, mais quelque chose en lui refusait de s'arrêter là. Il remonta à bord, saisit les commandes, le regard fixé sur l'horizon. Tant qu'il restait une étoile à suivre, il continuerait.`;
  const handleShowEnding = useCallback(() => setShowEnding(true), []);
  if(loading) return <Loader3D progress={animatedProgress} fadeOut={fadeOut}/>;
  const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
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
    const isText = combinedSections[sectionIndex].type === 'text';
    if (isText) {
      const tPlanet = sectionPlanetT[sectionIndex];
      cameraProgress = tPlanet + (curveProgress - tPlanet) * 0.5;
    } else {
      cameraProgress = curveProgress;
    }
  }
  const effectiveProgress = introAnimating ? introProgress : curveProgress;
  const effectiveCameraProgress = introAnimating ? effectiveProgress : cameraProgress;
  return (
    <div className="App" style={{ position:'relative' }}>
      <div style={{ position:'fixed', inset:0, zIndex:-1 }}>
        <GalaxyScene currentPlanetIndex={currentPlanetIndex} scrollProgress={effectiveProgress} cameraProgress={effectiveCameraProgress}/>
      </div>
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
                  setIntroAnimating(true);
                }}/>
              </div>
            </div>
          </div>
        </div>
      )}
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
              onNavigateNext={i === combinedSections.length-1 ? handleShowEnding : ()=>scrollTo(i+1)}
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
      {showEnding && (
        <div style={{
          position: 'fixed', inset: 0, background: 'black', color: 'white', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Orbitron', sans-serif", fontSize: '1.3rem', letterSpacing: 1.2, padding: 32
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', minHeight: 350 }}>
            <TextSection text={endingText} isVisible={true} typingEffect={true} typingSpeed={24} onTypingEnd={() => setEndingTypingDone(true)} />
          </div>
          <div style={{ marginTop: 48 }}>
            {endingTypingDone && (
              <Button text="Recommencer l'aventure" onClick={() => window.location.reload()} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
