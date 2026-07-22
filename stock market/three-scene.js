// three-scene.js

let scene, camera, renderer, globe, particles;

function initThreeScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Setup Scene, Camera, Renderer
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x0dcaf0, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x0d6efd, 2);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Create Globe (Wireframe Sphere)
    const geometry = new THREE.SphereGeometry(4, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x0dcaf0,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add Nodes on Globe
    const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < 40; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        
        // Random position on sphere
        const phi = Math.acos(-1 + (2 * i) / 40);
        const theta = Math.sqrt(40 * Math.PI) * phi;
        
        node.position.x = 4 * Math.cos(theta) * Math.sin(phi);
        node.position.y = 4 * Math.sin(theta) * Math.sin(phi);
        node.position.z = 4 * Math.cos(phi);
        
        globe.add(node);
    }

    // Add Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i=0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x0dcaf0,
        transparent: true,
        opacity: 0.5
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Handle Resize
    window.addEventListener('resize', onWindowResize, false);
    
    function onWindowResize() {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // Animation Loop
    animateThree();
}

function animateThree() {
    requestAnimationFrame(animateThree);
    
    if (globe) {
        globe.rotation.y += 0.002;
        globe.rotation.x += 0.001;
    }
    
    if (particles) {
        particles.rotation.y -= 0.001;
    }
    
    renderer.render(scene, camera);
}

// Helper to trigger effects based on market data
window.triggerMarketEffect = function(isBullish) {
    if(!globe) return;
    
    const targetColor = isBullish ? 0x00e676 : 0xff5252; // Green for bull, Red for bear
    
    // Simple color tweening logic could be added here
    // For now, snap to color temporarily
    globe.material.color.setHex(targetColor);
    
    setTimeout(() => {
        globe.material.color.setHex(0x0dcaf0); // Back to default info color
    }, 2000);
}
