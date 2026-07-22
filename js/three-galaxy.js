/**
 * Apex Ecosystem Marketing Platform - Three.js 3D Ecosystem Holodeck
 * Renders 10 interactive 3D WebGL project objects with 3 Viewport Modes:
 * Mode 1: Constellation Galaxy | Mode 2: 3D AR Holo-Table | Mode 3: Hyper-Warp Tunnel
 */

class EcosystemGalaxy {
  constructor(canvasContainerId, onPlanetSelectCallback) {
    this.container = document.getElementById(canvasContainerId);
    this.onPlanetSelect = onPlanetSelectCallback;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    this.planetsMap = new Map();
    this.planetMeshes = [];
    this.laserLines = [];
    this.starfield = null;
    this.holoGrid = null;

    this.currentMode = 'constellation';

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredPlanet = null;
    this.selectedPlanet = null;

    this.targetCameraPos = new THREE.Vector3(0, 8, 32);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    
    this.isTransitioning = false;

    this.init();
  }

  init() {
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050714, 0.015);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(0, 8, 32);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f3ff, 2.5, 100);
    pointLight.position.set(0, 10, 10);
    this.scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0x9d4edd, 2.5, 100);
    purpleLight.position.set(-15, -10, -10);
    this.scene.add(purpleLight);

    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 50;
      this.controls.minDistance = 5;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.4;
    }

    this.buildStarfield();
    this.buildHoloTableGrid();
    this.buildPlanets();
    this.buildLaserConnections();

    window.addEventListener('resize', () => this.onWindowResize());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('click', (e) => this.onClick(e));

    this.animate();
  }

  buildStarfield() {
    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x00f3ff),
      new THREE.Color(0x9d4edd),
      new THREE.Color(0x3a86ff),
      new THREE.Color(0xff007f),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 30 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  buildHoloTableGrid() {
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f3ff, 0x9d4edd);
    gridHelper.position.y = -6;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    this.holoGrid = gridHelper;
    this.scene.add(this.holoGrid);
  }

  buildPlanets() {
    const projects = window.ECOSYSTEM_PROJECTS || [];

    projects.forEach((proj, idx) => {
      const group = new THREE.Group();

      const segs = 32;
      const geo = new THREE.SphereGeometry(proj.size, segs, segs);
      
      const texture = this.createPlanetTexture(proj.color, proj.title);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        color: new THREE.Color(proj.color),
        roughness: 0.3,
        metalness: 0.6,
        emissive: new THREE.Color(proj.color),
        emissiveIntensity: proj.id === 'stttts' ? 0.4 : 0.2
      });

      const sphereMesh = new THREE.Mesh(geo, mat);
      sphereMesh.userData = { project: proj };
      group.add(sphereMesh);

      const glowGeo = new THREE.SphereGeometry(proj.size * 1.18, segs, segs);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(proj.color),
        transparent: true,
        opacity: 0.25,
        wireframe: true
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      group.add(glowMesh);

      if (proj.size >= 1.6) {
        const ringGeo = new THREE.RingGeometry(proj.size * 1.4, proj.size * 1.7, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(proj.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        group.add(ring);
      }

      group.position.set(proj.position.x, proj.position.y, proj.position.z);
      group.userData = { 
        project: proj,
        orbitAngle: (idx / projects.length) * Math.PI * 2,
        orbitRadius: proj.orbitRadius,
        orbitSpeed: 0.002 + (idx * 0.0003),
        initialPos: new THREE.Vector3(proj.position.x, proj.position.y, proj.position.z)
      };

      this.scene.add(group);
      this.planetMeshes.push(sphereMesh);
      this.planetsMap.set(proj.id, group);
    });
  }

  createPlanetTexture(hexColor, title) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#0a0d24');
    grad.addColorStop(0.5, hexColor);
    grad.addColorStop(1, '#02030a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  buildLaserConnections() {
    const connections = [
      ['stttts', 'stockmarket'],
      ['stttts', 'dashboard'],
      ['stttts', 'todolist'],
      ['stttts', 'weather'],
      ['stockmarket', 'dashboard'],
      ['todolist', 'recipe'],
      ['recipe', 'ecommerce'],
      ['ecommerce', 'tictactoe'],
      ['tictactoe', 'portfolio'],
      ['company', 'portfolio']
    ];

    connections.forEach(([idA, idB]) => {
      const groupA = this.planetsMap.get(idA);
      const groupB = this.planetsMap.get(idB);
      if (!groupA || !groupB) return;

      const points = [groupA.position, groupB.position];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(groupA.userData.project.color),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });

      const line = new THREE.Line(geometry, material);
      line.userData = { groupA, groupB };
      this.scene.add(line);
      this.laserLines.push(line);
    });
  }

  setMode(mode) {
    this.currentMode = mode;
    if (window.soundEngine) window.soundEngine.playClick();

    const projects = window.ECOSYSTEM_PROJECTS || [];

    if (mode === 'holotable') {
      projects.forEach((proj, idx) => {
        const group = this.planetsMap.get(proj.id);
        if (!group) return;
        const col = idx % 5;
        const row = Math.floor(idx / 5);
        group.position.set((col - 2) * 6, -4, (row - 0.5) * 8);
      });
      this.targetCameraPos.set(0, 12, 28);
      this.targetLookAt.set(0, -4, 0);
      this.isTransitioning = true;
    } else if (mode === 'warptunnel') {
      projects.forEach((proj, idx) => {
        const group = this.planetsMap.get(proj.id);
        if (!group) return;
        group.position.set((Math.cos(idx) * 8), (Math.sin(idx) * 8), -idx * 8);
      });
      this.targetCameraPos.set(0, 0, 15);
      this.targetLookAt.set(0, 0, -40);
      this.isTransitioning = true;
    } else {
      projects.forEach((proj) => {
        const group = this.planetsMap.get(proj.id);
        if (!group) return;
        group.position.copy(group.userData.initialPos);
      });
      this.resetView();
    }
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.planetMeshes);

    const hoverBadge = document.getElementById('planet-hover-badge');

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const project = hitMesh.userData.project;

      if (this.hoveredPlanet !== project) {
        this.hoveredPlanet = project;
        this.container.style.cursor = 'pointer';
        if (window.soundEngine) window.soundEngine.playHover();
      }

      if (hoverBadge) {
        hoverBadge.style.display = 'flex';
        hoverBadge.style.left = `${e.clientX + 15}px`;
        hoverBadge.style.top = `${e.clientY - 30}px`;
        hoverBadge.innerHTML = `<i class="fa-solid ${project.icon}" style="color:${project.color}"></i> <span>${project.title}</span>`;
      }
    } else {
      if (this.hoveredPlanet) {
        this.hoveredPlanet = null;
        this.container.style.cursor = 'default';
      }
      if (hoverBadge) hoverBadge.style.display = 'none';
    }
  }

  onClick(e) {
    if (this.hoveredPlanet) {
      this.selectPlanet(this.hoveredPlanet.id);
    }
  }

  selectPlanet(projectId) {
    const group = this.planetsMap.get(projectId);
    if (!group) return;

    const proj = group.userData.project;
    this.selectedPlanet = proj;

    if (window.soundEngine) window.soundEngine.playPlanetFocus();
    if (this.controls) this.controls.autoRotate = false;

    const pPos = group.position;
    const offset = new THREE.Vector3(0, 2, proj.size * 3.5);
    this.targetCameraPos.copy(pPos).add(offset);
    this.targetLookAt.copy(pPos);

    this.isTransitioning = true;

    if (this.onPlanetSelect) {
      this.onPlanetSelect(proj);
    }
  }

  resetView() {
    this.selectedPlanet = null;
    this.targetCameraPos.set(0, 8, 32);
    this.targetLookAt.set(0, 0, 0);
    this.isTransitioning = true;

    if (this.controls) this.controls.autoRotate = true;
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.planetsMap.forEach((group) => {
      if (this.currentMode === 'constellation' && group.userData.orbitRadius > 0 && !this.selectedPlanet) {
        group.userData.orbitAngle += group.userData.orbitSpeed;
        const r = group.userData.orbitRadius;
        group.position.x = Math.cos(group.userData.orbitAngle) * r;
        group.position.z = Math.sin(group.userData.orbitAngle) * r;
      }
      group.rotation.y += 0.008;
    });

    this.laserLines.forEach((line) => {
      const posA = line.userData.groupA.position;
      const posB = line.userData.groupB.position;
      const positions = line.geometry.attributes.position.array;

      positions[0] = posA.x;
      positions[1] = posA.y;
      positions[2] = posA.z;
      positions[3] = posB.x;
      positions[4] = posB.y;
      positions[5] = posB.z;
      line.geometry.attributes.position.needsUpdate = true;
    });

    if (this.isTransitioning) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.currentLookAt.lerp(this.targetLookAt, 0.06);

      if (this.controls) {
        this.controls.target.copy(this.currentLookAt);
      } else {
        this.camera.lookAt(this.currentLookAt);
      }

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.2) {
        this.isTransitioning = false;
      }
    }

    if (this.controls) this.controls.update();
    if (this.starfield) this.starfield.rotation.y += 0.0003;

    this.renderer.render(this.scene, this.camera);
  }
}

window.EcosystemGalaxy = EcosystemGalaxy;
