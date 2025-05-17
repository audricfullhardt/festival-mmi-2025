import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import TiltCard from './TiltCard';
import PlanetSpec from './PlanetSpec';
import NebulosaAzure from "./NebulosaAzure";
import PianettaRossa from "./PianettaRossa";
import ChrysalisPrime from "./ChrysalisPrime";

// Composant pour les étoiles
function Stars() {
    const starsRef = useRef();
    const starsCount = 200;

    const positions = useMemo(() => {
        const positions = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = (Math.random() - 0.5) * 30;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;
        }
        return positions;
    }, [starsCount]);

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.1} color="#ffffff" />
        </points>
    );
}

const PlanetSection = ({
                           planetName,
                           planetDescription,
                           cardTitle,
                           cardContent,
                           index,
                           isLast,
                           onNavigateNext,
                           invertLayout,
                           isVisible
                       }) => {
    const [hovered, setHovered] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const sectionRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => setAnimateIn(true), 100);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
        }
    }, [isVisible]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !animateIn) {
                    setTimeout(() => setAnimateIn(true), 200);
                }
            },
            { threshold: 0.4 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={sectionRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexDirection: invertLayout ? 'row-reverse' : 'row'
            }}
        >
            {/* Scène 3D */}
            <div
                style={{
                    width: '50%',
                    height: '100%',
                    position: 'relative',
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn
                        ? 'translateX(0)'
                        : `translateX(${invertLayout ? '-' : ''}100px)`,
                    transition: 'opacity 1.2s ease-out, transform 1.5s ease-out',
                    transitionDelay: '0.1s'
                }}
            >
                <Canvas shadows camera={{ position: [0, 0, 10], fov: 40 }} style={{ width: '100%', height: '100%' }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight
                        position={[5, 10, 5]}
                        intensity={2}
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                        shadow-bias={-0.001}
                    />
                    <Stars />

                    {/* Sol pour recevoir les ombres */}
                    <mesh
                        receiveShadow
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, -1.5, 0]}
                    >
                        <planeGeometry args={[50, 50]} />
                        <shadowMaterial transparent opacity={0.25} />
                    </mesh>

                    {index === 0 ? (
                        <PianettaRossa />
                    ) : index === 1 ? (
                        <NebulosaAzure />
                    ) : (
                        <ChrysalisPrime />
                    )}

                    <OrbitControls
                        ref={controlsRef}
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={true}
                    />


                    <EffectComposer>
                        {index === 0 && (
                            <Bloom
                            mipmapBlur
                            intensity={1.5}
                            luminanceThreshold={1}
                            luminanceSmoothing={1}
                        />)}
                    </EffectComposer>
                </Canvas>

                {/* Spécifications de la planète */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    [invertLayout ? 'right' : 'left']: hovered ? '60%' : '55%',
                    transform: 'translateY(-50%)',
                    opacity: hovered ? 1 : 0,
                    transition: 'all 0.3s ease-in-out'
                }}>
                    <PlanetSpec title={planetName} text={planetDescription} />
                </div>
            </div>

            {/* Carte d'informations */}
            <div
                style={{
                    width: '40%',
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn
                        ? 'translateX(0)'
                        : `translateX(${invertLayout ? '' : '-'}100px)`,
                    transition: 'opacity 1.2s ease-out, transform 1.5s ease-out',
                    transitionDelay: '0.4s'
                }}
            >
                <TiltCard title={cardTitle} content={cardContent} />
            </div>

            {/* Flèche vers la section suivante */}
            {!isLast && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '30px',
                        left: '50%',
                        transform: `translateX(-50%) ${animateIn ? 'translateY(0)' : 'translateY(30px)'}`,
                        cursor: 'pointer',
                        zIndex: 10,
                        opacity: animateIn ? 1 : 0,
                        transition: 'opacity 1s ease-out, transform 1s ease-out',
                        transitionDelay: '0.8s'
                    }}
                    onClick={onNavigateNext}
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 5V19M12 19L5 12M12 19L19 12"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default PlanetSection;
