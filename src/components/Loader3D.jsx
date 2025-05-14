import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './Loader.css';

function GalaxyPoints() {
  // Paramètres similaires à ceux de galaxy.js
  const parameters = useMemo(() => ({
    count: 20000, // moins de points pour le loader
    size: 0.018,
    radius: 200,
    branches: 8,
    spin: 5,
    randomness: 2,
    randomnessPower: 3,
    insideColor: '#6e58ad',
    outsideColor: '#8808dd',
  }), []);

  // Génération des positions et couleurs
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);
    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      const mixedColor = colorInside.clone().lerp(colorOutside, radius / parameters.radius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    return { positions, colors };
  }, [parameters]);

  const circleTexture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <points>
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

function Rocket({ progress }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = -3 + (progress / 100) * 6;
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 1.2, 32]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.2, 0.4, 32]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[-0.18, -0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.05, 0.3, 0.15]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <mesh position={[0.18, -0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.05, 0.3, 0.15]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <coneGeometry args={[0.1, 0.3, 16]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f39c12" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

const Loader3D = ({ progress, fadeOut }) => (
  <div className={`loader-container${fadeOut ? ' fade-out' : ''}`}>
    <div className="loader3d-canvas-wrapper">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <GalaxyPoints />
        <Rocket progress={progress} />
      </Canvas>
    </div>
    <div className="loader3d-percentage">{progress}%</div>
  </div>
);

export default Loader3D; 