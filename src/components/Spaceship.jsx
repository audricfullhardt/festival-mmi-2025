import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Spaceship({ progress }) {
  const { scene } = useGLTF('/models/vaisseau.glb');
  const gradientTexture = useTexture('/models/TraiGradient.png');
  const ref = useRef();
  const time = useRef(0);

  gradientTexture.flipY = false;
  gradientTexture.wrapS = THREE.RepeatWrapping;
  gradientTexture.wrapT = THREE.RepeatWrapping;

//MATERIAL PERSONNALISÉ POUR LA TRAINEE
  const trailMaterial = new THREE.MeshStandardMaterial({
    map: gradientTexture,
    alphaMap: gradientTexture,
    emissive: new THREE.Color(0xff9900),
    emissiveMap: gradientTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  useEffect(() => {
    const trailNames = ['BigTrail', 'SmallTrail1', 'SmallTrail2']; //MODELES QUI ONT LA TRAINEE SUR BLENDER
    scene.traverse((child) => {
      if (child.isMesh && trailNames.includes(child.name)) {
        child.material = trailMaterial;
      }
    });
  }, [scene, trailMaterial]);

  useFrame(() => {
    time.current += 0.006;
    gradientTexture.offset.x = 1 - (time.current % 1);
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.position.y = -3 + (progress / 100) * 6;
    }
  }, [progress]);

  return (
      <primitive
          ref={ref}
          object={scene}
          scale={0.6}
          rotation={[Math.PI / -2, 0, Math.PI]}
      />
  );
}
