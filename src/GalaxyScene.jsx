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
  import React from 'react';
  
  // Composant Planet (amélioré pour scale dynamique)
  function Planet({ color, index, position, isFocused, meshRef }) {
    // Couleurs pour chaque planète
    const planetColors = [
      '#ff5a5a',  // Rouge
      '#5a7aff',  // Bleu
      '#5affaa'   // Vert-bleu
    ];
    // Low poly params
    const getLowPolyParams = (idx) => {
      const params = [
        { segments: 16, detail: 0 },
        { segments: 12, detail: 0 },
        { segments: 8, detail: 0 }
      ];
      return params[idx] || params[0];
    };
    const lowPolyParams = getLowPolyParams(index);
    useEffect(() => {
      if (meshRef && meshRef.current) {
        gsap.to(meshRef.current.scale, {
          x: isFocused ? 1.5 : 1,
          y: isFocused ? 1.5 : 1,
          z: isFocused ? 1.5 : 1,
          duration: 0.7,
          ease: 'power2.out'
        });
      }
    }, [isFocused, meshRef]);
    return (
      <group position={position}>
        {/* Planète principale, taille augmentée */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[4, lowPolyParams.detail]} />
          <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.5} clearcoat={0.5} emissive={color} emissiveIntensity={0.15} />
        </mesh>
        {/* Glow autour */}
        <mesh>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} />
        </mesh>
      </group>
    );
  }
  
  // Ajoute un label 3D (toujours face caméra) au-dessus de chaque planète
  function PlanetLabel({ text, position }) {
    // Canvas texture pour le texte
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 32px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, 128, 32);
    const texture = new THREE.CanvasTexture(canvas);
    return (
      <sprite position={[position.x, position.y + 7, position.z]} scale={[7, 1.8, 1]}>
        <spriteMaterial attach="material" map={texture} transparent opacity={0.95} />
      </sprite>
    );
  }
  
  const GalaxyScene = forwardRef(
    (
      {
        hideUI = false,                              // conservé si besoin
        cameraT = 0, // Ajout : t de 0 à 1 pour la position de la caméra sur la courbe
        cameraPosition = { x: 3, y: 3, z: 3 },       // MAJ par App
        cameraTarget = { x: 0, y: 0, z: 0 },          // Ajouté pour recevoir la target depuis App
        currentPlanetIndex = 0 // Ajout : index planète courante pour l'anneau
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
  
      // Nouvelle distribution des planètes (arc de cercle dans l'espace)
      const planetCount = 3;
      const PLANET_RADIUS = 18; // Distance du centre
      const PLANET_HEIGHT = 2;
      const PLANET_LOOK_OFFSET = 10; // Distance entre la courbe et la planète
      const planetBasePositions = Array.from({length: planetCount}, (_, i) => {
        const angle = (i / (planetCount - 1)) * Math.PI; // arc de cercle
        const x = Math.cos(angle) * PLANET_RADIUS;
        const y = PLANET_HEIGHT + Math.sin(angle) * 4;
        const z = Math.sin(angle) * PLANET_RADIUS + PLANET_LOOK_OFFSET;
        return new THREE.Vector3(x, y, z);
      });
      // La courbe de la caméra passe devant chaque planète (décalée sur Z)
      const cameraCurve = new THREE.CatmullRomCurve3(
        planetBasePositions.map(p => new THREE.Vector3(p.x, p.y, p.z - PLANET_LOOK_OFFSET)),
        false, 'catmullrom', 0.5
      );
      const planetPositions = planetBasePositions;
  
      // Ajout : noms des planètes (doit matcher App.js)
      const planetNames = ['Pianeta Rossa', 'Nebulosa Azure', 'Chrysalis Prime'];
  
      // Dans GalaxyScene, crée un tableau de refs pour les planètes
      const planetMeshRefs = useRef(Array.from({length: planetPositions.length}, () => React.createRef()));
  
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
  
        // Lumière directionnelle forte
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
        dirLight.position.set(10, 20, 20);
        scene.add(dirLight);
  
        // Ajout : planètes dans la scène
        planetPositions.forEach((pos, i) => {
          // Planète
          const planet = new THREE.Mesh(
            new THREE.IcosahedronGeometry(4, [0, 0, 0][i] || 0),
            new THREE.MeshPhysicalMaterial({ color: ['#ff5a5a', '#5a7aff', '#5affaa'][i], metalness: 0.4, roughness: 0.5, clearcoat: 0.5, emissive: ['#ff5a5a', '#5a7aff', '#5affaa'][i], emissiveIntensity: 0.15 })
          );
          planet.position.copy(pos);
          scene.add(planet);
          // Glow
          const glow = new THREE.Mesh(
            new THREE.SphereGeometry(4.5, 32, 32),
            new THREE.MeshBasicMaterial({ color: ['#ff5a5a', '#5a7aff', '#5affaa'][i], transparent: true, opacity: 0.18 })
          );
          glow.position.copy(pos);
          scene.add(glow);
          // Label (rendu React)
        });
  
        /* ---------------- intro (code d'origine) -------------------- */
        const cameraTarget = new THREE.Vector3(0, 0, 0);
        camera.lookAt(cameraTarget);
  
        const names = ['Jules CREVOISIER', 'Audric FULLHARDT', 'Gabriel MAILLARD'];
  
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
                });
              }, 4500);
            }
          });
        };
        intro();
  
        /* render loop ------------------------------------------------- */
        let id;
        const CAMERA_OFFSET = 0.07; // Ajuste pour le recul souhaité
        const tick = () => {
          if (introDone) {
            const t = Math.max(0, Math.min(1, cameraT));
            const tCam = Math.max(0, t - CAMERA_OFFSET);
            const pos = cameraCurve.getPoint(tCam);
            camera.position.copy(pos);
            // Trouver l'étape la plus proche
            let closestIdx = 0, minDist = 1;
            const planetTs = planetPositions.length === 1 ? [0] : Array.from({length: planetPositions.length}, (_, i) => i/(planetPositions.length-1));
            planetTs.forEach((pt, i) => {
              const d = Math.abs(pt - t);
              if (d < minDist) { minDist = d; closestIdx = i; }
            });
            const lookAt = planetPositions[closestIdx];
            camera.lookAt(lookAt);
            // Anime la scale de la planète courante
            planetMeshRefs.current.forEach((ref, i) => {
              if (ref.current) {
                gsap.to(ref.current.scale, {
                  x: i === closestIdx ? 1.5 : 1,
                  y: i === closestIdx ? 1.5 : 1,
                  z: i === closestIdx ? 1.5 : 1,
                  duration: 0.7,
                  ease: 'power2.out'
                });
              }
            });
          } else {
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
      }, [currentPlanetIndex]);
  
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
  
          {/* Labels React (toujours face caméra) */}
          {planetPositions.map((pos, i) => (
            <PlanetLabel key={i} text={planetNames[i]} position={pos} />
          ))}
        </div>
      );
    }
  );
  
  export default GalaxyScene;
  