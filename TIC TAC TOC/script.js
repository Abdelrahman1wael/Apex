// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a); // slate-900
scene.fog = new THREE.Fog(0x0f172a, 10, 40);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 15, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

const pointLightX = new THREE.PointLight(0xef4444, 0.5, 20); // red
pointLightX.position.set(-5, 5, 0);
scene.add(pointLightX);

const pointLightO = new THREE.PointLight(0x3b82f6, 0.5, 20); // blue
pointLightO.position.set(5, 5, 0);
scene.add(pointLightO);

// Game variables
let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
let currentPlayer = 'X';
let gameActive = true;
const cellObjects = [];
const markers = [];

// Create Grid Group
const boardGroup = new THREE.Group();
scene.add(boardGroup);

const gridSize = 2;
const cellSize = 2.4;

// Materials
const cellMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0x1e293b, // slate-800
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2
});

const hoverMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x334155, // slate-700
    roughness: 0.1,
    metalness: 0.2,
    clearcoat: 0.8
});

const xMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0xef4444, // red-500
    emissive: 0xef4444,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 1.0
});

const oMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0x3b82f6, // blue-500
    emissive: 0x3b82f6,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 1.0
});

// Build Board Cells
const cellGeometry = new THREE.BoxGeometry(2.2, 0.3, 2.2);

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        const cell = new THREE.Mesh(cellGeometry, cellMaterial.clone());
        cell.position.x = (j - 1) * cellSize;
        cell.position.y = 0;
        cell.position.z = (i - 1) * cellSize;
        cell.receiveShadow = true;
        cell.castShadow = true;
        
        // Add subtle bevel by using a slightly smaller top box (simulated visually via geometry if needed, but BoxGeometry is fine here)
        
        // Store logical coordinates
        cell.userData = { row: i, col: j, originalY: 0 };
        
        boardGroup.add(cell);
        cellObjects.push(cell);
    }
}

// Add board base
const baseGeometry = new THREE.BoxGeometry(cellSize * 3 + 0.4, 0.5, cellSize * 3 + 0.4);
const baseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.2
});
const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
baseMesh.position.y = -0.4;
baseMesh.receiveShadow = true;
boardGroup.add(baseMesh);

// Raycaster for interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredCell = null;

// Add some particle dust
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 30;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

window.addEventListener('mousemove', (event) => {
    if (!gameActive) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cellObjects);
    
    // Reset previous hover
    if (hoveredCell && hoveredCell !== intersects[0]?.object) {
        gsap.to(hoveredCell.position, { y: hoveredCell.userData.originalY, duration: 0.3, ease: "power2.out" });
        hoveredCell.material.color.setHex(0x1e293b);
        hoveredCell.material.emissiveIntensity = 0;
        document.body.style.cursor = 'default';
        hoveredCell = null;
    }
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        const { row, col } = object.userData;
        
        if (board[row][col] === '') {
            hoveredCell = object;
            gsap.to(hoveredCell.position, { y: 0.3, duration: 0.3, ease: "power2.out" });
            hoveredCell.material.color.setHex(0x334155);
            
            // Hint color based on current player
            if(currentPlayer === 'X') {
                hoveredCell.material.emissive.setHex(0xef4444);
                hoveredCell.material.emissiveIntensity = 0.2;
            } else {
                hoveredCell.material.emissive.setHex(0x3b82f6);
                hoveredCell.material.emissiveIntensity = 0.2;
            }
            document.body.style.cursor = 'pointer';
        }
    }
});

window.addEventListener('click', () => {
    if (!gameActive || !hoveredCell) return;
    
    const { row, col } = hoveredCell.userData;
    
    if (board[row][col] === '') {
        // Place marker
        board[row][col] = currentPlayer;
        createMarker(currentPlayer, hoveredCell.position.x, hoveredCell.position.z);
        
        // Reset hover
        gsap.to(hoveredCell.position, { y: 0, duration: 0.2 });
        hoveredCell.material.color.setHex(0x1e293b);
        hoveredCell.material.emissiveIntensity = 0;
        document.body.style.cursor = 'default';
        hoveredCell = null;
        
        checkWin();
        
        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatus();
        }
    }
});

function createMarker(player, x, z) {
    let mesh;
    if (player === 'X') {
        const group = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1.6, 0.4, 0.4);
        
        const bar1 = new THREE.Mesh(geometry, xMaterial);
        bar1.rotation.y = Math.PI / 4;
        bar1.castShadow = true;
        
        const bar2 = new THREE.Mesh(geometry, xMaterial);
        bar2.rotation.y = -Math.PI / 4;
        bar2.castShadow = true;
        
        group.add(bar1);
        group.add(bar2);
        mesh = group;
    } else {
        const geometry = new THREE.TorusGeometry(0.6, 0.2, 32, 64);
        mesh = new THREE.Mesh(geometry, oMaterial);
        mesh.rotation.x = Math.PI / 2;
        mesh.castShadow = true;
    }
    
    // Spawn animation
    mesh.position.set(x, 5, z);
    boardGroup.add(mesh);
    markers.push({mesh, player, r: rowFromZ(z), c: colFromX(x)});
    
    gsap.to(mesh.position, {
        y: 0.5,
        duration: 0.6,
        ease: "bounce.out"
    });
    
    if (player === 'O') {
        mesh.rotation.x = 0; // start upright
        gsap.to(mesh.rotation, {
            x: Math.PI / 2,
            z: Math.PI * 2,
            duration: 0.8,
            ease: "power3.out"
        });
    } else {
        mesh.scale.set(0.1, 0.1, 0.1);
        gsap.to(mesh.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        gsap.from(mesh.rotation, {
            y: Math.PI,
            duration: 0.6
        });
    }
}

function rowFromZ(z) { return Math.round(z / cellSize) + 1; }
function colFromX(x) { return Math.round(x / cellSize) + 1; }

function checkWin() {
    const lines = [
        [[0,0], [0,1], [0,2]],
        [[1,0], [1,1], [1,2]],
        [[2,0], [2,1], [2,2]],
        [[0,0], [1,0], [2,0]],
        [[0,1], [1,1], [2,1]],
        [[0,2], [1,2], [2,2]],
        [[0,0], [1,1], [2,2]],
        [[0,2], [1,1], [2,0]]
    ];
    
    for (let line of lines) {
        const [a, b, c] = line;
        if (
            board[a[0]][a[1]] !== '' &&
            board[a[0]][a[1]] === board[b[0]][b[1]] &&
            board[a[0]][a[1]] === board[c[0]][c[1]]
        ) {
            gameActive = false;
            const indicator = document.getElementById('player-indicator');
            document.getElementById('status').innerHTML = `Player <span style="color:${currentPlayer === 'X' ? '#ef4444' : '#3b82f6'}">${currentPlayer}</span> Wins!`;
            document.getElementById('restart-btn').classList.remove('hidden');
            document.getElementById('restart-btn').style.opacity = '1';
            document.getElementById('restart-btn').style.pointerEvents = 'auto';
            
            highlightWin(line);
            
            // Winning camera spin
            gsap.to(boardGroup.rotation, {
                y: Math.PI * 2,
                duration: 4,
                ease: "power2.inOut"
            });
            return;
        }
    }
    
    // Check draw
    let isDraw = true;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') isDraw = false;
        }
    }
    
    if (isDraw) {
        gameActive = false;
        document.getElementById('status').innerText = `It's a Draw!`;
        document.getElementById('status').style.color = '#f8fafc';
        document.getElementById('restart-btn').classList.remove('hidden');
        document.getElementById('restart-btn').style.opacity = '1';
        document.getElementById('restart-btn').style.pointerEvents = 'auto';
    }
}

function highlightWin(line) {
    line.forEach((coord, index) => {
        const { row, col } = { row: coord[0], col: coord[1] };
        const cell = cellObjects.find(c => c.userData.row === row && c.userData.col === col);
        
        if (cell) {
            gsap.to(cell.position, {
                y: 0.8,
                duration: 0.5,
                delay: index * 0.1,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
            gsap.to(cell.material.emissive, {
                r: currentPlayer === 'X' ? 1 : 0,
                g: 0,
                b: currentPlayer === 'O' ? 1 : 0,
                duration: 0.5
            });
            cell.material.emissiveIntensity = 0.5;
        }
        
        // Make markers jump
        const markerObj = markers.find(m => m.r === row && m.c === col);
        if(markerObj) {
            gsap.to(markerObj.mesh.position, {
                y: 1.5,
                duration: 0.5,
                delay: index * 0.1,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut"
            });
        }
    });
}

function updateStatus() {
    const indicator = document.getElementById('player-indicator');
    indicator.innerText = currentPlayer;
    indicator.style.color = currentPlayer === 'X' ? '#ef4444' : '#3b82f6';
}

document.getElementById('restart-btn').addEventListener('click', () => {
    // Reset board
    board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    currentPlayer = 'X';
    gameActive = true;
    
    document.getElementById('status').innerHTML = `Player <span id="player-indicator">X</span>'s Turn`;
    updateStatus();
    
    const btn = document.getElementById('restart-btn');
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    setTimeout(() => btn.classList.add('hidden'), 300);
    
    // Animate board group back to 0 rotation
    gsap.to(boardGroup.rotation, { y: 0, duration: 1, ease: "power2.inOut" });
    
    // Remove markers with animation
    markers.forEach((markerObj, i) => {
        gsap.to(markerObj.mesh.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.3,
            delay: i * 0.05,
            onComplete: () => {
                boardGroup.remove(markerObj.mesh);
            }
        });
    });
    setTimeout(() => { markers.length = 0; }, markers.length * 50 + 300);
    
    // Reset cells
    cellObjects.forEach((cell, i) => {
        gsap.killTweensOf(cell.position);
        gsap.to(cell.position, { y: 0, duration: 0.5, delay: i * 0.02, ease: "back.out(1.5)" });
        cell.material.emissive.setHex(0x000000);
        cell.material.emissiveIntensity = 0;
    });
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Slow particles rotation
    particles.rotation.y = elapsedTime * 0.05;
    
    // Slight camera movement for dynamic feel based on mouse
    if (gameActive) {
        const targetX = mouse.x * 2;
        const targetY = 10 + mouse.y * 2;
        
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
    }
    
    renderer.render(scene, camera);
}
animate();
