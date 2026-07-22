document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================================
       1. THEME TOGGLING LOGIC
       ========================================================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-moon-stars-fill';
        } else {
            themeIcon.className = 'bi bi-brightness-high-fill';
        }
    }


    /* =========================================================================
       2. LOCALIZATION (i18n) LOGIC
       ========================================================================= */
    const langBtns = document.querySelectorAll('.lang-btn');
    const currentLangLabel = document.getElementById('currentLangLabel');
    
    // Check local storage for language preference
    let currentLang = localStorage.getItem('lang') || 'en';
    setLanguage(currentLang);

    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    function setLanguage(lang) {
        if (!translations[lang]) return;
        
        // Update local storage
        localStorage.setItem('lang', lang);
        currentLang = lang;

        // Update dropdown label
        currentLangLabel.innerText = lang.toUpperCase();

        // Update DOM elements
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.innerText = translations[lang][key];
            }
        });

        // RTL Support for Arabic
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }
    }


    /* =========================================================================
       3. THREE.JS ANIMATION LOGIC (Abstract Particle Network)
       ========================================================================= */
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    // Colors to match our CSS gradient (Primary: #38bdf8, Secondary: #818cf8)
    const color1 = new THREE.Color(0x38bdf8);
    const color2 = new THREE.Color(0x818cf8);

    for (let i = 0; i < particlesCount * 3; i+=3) {
        // Spread particles over a large area
        posArray[i] = (Math.random() - 0.5) * 10;     // x
        posArray[i+1] = (Math.random() - 0.5) * 10;   // y
        posArray[i+2] = (Math.random() - 0.5) * 10;   // z

        // Mix colors
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colorArray[i] = mixedColor.r;
        colorArray[i+1] = mixedColor.g;
        colorArray[i+2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 3;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slow automatic rotation
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Subtle reaction to mouse
        particlesMesh.rotation.y += mouseX * 0.01;
        particlesMesh.rotation.x += mouseY * 0.01;

        renderer.render(scene, camera);
    }
    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* =========================================================================
       4. SMOOTH SCROLLING
       ========================================================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
