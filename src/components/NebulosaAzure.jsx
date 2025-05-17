import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function NebulosaAzure(props) {
    const { scene } = useGLTF('/models/NebulosaAzure.glb');
    const ref = useRef();
    const icosphereRef = useRef();
    const lightsRef = useRef([]);

    useEffect(() => {
        const icosphere = scene.getObjectByName('Icosphere');
        if (icosphere) {
            icosphereRef.current = icosphere;
        }

        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        //LE MODELE ETANT TROP SOMBRE JE RAJOUTE DES LUMIÈRES
        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(1024, 1024);
        dirLight.shadow.bias = -0.001;

        const ambient = new THREE.AmbientLight(0xffffff, 0.4);

        scene.add(dirLight, ambient);
        lightsRef.current = [dirLight, ambient];
    }, [scene]);

    useFrame((_, delta) => {
        if (icosphereRef.current) {
            icosphereRef.current.rotation.y += delta * 0.2;
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
            onPointerOver={props.onPointerOver}
            onPointerOut={props.onPointerOut}
        />
    );
}
