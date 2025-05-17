import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function ChrysalisPrime(props) {
    const { scene } = useGLTF('/models/ChrysalisPrime.glb');
    const ref = useRef();

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.2;
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
