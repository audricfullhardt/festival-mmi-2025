import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function PianettaRossa(props) {
    const { scene } = useGLTF('/models/PianettaRossa.glb');
    const ref = useRef();
    const shield1Ref = useRef();
    const shield2Ref = useRef();
    const moonPivotRef = useRef();
    const { camera } = useThree();

    useEffect(() => {
        const materialShield1 = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#CB99FF'),
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
            side: THREE.DoubleSide,
            emissive: new THREE.Color('#CB99FF'),
            emissiveIntensity: 0.5
        });

        const materialShield2 = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#9882E7'),
            transparent: true,
            opacity: 1.0,
            depthWrite: true,
            side: THREE.DoubleSide,
            emissive: new THREE.Color('#9882E7'),
            emissiveIntensity: 0.5
        });

        const shield1 = scene.getObjectByName('Shield1');
        if (shield1 && shield1.isMesh) {
            shield1.material = materialShield1;
            shield1Ref.current = shield1;
        }

        const shield2 = scene.getObjectByName('Shield2');
        if (shield2 && shield2.isMesh) {
            shield2.material = materialShield2;
            shield2Ref.current = shield2;
        }

        const sphere = scene.getObjectByName('Sphere');
        const moon = scene.getObjectByName('Moon');

        if (sphere && moon && sphere.isMesh && moon.isMesh) {
            const pivot = new THREE.Group();
            pivot.position.copy(sphere.position);

            moon.position.sub(sphere.position);
            pivot.add(moon);

            scene.add(pivot);
            moonPivotRef.current = pivot;
        }

        if (sphere && sphere.isMesh) {
            sphere.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#ffffff'),
                emissive: new THREE.Color('#ffffff'),
                emissiveIntensity: 4,
                roughness: 0.2,
                metalness: 0.1
            });
            sphere.layers.enable(1);
            camera.layers.enable(1);
        }

    }, [scene, camera]);

    useFrame((_, delta) => {
        if (shield1Ref.current) {
            shield1Ref.current.rotation.z += delta * 0.3;
        }
        if (shield2Ref.current) {
            shield2Ref.current.rotation.z -= delta * 0.3;
        }
        if (moonPivotRef.current) {
            moonPivotRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={1}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            {...props}
        />
    );
}
