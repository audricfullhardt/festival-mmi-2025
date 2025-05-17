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

const GalaxyScene = forwardRef(({
                                  hideUI = false,
                                  cameraT = 0,
                                  cameraPosition = { x: 3, y: 3, z: 3 },
                                  cameraTarget = { x: 0, y: 0, z: 0 },
                                  currentPlanetIndex = 0
                                }, ref) => {
  gsap.registerPlugin(TextPlugin);
  const canvasRef = useRef();
  const cameraRef = useRef();
  const controlsRef = useRef();
  const moonPivotRef = useRef();
  const shield1Ref = useRef();
  const shield2Ref = useRef();
  const icosphereRef = useRef();
  const chrysalisRef = useRef();

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

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

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
