import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createGalaxy } from './galaxy'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import Button from './components/Button.jsx'

const GalaxyScene = forwardRef(({ hideUI = false, cameraPosition = { x: 3, y: 3, z: 3 } }, ref) => {
    // Initialiser TextPlugin de GSAP
    gsap.registerPlugin(TextPlugin);
    
    const canvasRef = useRef()
    const cameraRef = useRef()
    const controlsRef = useRef()
    const [animationStarted, setAnimationStarted] = useState(false)
    const [showCredits, setShowCredits] = useState(false)
    const [showTitle, setShowTitle] = useState(false)
    const [creditsOpacity, setCreditsOpacity] = useState(0)
    const [creditsScale, setCreditsScale] = useState(1)
    const [textPar, setTextPar] = useState('')
    const [textNames, setTextNames] = useState(['', '', ''])
    const [initialAnimationComplete, setInitialAnimationComplete] = useState(false)

    // Exposer certaines méthodes pour le parent
    useImperativeHandle(ref, () => ({
        getCamera: () => cameraRef.current,
        getControls: () => controlsRef.current
    }));

    const scrollToContent = () => {
        // Pour scroll à la première section de planète
        const planetSections = document.querySelectorAll('.App > section');
        if (planetSections.length >= 2) {
            // La deuxième section est la première section de planète (index 1)
            planetSections[1].scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback au cas où la structure DOM est différente
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        }
    }

    // Effet pour mettre à jour la position de la caméra depuis les props
    useEffect(() => {
        if (cameraRef.current && initialAnimationComplete) {
            // Définir les points de focus pour chaque position de caméra
            // Ces points déterminent où la caméra regarde à chaque position
            const lookAtPositions = [
                { x: 0, y: 0, z: 0 },        // Regarder le centre de la galaxie
                { x: -1, y: 0, z: 0 },       // Regarder légèrement à gauche
                { x: 0, y: 0.5, z: 0 },      // Regarder vers le haut 
                { x: 0.5, y: -0.2, z: 0.3 }, // Regarder vers la droite et légèrement vers le bas
                { x: 0, y: 0, z: 0.5 }       // Regarder vers l'avant
            ];
            
            // Obtenir l'index du point de focus en fonction de la position de la caméra
            // Adapter cette logique selon vos besoins spécifiques
            let focusIndex = 0;
            if (cameraPosition.x < -1) focusIndex = 1;
            else if (cameraPosition.y > 3) focusIndex = 2;
            else if (cameraPosition.x > 2) focusIndex = 3;
            else if (cameraPosition.z > 5) focusIndex = 4;
            
            const targetLookAt = lookAtPositions[focusIndex];

            // Animer la position de la caméra
            gsap.to(cameraRef.current.position, {
                x: cameraPosition.x,
                y: cameraPosition.y,
                z: cameraPosition.z,
                duration: 0.5, // Durée plus courte pour que la caméra suive plus étroitement le défilement
                ease: "power1.out", // Une courbe d'accélération plus réactive
                overwrite: "auto" // Permet de gérer les animations concurrentes pendant le défilement rapide
            });
            
            // Animer la rotation de la caméra pour qu'elle regarde le point de focus
            const currentTarget = cameraRef.current.target || new THREE.Vector3(0, 0, 0);
            gsap.to(currentTarget, {
                x: targetLookAt.x,
                y: targetLookAt.y,
                z: targetLookAt.z,
                duration: 0.8, // Durée légèrement plus longue pour une rotation plus douce
                ease: "power2.inOut",
                onUpdate: () => {
                    cameraRef.current.lookAt(currentTarget);
                }
            });
            
            // Stocker la cible actuelle pour la prochaine animation
            cameraRef.current.target = currentTarget;
        }
    }, [cameraPosition, initialAnimationComplete]);

    useEffect(() => {
        const canvas = canvasRef.current
        const scene = new THREE.Scene()
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // Camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        // Position initiale au centre de la galaxie (zoom)
        camera.position.set(0, 0, 0.1)
        scene.add(camera)
        cameraRef.current = camera

        // Cible initiale
        const cameraTarget = new THREE.Vector3(0, 0, 0)
        camera.lookAt(cameraTarget)

        // Renderer
        const renderer = new THREE.WebGLRenderer({ 
            canvas,
            alpha: true 
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true
        controls.enabled = false // Désactiver les contrôles pendant l'animation
        controlsRef.current = controls

        // Create galaxy...
        const galaxy = createGalaxy(scene)

        const clock = new THREE.Clock()

        // Animation de dézoom
        const startAnimation = () => {
            setAnimationStarted(true)
            
            // Animation initiale immédiate
            gsap.to(camera.position, {
                x: 0.5,
                y: 0.2,
                z: 0.5,
                duration: 2,
                ease: "power1.inOut",
                onComplete: () => {
                    // Afficher les crédits immédiatement sans animation de fondu
                    setShowCredits(true);
                    setCreditsOpacity(0); // Commencer avec opacité zéro
                    
                    // Animation cinématique des crédits
                    gsap.to({}, {
                        duration: 1.2,
                        onUpdate: () => {
                            const progress = Math.min(1, gsap.ticker.time / 1.2);
                            setCreditsOpacity(progress);
                            setCreditsScale(0.7 + (progress * 0.3)); // Effet de zoom (de 70% à 100%)
                        }
                    });
                    
                    // Animation d'apparition du texte "par"
                    gsap.to({}, {
                        duration: 0.8,
                        onComplete: () => {
                            setTextPar('par');
                            
                            // Animation d'apparition des noms un par un
                            const names = ['Jules Crevoisier', 'Audric FULLHARDT', 'Gabriel MAILLARD'];
                            
                            // Premier nom - affichage direct
                            setTimeout(() => {
                                setTextNames(prev => [names[0], prev[1], prev[2]]);
                            }, 300);
                            
                            // Deuxième nom - affichage direct
                            setTimeout(() => {
                                setTextNames(prev => [prev[0], names[1], prev[2]]);
                            }, 800);
                            
                            // Troisième nom - affichage direct
                            setTimeout(() => {
                                setTextNames(prev => [prev[0], prev[1], names[2]]);
                            }, 1300);
                        }
                    });
                    
                    // Pause de 3 secondes avant de continuer le dézoom
                    setTimeout(() => {
                        // Animation de dézoom principal
                        gsap.to(camera.position, {
                            x: 3,
                            y: 3,
                            z: 3,
                            duration: 7, // Durée plus longue pour effet cinématique
                            ease: "power2.out",
                            onStart: () => {
                                // Programmer l'affichage du titre à 50% (3.5 secondes) après le début du dézoom
                                setTimeout(() => {
                                    console.log("Affichage du titre à 50% de l'animation");
                                    setShowCredits(false);
                                    setShowTitle(true);
                                    
                                    // Émettre un événement pour indiquer que nous sommes à 50% de l'animation
                                    window.dispatchEvent(new CustomEvent('galaxyAnimation50Percent'));
                                }, 3500); // 3.5 secondes = ~50% de l'animation de 7 secondes
                            },
                            onComplete: () => {
                                // Réactiver les contrôles après l'animation
                                controls.enabled = true;
                                
                                // Garantir que le titre est affiché
                                setShowCredits(false);
                                setShowTitle(true);
                                
                                // Marquer l'animation initiale comme terminée
                                setInitialAnimationComplete(true);
                                
                                // Émettre un événement personnalisé pour App.js
                                window.dispatchEvent(new CustomEvent('galaxyAnimationComplete'));
                            }
                        });

                        // Animation des crédits qui s'éloignent
                        gsap.to({}, {
                            duration: 4.5,
                            onUpdate: () => {
                                const progress = Math.min(1, gsap.ticker.time / 4.5);
                                setCreditsScale(1 - progress * 0.5);
                                if (progress > 0.7) {
                                    setCreditsOpacity(1 - ((progress - 0.7) / 0.3));
                                }
                            }
                        });

                        // Animation de rotation de la caméra pendant le dézoom
                        gsap.to(cameraTarget, {
                            x: 0.5,
                            y: 0.2,
                            duration: 7,
                            ease: "power1.inOut",
                            onUpdate: () => {
                                camera.lookAt(cameraTarget);
                            }
                        });
                    }, 3000); // Pause de 3 secondes pendant laquelle on voit les crédits
                }
            });
        }

        // Démarrer l'animation immédiatement
        startAnimation();

        let animationFrameId
        const tick = () => {
            const elapsedTime = clock.getElapsedTime()
            controls.update()
            renderer.render(scene, camera)
            animationFrameId = requestAnimationFrame(tick)
        }

        tick()

        // Resize handler
        const handleResize = () => {
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }

        window.addEventListener('resize', handleResize)

        return () => {
            // Cleanup
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', handleResize)
            controls.dispose()
            renderer.dispose()
            scene.clear()
        }
    }, [])

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <canvas 
                ref={canvasRef} 
                className="webgl" 
                style={{ pointerEvents: 'none' }} // Permettre de cliquer à travers le canvas
            />
            
            {showCredits && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${creditsScale})`,
                        color: 'white',
                        textAlign: 'center',
                        fontFamily: "'Orbitron', sans-serif",
                        opacity: creditsOpacity,
                        transition: 'transform 0.5s ease',
                        zIndex: 1000
                    }}
                >
                    <style>
                        {`
                            @keyframes glowing {
                                0% { text-shadow: 0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(120,120,255,0.4); }
                                50% { text-shadow: 0 0 15px rgba(255,255,255,0.9), 0 0 25px rgba(120,120,255,0.6); }
                                100% { text-shadow: 0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(120,120,255,0.4); }
                            }
                            
                            .text-reveal {
                                animation: glowing 2s infinite;
                            }
                        `}
                    </style>
                    <p style={{ 
                        fontSize: '2rem', 
                        margin: '0',
                        padding: '0',
                        letterSpacing: '2px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        lineHeight: '1.5'
                    }}>
                        <span className="text-reveal">{textPar}</span><br/>
                        <span style={{ 
                            fontSize: '2.5rem', 
                            background: 'linear-gradient(to bottom, #ffffff, #a0a0ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block',
                            padding: '10px 0'
                        }}>
                            <span className="text-reveal">{textNames[0]}</span><br/>
                            <span className="text-reveal">{textNames[1]}</span><br/>
                            <span className="text-reveal">{textNames[2]}</span>
                        </span>
                    </p>
                </div>
            )}
            
            {/* Interface de titre désactivée - maintenant gérée par App.js */}
        </div>
    )
})

export default GalaxyScene
