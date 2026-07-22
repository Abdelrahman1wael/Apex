// Three.js Enhanced Background Implementation
let scene, camera, renderer;
let shapes = [];
let particlesMesh;
let explosions = [];
let clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

function initThree() {
    const container = document.getElementById('canvas-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.002);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8b5cf6, 1.5, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xec4899, 1.5, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x3b82f6, 1.5, 100);
    pointLight3.position.set(0, 20, -10);
    scene.add(pointLight3);

    // 1. Floating Shapes
    createShapes();

    // 2. Star/Particle Field
    createParticles();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    
    // Start Animation
    animate();
}

function createShapes() {
    const geometries = [
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.OctahedronGeometry(1.2, 0),
        new THREE.TorusGeometry(1, 0.3, 16, 100),
        new THREE.TetrahedronGeometry(1.5, 0)
    ];

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.5,
        wireframe: true,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.3
    });

    for (let i = 0; i < 50; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geo, material);
        
        mesh.position.x = (Math.random() - 0.5) * 100;
        mesh.position.y = (Math.random() - 0.5) * 100;
        mesh.position.z = (Math.random() - 0.5) * 50 - 15;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            floatSpeed: (Math.random() - 0.5) * 0.05,
            baseY: mesh.position.y,
            baseX: mesh.position.x,
            phase: Math.random() * Math.PI * 2
        };

        shapes.push(mesh);
        scene.add(mesh);
    }
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    const colorOptions = [new THREE.Color(0x8b5cf6), new THREE.Color(0xec4899), new THREE.Color(0x3b82f6)];

    for(let i = 0; i < particlesCount * 3; i+=3) {
        // x, y, z
        posArray[i] = (Math.random() - 0.5) * 120;
        posArray[i+1] = (Math.random() - 0.5) * 120;
        posArray[i+2] = (Math.random() - 0.5) * 120;
        
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colorArray[i] = color.r;
        colorArray[i+1] = color.g;
        colorArray[i+2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Smooth camera parallax
    targetX = mouseX * 0.1;
    targetY = mouseY * 0.1;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Animate shapes
    shapes.forEach(shape => {
        shape.rotation.x += shape.userData.rotSpeedX;
        shape.rotation.y += shape.userData.rotSpeedY;
        
        // Complex floating motion
        shape.position.y = shape.userData.baseY + Math.sin(time + shape.userData.phase) * 2;
        shape.position.x = shape.userData.baseX + Math.cos(time * 0.5 + shape.userData.phase) * 1;
    });
    
    // Rotate particle system slowly
    if (particlesMesh) {
        particlesMesh.rotation.y = time * 0.05;
        particlesMesh.rotation.x = time * 0.02;
    }
    
    // Animate explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const expl = explosions[i];
        expl.material.opacity -= 0.02;
        
        const positions = expl.geometry.attributes.position.array;
        for (let j = 0; j < positions.length; j += 3) {
            positions[j] += expl.userData.velocities[j/3].x;
            positions[j+1] += expl.userData.velocities[j/3].y;
            positions[j+2] += expl.userData.velocities[j/3].z;
        }
        expl.geometry.attributes.position.needsUpdate = true;
        
        if (expl.material.opacity <= 0) {
            scene.remove(expl);
            expl.geometry.dispose();
            expl.material.dispose();
            explosions.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

// Effect triggers for app.js integration
function triggerAddEffect() {
    // Pulse light and shapes
    shapes.forEach(shape => {
        shape.scale.set(1.4, 1.4, 1.4);
        shape.material.emissiveIntensity = 1;
        setTimeout(() => {
            shape.scale.set(1, 1, 1);
            shape.material.emissiveIntensity = 0.3;
        }, 200);
    });
}

function triggerCompleteEffect() {
    // Spin faster
    shapes.forEach(shape => {
        const originalX = shape.userData.rotSpeedX;
        const originalY = shape.userData.rotSpeedY;
        
        shape.userData.rotSpeedX *= 10;
        shape.userData.rotSpeedY *= 10;
        shape.material.emissive.setHex(0x10b981); // Turn green briefly
        
        setTimeout(() => {
            shape.userData.rotSpeedX = originalX;
            shape.userData.rotSpeedY = originalY;
            shape.material.emissive.setHex(0x3b82f6); // Back to blue
        }, 600);
    });
    
    // Create explosion effect in the center
    createExplosion();
}

function createExplosion() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);
    
    const colorList = [new THREE.Color(0x10b981), new THREE.Color(0xfbbf24), new THREE.Color(0xffffff)];

    for (let i = 0; i < particleCount; i++) {
        // Start at center
        positions[i*3] = (Math.random() - 0.5) * 5;
        positions[i*3+1] = (Math.random() - 0.5) * 5;
        positions[i*3+2] = (Math.random() - 0.5) * 5;
        
        // Random velocity outwards
        velocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8
        ));
        
        const color = colorList[Math.floor(Math.random() * colorList.length)];
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    
    const explosion = new THREE.Points(geometry, material);
    explosion.userData = { velocities: velocities };
    
    scene.add(explosion);
    explosions.push(explosion);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initThree);
