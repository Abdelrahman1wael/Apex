// agent.js - Three.js logic for the 3D Agent Core

class Agent3D {
    constructor() {
        this.canvas = document.getElementById('agent-canvas');
        this.scene = new THREE.Scene();
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.state = 'idle'; // 'idle', 'listening', 'speaking'
        this.targetScale = 1.0;
        
        this.initCore();
        this.initLighting();
        this.setupEvents();
        this.animate();
    }
    
    initCore() {
        // Create an inner glowing core (Icosahedron)
        const coreGeometry = new THREE.IcosahedronGeometry(1.2, 1);
        const coreMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222,
            emissive: 0x00ffcc,
            emissiveIntensity: 0.2,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        this.core = new THREE.Mesh(coreGeometry, coreMaterial);
        
        // Create an outer shell with points
        const shellGeometry = new THREE.IcosahedronGeometry(1.6, 2);
        const shellMaterial = new THREE.PointsMaterial({
            color: 0x8a2be2,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        this.shell = new THREE.Points(shellGeometry, shellMaterial);
        
        // Group them
        this.agentGroup = new THREE.Group();
        this.agentGroup.add(this.core);
        this.agentGroup.add(this.shell);
        
        this.scene.add(this.agentGroup);
    }
    
    initLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    }
    
    setState(newState) {
        this.state = newState;
        
        // Update visual parameters based on state
        switch (newState) {
            case 'idle':
                this.core.material.emissive.setHex(0x00ffcc);
                this.core.material.emissiveIntensity = 0.2;
                this.shell.material.color.setHex(0x8a2be2);
                this.targetScale = 1.0;
                break;
            case 'listening':
                this.core.material.emissive.setHex(0x00ffcc);
                this.core.material.emissiveIntensity = 0.8;
                this.shell.material.color.setHex(0x00ffcc);
                this.targetScale = 1.2;
                break;
            case 'speaking':
                this.core.material.emissive.setHex(0xff00ff);
                this.core.material.emissiveIntensity = 0.8;
                this.shell.material.color.setHex(0xff00ff);
                this.targetScale = 1.1;
                break;
        }
    }
    
    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const time = Date.now() * 0.001;
        
        // Rotation
        this.agentGroup.rotation.y += 0.005;
        this.agentGroup.rotation.x += 0.002;
        
        this.core.rotation.y -= 0.01;
        this.shell.rotation.z += 0.005;
        
        // Floating animation
        this.agentGroup.position.y = Math.sin(time) * 0.2;
        
        // Smooth scaling transition
        this.agentGroup.scale.lerp(new THREE.Vector3(this.targetScale, this.targetScale, this.targetScale), 0.1);
        
        // Add dynamic pulsing when speaking or listening
        if (this.state === 'listening' || this.state === 'speaking') {
            const pulse = 1.0 + Math.sin(time * 8) * 0.05;
            this.agentGroup.scale.set(this.targetScale * pulse, this.targetScale * pulse, this.targetScale * pulse);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Export for app.js to use
window.Agent3D = Agent3D;
