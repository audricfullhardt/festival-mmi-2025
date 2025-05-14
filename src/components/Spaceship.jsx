import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function Spaceship({ progress }) {
  const { scene } = useGLTF('/models/Space_Shuttle.glb');
  const ref = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const setOpaque = (mat) => {
          mat.transparent = false;
          mat.opacity = 1;
          mat.alphaTest = 0;
          mat.depthWrite = true;
          mat.blending = THREE.NormalBlending;
          mat.side = THREE.FrontSide;
        };
        if (Array.isArray(child.material)) {
          child.material.forEach(setOpaque);
        } else {
          setOpaque(child.material);
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (ref.current) {
      ref.current.position.y = -3 + (progress / 100) * 6;
    }
  }, [progress]);

  return <primitive ref={ref} object={scene} scale={1.5} rotation={[Math.PI / 9, 0, 0.6]} />;
} 