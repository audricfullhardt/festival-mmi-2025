import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createGalaxy } from './galaxy'

export default function GalaxyScene() {
    const canvasRef = useRef()

    useEffect(() => {
        const canvas = canvasRef.current
        const scene = new THREE.Scene()
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        // Camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.set(3, 3, 3)
        scene.add(camera)

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        // Create galaxy...
        const galaxy = createGalaxy(scene)

        const clock = new THREE.Clock()

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

    return <canvas ref={canvasRef} className="webgl" />
}
