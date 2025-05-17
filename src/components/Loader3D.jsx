import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Spaceship from './Spaceship';
import './Loader.css';

function GalaxyPoints() {
  const parameters = useMemo(() => ({
    count: 150000, // Augmentation significative du nombre de particules
    size: 0.012, // Taille légèrement réduite pour compenser la densité
    radius: 350, // Rayon augmenté pour une meilleure distribution
    branches: 16, // Plus de branches pour une meilleure distribution
    spin: 10, // Spin augmenté pour plus de dynamisme
    randomness: 3, // Plus de variation dans la distribution
    randomnessPower: 3.5, // Puissance de randomisation augmentée
    insideColor: '#6e58ad',
    outsideColor: '#8808dd',
    nebulaColor: '#ff00ff',
  }), []);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);
    const colorNebula = new THREE.Color(parameters.nebulaColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
      
      // Distribution plus aléatoire des points
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Mélange de couleurs plus complexe avec plus de zones
      const mixedColor = new THREE.Color();
      if (radius < parameters.radius * 0.2) {
        mixedColor.copy(colorInside);
      } else if (radius < parameters.radius * 0.4) {
        mixedColor.copy(colorNebula).lerp(colorInside, 0.5);
      } else if (radius < parameters.radius * 0.7) {
        mixedColor.copy(colorNebula);
      } else {
        mixedColor.copy(colorOutside);
      }

      // Variation de luminosité plus subtile
      const brightness = 0.7 + Math.random() * 0.5;
      mixedColor.multiplyScalar(brightness);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    return { positions, colors };
  }, [parameters]);

  const circleTexture = useMemo(() => {
    const size = 64; // Taille réduite pour de meilleures performances
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Point plus petit mais toujours doux
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const pointsRef = useRef();
  
  useFrame((state) => {
    if (pointsRef.current) {
      // Rotation plus lente pour compenser la densité
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={parameters.size}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        map={circleTexture}
        alphaTest={0.5}
        transparent
      />
    </points>
  );
}

const Loader3D = ({ progress, fadeOut }) => (
  <div className={`loader-container${fadeOut ? ' fade-out' : ''}`}>
    <div className="loader3d-canvas-wrapper">
      <Canvas camera={{ position: [0, 0, 5], fov: 80 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <GalaxyPoints />
        <Spaceship progress={progress} />
      </Canvas>
    </div>
    <div className="loader3d-percentage">
      <div className="percentage-digits">
        {Math.round(progress).toString().padStart(3, '0').split('').map((digit, index) => (
          <span key={index} className="digit">{digit}</span>
        ))}
      </div>
    </div>
  </div>
);

export default Loader3D; 