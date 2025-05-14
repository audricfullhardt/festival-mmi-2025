import * as THREE from 'three'

export function createGalaxy(scene, parameters = {}) {
    parameters.count = parameters.count || 500000
    parameters.size = parameters.size || 0.018
    parameters.radius = parameters.radius || 2000
    parameters.branches = parameters.branches || 20
    parameters.spin = parameters.spin || 5
    parameters.randomness = parameters.randomness || 2
    parameters.randomnessPower = parameters.randomnessPower || 3
    parameters.insideColor = parameters.insideColor || '#6e58ad'
    parameters.outsideColor = parameters.outsideColor || '#8808dd'

    let geometry, material, points

    // Texture circulaire
    const generateCircleTexture = () => {
        const size = 64
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fillStyle = 'white'
        ctx.fill()

        const texture = new THREE.Texture(canvas)
        texture.needsUpdate = true
        return texture
    }

    const circleTexture = generateCircleTexture()

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        const mixedColor = colorInside.clone().lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: circleTexture,
        alphaTest: 0.5,
        transparent: true
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)

    // Retourne une fonction de nettoyage
    return {
        dispose: () => {
            geometry.dispose()
            material.dispose()
            scene.remove(points)
        }
    }
}
