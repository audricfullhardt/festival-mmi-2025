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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
import React from 'react';
import Spaceship from './components/Spaceship';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import ReactDOM from 'react-dom';

const GalaxyScene = forwardRef(({
                                  hideUI = false,
                                  cameraT = 0,
                                  cameraPosition = { x: 3, y: 3, z: 3 },
                                  cameraTarget = { x: 0, y: 0, z: 0 },
                                  currentPlanetIndex = 0,
                                  scrollProgress = 0,
                                  cameraProgress
                                }, ref) => {
  gsap.registerPlugin(TextPlugin);
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();
  const controlsRef = useRef();
  const moonPivotRef = useRef();
  const shield1Ref = useRef();
  const shield2Ref = useRef();
  const icosphereRef = useRef();
  const chrysalisRef = useRef();
  const spaceshipRef = useRef();
  const spaceshipCurveRef = useRef();
  const cameraProgressRef = useRef(cameraProgress);

  const [introDone, setIntroDone] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [creditsOp, setCreditsOp] = useState(0);
  const [creditsSc, setCreditsSc] = useState(1);
  const [textPar, setTextPar] = useState('');
  const [textNames, setTextNames] = useState(['', '', '']);

  const planetCount = 3;
  const PLANET_RADIUS = 40;
  const PLANET_HEIGHT = 2;
  const PLANET_LOOK_OFFSET = 25;

  const planetPositions = Array.from({ length: planetCount }, (_, i) => {
    const angle = (i / (planetCount - 1)) * Math.PI;
    const x = Math.cos(angle) * PLANET_RADIUS;
    const y = PLANET_HEIGHT + Math.sin(angle) * 4;
    const z = Math.sin(angle) * PLANET_RADIUS + PLANET_LOOK_OFFSET;
    return new THREE.Vector3(x, y, z);
  });

  useImperativeHandle(ref, () => ({
    getCamera: () => cameraRef.current,
    getControls: () => controlsRef.current
  }));

  useEffect(() => {
    if (!introDone || !cameraRef.current) return;
    const planetPos = planetPositions[currentPlanetIndex] || planetPositions[0];
    const dir = planetPos.clone().normalize();
    const cameraDistance = 12;
    const cameraPos = planetPos.clone().add(dir.clone().multiplyScalar(cameraDistance));
    gsap.to(cameraRef.current.position, {
      x: cameraPos.x,
      y: cameraPos.y,
      z: cameraPos.z,
      duration: 3,
      ease: 'power3.inOut',
      onUpdate: () => cameraRef.current.lookAt(planetPos)
    });
  }, [currentPlanetIndex, introDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const sizes = { w: window.innerWidth, h: window.innerHeight };

    const camera = new THREE.PerspectiveCamera(75, sizes.w / sizes.h, 0.1, 100);
    camera.position.set(0, 0, 0.1);
    scene.add(camera);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(sizes.w, sizes.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(sizes.w, sizes.h), 0.4, 0.3, 1));
    composer.addPass(new ShaderPass(GammaCorrectionShader));

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enabled = false;
    controlsRef.current = controls;

    createGalaxy(scene);

    const loader = new GLTFLoader();
    const planetFiles = [
      '/models/PianettaRossa.glb',
      '/models/NebulosaAzure.glb',
      '/models/ChrysalisPrime.glb'
    ];

    planetFiles.forEach((path, i) => {
      loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        if (path.includes('PianettaRossa')) {
          const shield1 = model.getObjectByName('Shield1');
          const shield2 = model.getObjectByName('Shield2');
          const sphere = model.getObjectByName('Sphere');
          const moon = model.getObjectByName('Moon');

          if (shield1) {
            shield1.material = new THREE.MeshStandardMaterial({
              color: '#CB99FF',
              transparent: true,
              opacity: 0.3,
              depthWrite: false,
              side: THREE.DoubleSide,
              emissive: '#CB99FF',
              emissiveIntensity: 0.5
            });
            shield1Ref.current = shield1;
          }

          if (shield2) {
            shield2.material = new THREE.MeshStandardMaterial({
              color: '#9882E7',
              transparent: true,
              opacity: 1.0,
              depthWrite: true,
              side: THREE.DoubleSide,
              emissive: '#9882E7',
              emissiveIntensity: 0.5
            });
            shield2Ref.current = shield2;
          }

          if (sphere) {
            sphere.material = new THREE.MeshStandardMaterial({
              color: '#ffffff',
              emissive: '#ffffff',
              emissiveIntensity: 4,
              roughness: 0.2,
              metalness: 0.1
            });
            sphere.layers.enable(1);
            camera.layers.enable(1);
          }

          if (sphere && moon) {
            const pivot = new THREE.Group();
            pivot.position.copy(sphere.position);
            moon.position.sub(sphere.position);
            pivot.add(moon);
            model.add(pivot);
            moonPivotRef.current = pivot;
          }
        }

        if (path.includes('NebulosaAzure')) {
          const icosphere = model.getObjectByName('Icosphere');
          if (icosphere) icosphereRef.current = icosphere;

          const dirLight = new THREE.DirectionalLight(0xffffff, 2);
          dirLight.position.set(5, 10, 5);
          dirLight.castShadow = true;
          dirLight.shadow.mapSize.set(1024, 1024);
          dirLight.shadow.bias = -0.001;

          const ambient = new THREE.AmbientLight(0xffffff, 0.4);
          model.add(dirLight, ambient);
        }

        if (path.includes('ChrysalisPrime')) {
          chrysalisRef.current = model;
        }

        model.position.copy(planetPositions[i]);
        model.scale.set(1.5, 1.5, 1.5);
        scene.add(model);
      });
    });

    // Générer la courbe du vaisseau à partir des positions des planètes
    // Calculer la direction d'entrée et de sortie pour ajouter un point avant et après
    let points = [];
    if (planetPositions.length >= 2) {
      // Point de départ : éloigné à droite de la première planète (axe X positif)
      const start = planetPositions[0].clone().add(new THREE.Vector3(12, 0, 0));
      points.push(start);
      // Points des planètes
      planetPositions.forEach(p => points.push(p.clone()));
      // Direction de l'avant-dernière vers la dernière planète
      const n = planetPositions.length;
      const dirEnd = planetPositions[n-1].clone().sub(planetPositions[n-2]).normalize();
      // Point d'arrivée : devant la dernière planète (dans l'axe de sortie)
      const end = planetPositions[n-1].clone().add(dirEnd.clone().multiplyScalar(10));
      points.push(end);
    }
    const shipCurve = new THREE.CatmullRomCurve3(points);
    spaceshipCurveRef.current = shipCurve;

    const cameraTarget = new THREE.Vector3(0, 0, 0);
    camera.lookAt(cameraTarget);

    const names = ['Jules CREVOISIER', 'Audric FULLHARDT', 'Gabriel MAILLARD'];

    const intro = () => {
      gsap.to(camera.position, {
        x: 0.5, y: 0.2, z: 0.5,
        duration: 2,
        ease: 'power1.inOut',
        onComplete: () => {
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
          setTimeout(() => {
            setTextPar('par');
            setTimeout(() => setTextNames([names[0], '', '']), 600);
            setTimeout(() => setTextNames([names[0], names[1], '']), 1200);
            setTimeout(() => setTextNames(names), 1800);
          }, 800);
          setTimeout(() => {
            gsap.to(camera.position, {
              x: 3, y: 3, z: 3,
              duration: 5,
              ease: 'power3.out',
              onComplete: () => {
                setTimeout(() => {
                  setIntroDone(true);
                  setShowCredits(false);
                  window.dispatchEvent(new CustomEvent('galaxyAnimationComplete'));
                }, 150);
              }
            });
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
            gsap.to(cameraTarget, {
              x: 0.5, y: 0.2,
              duration: 7,
              ease: 'power1.inOut'
            });
          }, 4500);
        }
      });
    };
    intro();

    let id;
    const tick = () => {
      if (!introDone) controls.update();
      if (moonPivotRef.current) moonPivotRef.current.rotation.y += 0.0015;
      if (shield1Ref.current) shield1Ref.current.rotation.z += 0.003;
      if (shield2Ref.current) shield2Ref.current.rotation.z -= 0.003;
      if (icosphereRef.current) icosphereRef.current.rotation.y += 0.002;
      if (chrysalisRef.current) chrysalisRef.current.rotation.y += 0.002;

      // Suivi caméra third-person attaché au vaisseau (à chaque frame)
      if (spaceshipCurveRef.current && introDone && cameraRef.current) {
        const t = Math.min(Math.max(typeof cameraProgressRef.current !== 'undefined' ? cameraProgressRef.current : scrollProgress, 0.01), 0.99);
        const curve = spaceshipCurveRef.current;
        const pos = curve.getPoint(t);
        const tangent = curve.getTangent(t).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const side = new THREE.Vector3().crossVectors(up, tangent).normalize();
        const upReal = new THREE.Vector3().crossVectors(tangent, side).normalize();
        // Position caméra : derrière et au-dessus du vaisseau
        const cameraDistance = 7;
        const cameraHeight = 2.5;
        const cameraPos = pos
          .clone()
          .add(upReal.clone().multiplyScalar(cameraHeight))
          .add(tangent.clone().multiplyScalar(-cameraDistance));
        cameraRef.current.position.copy(cameraPos);
        // La caméra regarde un point devant le vaisseau
        const lookAt = pos.clone().add(tangent.clone().multiplyScalar(8));
        cameraRef.current.lookAt(lookAt);
      }

      composer.render();
      id = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      sizes.w = window.innerWidth;
      sizes.h = window.innerHeight;
      camera.aspect = sizes.w / sizes.h;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.w, sizes.h);
      composer.setSize(sizes.w, sizes.h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // Ajout d'un champ d'astéroïdes
    const asteroidFiles = [
      '/models/asteroid1.glb',
      '/models/asteroid2.glb',
      '/models/asteroid3.glb'
    ];
    const asteroidCount = 40;
    for (let i = 0; i < asteroidCount; i++) {
      const file = asteroidFiles[Math.floor(Math.random() * asteroidFiles.length)];
      const loader = new GLTFLoader();
      loader.load(file, (gltf) => {
        const asteroid = gltf.scene;
        // Position aléatoire dans la galaxie, mais évite le centre
        const radius = 35 + Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 10;
        asteroid.position.set(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        );
        const s = 0.7 + Math.random() * 1.2;
        asteroid.scale.set(s, s, s);
        asteroid.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        scene.add(asteroid);
      });
    }

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  useEffect(() => { cameraProgressRef.current = cameraProgress; }, [cameraProgress]);

  // Composant pour synchroniser la caméra react-three-fiber avec la caméra principale Three.js
  function SyncedCamera({ mainCamera }) {
    const { camera } = useThree();
    useFrame(() => {
      if (mainCamera) {
        camera.position.copy(mainCamera.position);
        camera.quaternion.copy(mainCamera.quaternion);
        camera.fov = mainCamera.fov;
        camera.updateProjectionMatrix();
      }
    });
    return null;
  }

  return (
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <canvas ref={canvasRef} className="webgl" style={{ pointerEvents: 'none' }} />
        {/* Overlay react-three-fiber pour le vaisseau et son trail */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
          <Canvas gl={{ alpha: true }} style={{ width: '100vw', height: '100vh', background: 'transparent', pointerEvents: 'none' }}>
            <SyncedCamera mainCamera={cameraRef.current} />
            <ambientLight intensity={0.7} />
            {introDone && <Spaceship progress={scrollProgress * 100} scale={1} galaxyCurve={spaceshipCurveRef.current} />}
          </Canvas>
        </div>
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
              <p style={{ fontSize: '2rem', margin: 0, letterSpacing: 2 }}>
                <span className="glow">{textPar}</span><br />
                <span
                    style={{
                      fontSize: '2.5rem',
                      background: 'linear-gradient(#fff,#a0a0ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                >
              <span className="glow">{textNames[0]}</span><br />
              <span className="glow">{textNames[1]}</span><br />
              <span className="glow">{textNames[2]}</span>
            </span>
              </p>
            </div>
        )}
      </div>
  );
});

export default GalaxyScene;
