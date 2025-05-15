import TiltCard        from './components/TiltCard';         // toujours dispo
import Button          from './components/Button.jsx';
import PlanetSpec      from './components/PlanetSpec';
import GalaxyScene     from './GalaxyScene';
import React, { useState, useEffect, useRef } from 'react';
import Loader3D        from './components/Loader3D.jsx';
import PlanetSection   from './components/PlanetSection';
import TextSection     from './components/TextSection';

function App() {
  /* loader ---------------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  /* UI & caméra ----------------------------------------------------- */
  const [scrollY, setScrollY] = useState(0);
  const [hideUI,  setHideUI]  = useState(false);

  const [showTitle,   setShowTitle]   = useState(false);
  const [titleOp,     setTitleOp]     = useState(0);
  const [titleTransf, setTitleTransf] = useState('translateY(20px)');

  const [camPos,    setCamPos]    = useState({ x: 3, y: 3, z: 3 });
  const [camTarget, setCamTarget] = useState({ x: 0, y: 0, z: 0 });
  
  // Flag pour indiquer que l'animation est terminée
  const [animationFinished, setAnimationFinished] = useState(false);

  const sectionsRef = useRef([]);
  const timeoutRef  = useRef(null);

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
    },50);
    return()=>clearInterval(id);
  },[loading]);

  useEffect(()=>{ if(fadeOut){const id=setTimeout(()=>setLoading(false),600);return()=>clearTimeout(id);} },[fadeOut]);

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
    
    const path = [
      { x: 3,  y: 3,  z: 3 },  { x: 2,  y: 1,  z: 0.5 }, { x: -1, y: -0.5, z: -2 },
      { x: -3, y: -1, z: -3 }, { x: -5, y: 1,  z: 0    }, { x: -4, y: 3,  z: 4 },
      { x: -2, y: 5,  z: 7 },  { x: 0,  y: 4,  z: 6 },  { x: 2,  y: 0,  z: 2 },
      { x: 0,  y: -2, z: -1 }, { x: -1, y: -4, z: 0 },  { x: 3,  y: -3, z: 2 },
      { x: 5,  y: -1, z: 5 },  { x: 7,  y: 2,  z: 3 },  { x: 5,  y: 5,  z: 1 },
      { x: 1,  y: 7,  z: 0 },  { x: -3, y: 4,  z: 2 },  { x: -5, y: 2,  z: 5 },
      { x: -3, y: 3,  z: 8 },  { x: 0,  y: 4,  z: 7 },  { x: 3,  y: 3,  z: 6 }
    ];

    const onScroll=()=>{
      const max=document.body.scrollHeight-window.innerHeight;
      if(max<=0) return;
      const t=window.scrollY/max;
      const seg=(path.length-1)*t;
      const i=Math.floor(seg), j=Math.min(i+1,path.length-1);
      const f=seg-i, s=0.5-0.5*Math.cos(Math.PI*f);
      const a=path[i], b=path[j];
      const pos={ x:a.x+(b.x-a.x)*s, y:a.y+(b.y-a.y)*s, z:a.z+(b.z-a.z)*s };
      setCamPos(pos);
      const dir={ x:b.x-a.x, y:b.y-a.y, z:b.z-a.z }, len=Math.hypot(dir.x,dir.y,dir.z)||1;
      setCamTarget({ x:pos.x+dir.x/len*2, y:pos.y+dir.y/len*2, z:pos.z+dir.z/len*2 });
      setScrollY(window.scrollY);
      setHideUI(window.scrollY>50);
    };
    
    // Mettre à jour l'UI et la position de la caméra initialement
    onScroll();
    
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[animationFinished]);

  /* helper scrollTo ------------------------------------------------- */
  const scrollTo=(idx)=>sectionsRef.current[idx]?.scrollIntoView({behavior:'smooth'});

  /* rendu ----------------------------------------------------------- */
  if(loading) return <Loader3D progress={progress} fadeOut={fadeOut}/>;

  return (
    <div className="App" style={{ position:'relative' }}>
      {/* scène 3D */}
      <div style={{ position:'fixed', inset:0, zIndex:-1 }}>
        <GalaxyScene cameraPosition={camPos} cameraTarget={camTarget}/>
      </div>

      {/* intro plein écran + flèche */}
      <section style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{
          position:'absolute', bottom:30, left:'50%', transform:'translateX(-50%)',
          opacity:hideUI?0:1, transition:'opacity .5s', pointerEvents:'auto'
        }}>
          <div onClick={()=>scrollTo(0)} style={{ cursor:'pointer', animation:'bounce 2s infinite', padding:20 }}>
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
          <div style={{ textAlign:'center', maxWidth:800, pointerEvents:'auto' }}>
            <h1 style={{
              fontSize:'3rem', color:'#fff', marginBottom:'2rem', fontFamily:"'Orbitron',sans-serif",
              textShadow:'0 0 10px rgba(255,0,0,.5),0 0 20px rgba(0,0,255,.3)'
            }}>
              Odyssey-42 : Voyage vers le Néant
            </h1>
            <Button text="Commencer le voyage" onClick={()=>scrollTo(0)}/>
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
