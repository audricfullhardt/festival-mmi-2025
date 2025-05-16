import {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle
  } from 'react';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { createGalaxy } from './galaxy';
  import { gsap } from 'gsap';
  import { TextPlugin } from 'gsap/TextPlugin';
  
  const GalaxyScene = forwardRef(
    (
      {
        hideUI = false,                              // conservé si besoin
        cameraPosition = { x: 3, y: 3, z: 3 },       // MAJ par App
        cameraTarget = { x: 0, y: 0, z: 0 }          // Ajouté pour recevoir la target depuis App
      },
      ref
    ) => {
      gsap.registerPlugin(TextPlugin);
  
      /* refs & états -------------------------------------------------- */
      const canvasRef   = useRef();
      const cameraRef   = useRef();
      const controlsRef = useRef();
      const targetRef   = useRef(new THREE.Vector3());
  
      const [introDone,   setIntroDone]   = useState(false);
      const [showCredits, setShowCredits] = useState(false);
      const [creditsOp,   setCreditsOp]   = useState(0);
      const [creditsSc,   setCreditsSc]   = useState(1);
      const [textPar,     setTextPar]     = useState('');
      const [textNames,   setTextNames]   = useState(['', '', '']);
  
      /* exposer cam & controls --------------------------------------- */
      useImperativeHandle(ref, () => ({
        getCamera:   () => cameraRef.current,
        getControls: () => controlsRef.current
      }));
  
      /* MAJ position / look-ahead après intro ------------------------ */
      useEffect(() => {
        if (!introDone || !cameraRef.current) return;
  
        /* position */
        gsap.to(cameraRef.current.position, {
          ...cameraPosition,
          duration: 0.9,
          ease: 'power2.out'
        });
  
        /* Utiliser directement cameraTarget si fourni */
        if (cameraTarget) {
          targetRef.current.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
        } else {
          /* look-ahead (fallback) */
          const last = cameraRef.current.userData.lastPos || cameraPosition;
          const dir = new THREE.Vector3(
            cameraPosition.x - last.x,
            cameraPosition.y - last.y,
            cameraPosition.z - last.z
          );
          if (dir.length() > 0.01) dir.normalize();
          const ahead = {
            x: cameraPosition.x + dir.x * 2,
            y: cameraPosition.y + dir.y * 2,
            z: cameraPosition.z + dir.z * 2
          };
          targetRef.current.set(ahead.x, ahead.y, ahead.z);
        }
        cameraRef.current.userData.lastPos = { ...cameraPosition };
      }, [cameraPosition, cameraTarget, introDone]);
  
      /* INIT THREE ---------------------------------------------------- */
      useEffect(() => {
        const canvas = canvasRef.current;
        const scene  = new THREE.Scene();
  
        /* camera & renderer */
        const sizes = { w: window.innerWidth, h: window.innerHeight };
        const camera = new THREE.PerspectiveCamera(75, sizes.w / sizes.h, 0.1, 100);
        camera.position.set(0, 0, 0.1);
        scene.add(camera);
        cameraRef.current = camera;
  
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setSize(sizes.w, sizes.h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
        /* controls */
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.enabled       = false;
        controlsRef.current    = controls;
  
        /* galaxie */
        createGalaxy(scene);
  
        /* ---------------- intro (code d'origine) -------------------- */
        const cameraTarget = new THREE.Vector3(0, 0, 0);
        camera.lookAt(cameraTarget);
  
        const names = ['Jules Crevoisier', 'Audric FULLHARDT', 'Gabriel MAILLARD'];
  
        const intro = () => {
          gsap.to(camera.position, {
            x: 0.5, y: 0.2, z: 0.5,
            duration: 2,
            ease: 'power1.inOut',
            onComplete: () => {
              /* crédits IN */
              setShowCredits(true);
              gsap.to({ p: 0 }, {
                p: 1,
                duration: 1.2,
                ease: 'none',
                onUpdate() {
                  const p = this.targets()[0].p;
                  setCreditsOp(p);
                  setCreditsSc(0.7 + p * 0.3);
                }
              });
              /* texte 'par' + noms */
              setTimeout(() => {
                setTextPar('par');
                setTimeout(() => setTextNames([names[0], '', '']), 600);
                setTimeout(() => setTextNames([names[0], names[1], '']), 1200);
                setTimeout(() => setTextNames(names), 1800);
              }, 800);
  
              /* pause 4.5 s puis grand dézoom */
              setTimeout(() => {
                // Animer vers la position finale de l'intro
                gsap.to(camera.position, {
                  x: 3, y: 3, z: 3,
                  duration: 5,
                  ease: 'power3.out',
                  onStart: () =>
                    setTimeout(
                      () => window.dispatchEvent(new CustomEvent('galaxyAnimation50Percent')),
                      2250
                    ),
                  onUpdate: () => {
                    camera.lookAt(0, 0, 0);
                  },
                  onComplete: () => {
                    setTimeout(() => {
                      setIntroDone(true);
                      setShowCredits(false);
                      window.dispatchEvent(new CustomEvent('galaxyAnimationComplete'));
                    }, 150);
                  }
                });
  
                /* crédits OUT */
                gsap.to({ p: 0 }, {
                  p: 1,
                  duration: 2.5,
                  ease: 'none',
                  onUpdate() {
                    const p = this.targets()[0].p;
                    setCreditsSc(1 - p * 0.5);
                    if (p > 0.7) setCreditsOp(1 - (p - 0.7) / 0.3);
                  }
                });
  
                /* légère rotation de visée */
                gsap.to(cameraTarget, {
                  x: 0.5, y: 0.2,
                  duration: 7,
                  ease: 'power1.inOut',
                  onUpdate: () => camera.lookAt(cameraTarget)
                });
              }, 4500);
            }
          });
        };
        intro();
  
        /* render loop ------------------------------------------------- */
        let id;
        const tick = () => {
          if (introDone) {
            // En mode défilement, la caméra pointe vers la cible calculée
            camera.lookAt(targetRef.current);
          } else {
            // Pendant l'intro, on laisse l'animation GSAP contrôler la caméra
            // Mais on s'assure que les contrôles sont à jour (bien que désactivés)
            controls.update();
          }
          renderer.render(scene, camera);
          id = requestAnimationFrame(tick);
        };
        tick();
  
        /* resize */
        const onResize = () => {
          sizes.w = window.innerWidth;
          sizes.h = window.innerHeight;
          camera.aspect = sizes.w / sizes.h;
          camera.updateProjectionMatrix();
          renderer.setSize(sizes.w, sizes.h);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', onResize);
  
        return () => {
          cancelAnimationFrame(id);
          window.removeEventListener('resize', onResize);
          controls.dispose();
          renderer.dispose();
          scene.clear();
        };
      }, []);
  
      /* JSX ----------------------------------------------------------- */
      return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
          <canvas ref={canvasRef} className="webgl" style={{ pointerEvents: 'none' }} />
  
          {showCredits && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${creditsSc})`,
                color: 'white',
                textAlign: 'center',
                fontFamily: "'Orbitron', sans-serif",
                opacity: creditsOp,
                zIndex: 1000
              }}
            >
              <style>{`
                @keyframes glow{0%{text-shadow:0 0 5px #fff}50%{text-shadow:0 0 15px #fff}100%{text-shadow:0 0 5px #fff}}
                .glow{animation:glow 2s infinite}
              `}</style>
              <p style={{ fontSize: '2rem', margin: 0, letterSpacing: 2 }}>
                <span className="glow">{textPar}</span><br/>
                <span
                  style={{
                    fontSize: '2.5rem',
                    background: 'linear-gradient(#fff,#a0a0ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  <span className="glow">{textNames[0]}</span><br/>
                  <span className="glow">{textNames[1]}</span><br/>
                  <span className="glow">{textNames[2]}</span>
                </span>
              </p>
            </div>
          )}
        </div>
      );
    }
  );
  
  export default GalaxyScene;
  