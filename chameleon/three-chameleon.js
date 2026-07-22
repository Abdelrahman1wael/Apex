/**
 * Chameleon Pro 3D - Three.js WebGL Chameleon Showcase Engine
 */

class ThreeChameleonStudio {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.chameleonMesh = null;
    this.chameleonEyeLeft = null;
    this.chameleonEyeRight = null;
    this.material = null;
    this.controls = null;

    this.currentSkin = 'jungle';

    this.init3DScene();
  }

  init3DScene() {
    const container = document.getElementById('three-chameleon-container');
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 320;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 1, 7);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const mainLight = new THREE.DirectionalLight(0x06d6a0, 1.2);
    mainLight.position.set(5, 8, 5);

    const backLight = new THREE.PointLight(0x00ffe1, 1.5, 30);
    backLight.position.set(-5, -4, -4);

    this.scene.add(ambientLight, mainLight, backLight);

    // Create 3D Chameleon Procedural Mesh Group
    this.chameleonGroup = new THREE.Group();

    // Body (Icosahedron Torso)
    const bodyGeo = new THREE.IcosahedronGeometry(1.6, 2);
    this.material = new THREE.MeshStandardMaterial({
      color: 0x06d6a0,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0x013024
    });

    this.chameleonMesh = new THREE.Mesh(bodyGeo, this.material);
    this.chameleonGroup.add(this.chameleonMesh);

    // Head Crest (Cone Geometry)
    const crestGeo = new THREE.ConeGeometry(0.8, 1.4, 8);
    const crestMesh = new THREE.Mesh(crestGeo, this.material);
    crestMesh.position.set(0, 1.2, 0.4);
    crestMesh.rotation.x = -Math.PI / 4;
    this.chameleonGroup.add(crestMesh);

    // Eyes (Dual Rotating Spheres)
    const eyeGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x070c14 });

    // Left Eye
    const eyeL = new THREE.Group();
    const sphereL = new THREE.Mesh(eyeGeo, eyeMat);
    const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), pupilMat);
    pupilL.position.z = 0.28;
    eyeL.add(sphereL, pupilL);
    eyeL.position.set(-0.8, 0.6, 1.1);
    this.chameleonGroup.add(eyeL);
    this.chameleonEyeLeft = eyeL;

    // Right Eye
    const eyeR = new THREE.Group();
    const sphereR = new THREE.Mesh(eyeGeo, eyeMat);
    const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), pupilMat);
    pupilR.position.z = 0.28;
    eyeR.add(sphereR, pupilR);
    eyeR.position.set(0.8, 0.6, 1.1);
    this.chameleonGroup.add(eyeR);
    this.chameleonEyeRight = eyeR;

    // Curved Tail (Torus)
    const tailGeo = new THREE.TorusGeometry(1.2, 0.2, 16, 50, Math.PI * 1.3);
    const tailMesh = new THREE.Mesh(tailGeo, this.material);
    tailMesh.position.set(0, -0.8, -1.2);
    tailMesh.rotation.y = Math.PI / 2;
    this.chameleonGroup.add(tailMesh);

    this.scene.add(this.chameleonGroup);

    // Orbit Controls
    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.enableZoom = false;
    }

    // Animation Loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      if (this.chameleonGroup) {
        this.chameleonGroup.rotation.y = Math.sin(time * 0.5) * 0.25;
        this.chameleonGroup.position.y = Math.sin(time) * 0.1;
      }

      // Independent eye movement
      if (this.chameleonEyeLeft && this.chameleonEyeRight) {
        this.chameleonEyeLeft.rotation.y = Math.sin(time * 1.2) * 0.4;
        this.chameleonEyeRight.rotation.x = Math.cos(time * 1.5) * 0.4;
      }

      if (this.controls) this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  setSkin(skinName) {
    this.currentSkin = skinName;
    if (!this.material) return;

    if (skinName === 'jungle') {
      this.material.color.set(0x06d6a0);
      this.material.emissive.set(0x013024);
      this.material.metalness = 0.3;
      this.material.roughness = 0.2;
      this.material.wireframe = false;
    } else if (skinName === 'neon') {
      this.material.color.set(0x00ffe1);
      this.material.emissive.set(0x9d4edd);
      this.material.metalness = 0.8;
      this.material.roughness = 0.1;
      this.material.wireframe = false;
    } else if (skinName === 'prism') {
      this.material.color.set(0xffffff);
      this.material.emissive.set(0x00ffe1);
      this.material.metalness = 0.9;
      this.material.roughness = 0.05;
      this.material.wireframe = true;
    } else if (skinName === 'lava') {
      this.material.color.set(0xff0055);
      this.material.emissive.set(0xffb703);
      this.material.metalness = 0.5;
      this.material.roughness = 0.3;
      this.material.wireframe = false;
    }
  }
}

// Global Export
window.threeChameleonStudio = null;
document.addEventListener('DOMContentLoaded', () => {
  window.threeChameleonStudio = new ThreeChameleonStudio();
});
