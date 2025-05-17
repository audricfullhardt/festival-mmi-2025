import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Spaceship({ progress }) {
  const { scene } = useGLTF('/models/vaisseau.glb');
  const gradientTexture = useTexture('/models/TraiGradient.png');
  const spaceshipRef = useRef();
  const animationTime = useRef(0);

  gradientTexture.flipY = false;
  gradientTexture.wrapS = THREE.RepeatWrapping;
  gradientTexture.wrapT = THREE.RepeatWrapping;

  const shipInternalTrailMaterial = new THREE.MeshStandardMaterial({
    map: gradientTexture,
    alphaMap: gradientTexture,
    emissive: new THREE.Color(0xffaa00), // Un peu plus jaune
    emissiveMap: gradientTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  useEffect(() => {
    const internalTrailNames = ['BigTrail', 'SmallTrail1', 'SmallTrail2'];
    scene.traverse((child) => {
      if (child.isMesh && internalTrailNames.includes(child.name)) {
        child.material = shipInternalTrailMaterial;
      }
    });
  }, [scene, shipInternalTrailMaterial]);

  useFrame((state, delta) => {
    animationTime.current += 0.006;
    gradientTexture.offset.x = 1 - (animationTime.current % 1);
  });

  useEffect(() => {
    if (spaceshipRef.current) {
      const p0 = new THREE.Vector3(-14, 10, 0);
      const p1 = new THREE.Vector3(0, -7, 0);
      const p2 = new THREE.Vector3(0, -6, 0);
      const p3 = new THREE.Vector3(8, 8, 0);
      const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      const t = progress / 100;
      const position = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const angle = Math.atan2(tangent.y, tangent.x);
      spaceshipRef.current.position.copy(position);
      const startRotationY = Math.PI / 3;
      const endRotationY = Math.PI / 2;
      const currentRotationY = startRotationY + t * (endRotationY - startRotationY);
      spaceshipRef.current.rotation.set(0, currentRotationY, -angle);
    }
  }, [progress]);

  return (
    <primitive
      ref={spaceshipRef}
      object={scene}
      scale={0.6}
    />
  );
}
