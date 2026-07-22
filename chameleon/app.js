/**
 * Chameleon Pro 3D - Main Application Controller & Stealth Game Engine
 */

class ChameleonApp {
  constructor() {
    this.currentTab = 'compositor';

    // Compositor State
    this.bgImage = null;
    this.overlayImage = null;
    this.scale = 0.5;
    this.angle = 0;
    this.posX = 50;
    this.posY = 50;
    this.opacity = 1.0;
    this.hue = 0;
    this.blendMode = 'source-over';
    this.isDragging = false;

    // Game Mode State
    this.gameDifficulty = 'easy'; // easy, medium, hard
    this.gameTimer = 30;
    this.gameScore = 0;
    this.gameFound = 0;
    this.gameTargetCount = 5;
    this.isGameActive = false;
    this.gameInterval = null;
    this.currentTarget = { x: 0, y: 0, r: 40 };

    this.initElements();
    this.initTabNavigation();
    this.initCompositorEngine();
    this.initGameEngine();
    this.init3DSkinEvents();
  }

  initElements() {
    // Tabs
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabWorkspaces = document.querySelectorAll('.tab-workspace');

    // Compositor Elements
    this.canvas = document.getElementById('compositor-canvas');
    if (this.canvas) this.ctx = this.canvas.getContext('2d');

    this.bgUploadInput = document.getElementById('bg-upload-input');
    this.overlayUploadInput = document.getElementById('overlay-upload-input');
    this.scaleSlider = document.getElementById('scale-slider');
    this.rotSlider = document.getElementById('rot-slider');
    this.posxSlider = document.getElementById('posx-slider');
    this.posySlider = document.getElementById('posy-slider');
    this.opacitySlider = document.getElementById('opacity-slider');
    this.hueSlider = document.getElementById('hue-slider');
    this.blendSelect = document.getElementById('blend-select');
    this.downloadBtn = document.getElementById('download-btn');

    this.scaleVal = document.getElementById('scale-val');
    this.rotVal = document.getElementById('rot-val');
    this.posxVal = document.getElementById('posx-val');
    this.posyVal = document.getElementById('posy-val');
    this.opacityVal = document.getElementById('opacity-val');
    this.hueVal = document.getElementById('hue-val');

    this.presetBgBtns = document.querySelectorAll('.preset-btn');
    this.presetOverlayBtns = document.querySelectorAll('.preset-overlay-btn');

    // Game Elements
    this.gameCanvas = document.getElementById('game-canvas');
    if (this.gameCanvas) this.gameCtx = this.gameCanvas.getContext('2d');

    this.gameTimerEl = document.getElementById('game-timer');
    this.gameScoreEl = document.getElementById('game-score');
    this.gameFoundEl = document.getElementById('game-found');
    this.startGameBtn = document.getElementById('start-game-btn');
    this.gameOverlayMsg = document.getElementById('game-overlay-msg');
    this.msgTitle = document.getElementById('msg-title');
    this.msgDesc = document.getElementById('msg-desc');
    this.diffBtns = document.querySelectorAll('.diff-btn');
  }

  /* 1. Tab Navigation */
  initTabNavigation() {
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabBtns.forEach(b => b.classList.remove('active'));
        this.tabWorkspaces.forEach(w => w.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        const targetWorkspace = document.getElementById(`workspace-${tabId}`);
        if (targetWorkspace) targetWorkspace.classList.add('active');

        if (tabId === 'game') {
          this.resizeGameCanvas();
        } else if (tabId === 'compositor') {
          this.renderCompositor();
        }
      });
    });
  }

  /* 2. 3D Skin Texture Events */
  init3DSkinEvents() {
    const skinBtns = document.querySelectorAll('.skin-btn');
    skinBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        skinBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const skin = btn.dataset.skin;
        if (window.threeChameleonStudio) {
          window.threeChameleonStudio.setSkin(skin);
          this.showToast(`✨ Switched 3D Skin to ${btn.innerText}`);
        }
      });
    });
  }

  /* 3. HTML5 Canvas Compositor Engine */
  initCompositorEngine() {
    if (!this.canvas) return;

    // Preset SVG Data Strings
    this.presetBgs = {
      jungle: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f2027"/><stop offset="50%" stop-color="%23203a43"/><stop offset="100%" stop-color="%232c5364"/></linearGradient></defs><rect width="800" height="500" fill="url(%23bg1)"/><circle cx="400" cy="250" r="160" fill="%2306d6a0" opacity="0.15"/><text x="400" y="240" font-family="sans-serif" font-size="28" font-weight="bold" fill="%2300ffe1" text-anchor="middle">Deep Jungle Canopy</text></svg>',
      cyber: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23090d16"/><stop offset="100%" stop-color="%231e1b4b"/></linearGradient></defs><rect width="800" height="500" fill="url(%23bg2)"/><circle cx="400" cy="250" r="180" fill="%239d4edd" opacity="0.2"/><text x="400" y="240" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23ff0055" text-anchor="middle">Cyberpunk City Grid</text></svg>',
      desert: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23371a00"/><stop offset="100%" stop-color="%2378350f"/></linearGradient></defs><rect width="800" height="500" fill="url(%23bg3)"/><circle cx="400" cy="250" r="150" fill="%23ffb703" opacity="0.2"/><text x="400" y="240" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23ffb703" text-anchor="middle">Desert Dunes</text></svg>'
    };

    this.presetOverlays = {
      camo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><circle cx="120" cy="120" r="90" fill="%2306d6a0"/><ellipse cx="95" cy="105" rx="50" ry="30" fill="%2305b386"/><circle cx="140" cy="95" r="14" fill="%23ffffff"/><circle cx="143" cy="95" r="6" fill="%23070c14"/><path d="M40 115 Q20 110 15 130 Q15 150 40 145" stroke="%2305b386" stroke-width="10" stroke-linecap="round" fill="none"/><text x="120" y="195" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23ffffff" text-anchor="middle">GREEN CAMO</text></svg>',
      neon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><circle cx="120" cy="120" r="90" fill="%2300ffe1"/><ellipse cx="95" cy="105" rx="50" ry="30" fill="%239d4edd"/><circle cx="140" cy="95" r="14" fill="%23ffffff"/><circle cx="143" cy="95" r="6" fill="%23070c14"/><text x="120" y="195" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23070c14" text-anchor="middle">NEON LIZARD</text></svg>',
      golden: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><circle cx="120" cy="120" r="90" fill="%23ffb703"/><ellipse cx="95" cy="105" rx="50" ry="30" fill="%23d97706"/><circle cx="140" cy="95" r="14" fill="%23ffffff"/><circle cx="143" cy="95" r="6" fill="%23070c14"/><text x="120" y="195" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23ffffff" text-anchor="middle">GOLDEN CREST</text></svg>'
    };

    // Load Default Presets
    this.loadPresetBg('jungle');
    this.loadPresetOverlay('camo');

    // Preset Button Click Handlers
    this.presetBgBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.presetBgBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPresetBg(btn.dataset.bg);
      });
    });

    this.presetOverlayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.presetOverlayBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadPresetOverlay(btn.dataset.ov);
      });
    });

    // Custom File Upload Handlers
    if (this.bgUploadInput) {
      this.bgUploadInput.addEventListener('change', (e) => this.handleCustomUpload(e, 'bg'));
    }
    if (this.overlayUploadInput) {
      this.overlayUploadInput.addEventListener('change', (e) => this.handleCustomUpload(e, 'overlay'));
    }

    // Sliders Input Events
    const updateFromSliders = () => {
      this.scale = parseFloat(this.scaleSlider.value) / 100;
      this.angle = parseFloat(this.rotSlider.value) * (Math.PI / 180);
      this.posX = parseFloat(this.posxSlider.value);
      this.posY = parseFloat(this.posySlider.value);
      this.opacity = parseFloat(this.opacitySlider.value) / 100;
      this.hue = parseFloat(this.hueSlider.value);
      this.blendMode = this.blendSelect.value;

      if (this.scaleVal) this.scaleVal.innerText = this.scaleSlider.value;
      if (this.rotVal) this.rotVal.innerText = this.rotSlider.value;
      if (this.posxVal) this.posxVal.innerText = this.posxSlider.value;
      if (this.posyVal) this.posyVal.innerText = this.posySlider.value;
      if (this.opacityVal) this.opacityVal.innerText = this.opacitySlider.value;
      if (this.hueVal) this.hueVal.innerText = this.hueSlider.value;

      this.renderCompositor();
    };

    [this.scaleSlider, this.rotSlider, this.posxSlider, this.posySlider, this.opacitySlider, this.hueSlider].forEach(slider => {
      if (slider) slider.addEventListener('input', updateFromSliders);
    });

    if (this.blendSelect) this.blendSelect.addEventListener('change', updateFromSliders);

    // Mouse Drag to Position Chameleon on Canvas
    if (this.canvas) {
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.updatePosFromMouse(e);
      });
      this.canvas.addEventListener('mousemove', (e) => {
        if (this.isDragging) this.updatePosFromMouse(e);
      });
      window.addEventListener('mouseup', () => { this.isDragging = false; });
    }

    // Download Button
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'composited-chameleon.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        this.showToast('📸 Downloaded composited PNG image!');
      });
    }

    window.addEventListener('resize', () => this.renderCompositor());
  }

  loadPresetBg(key) {
    const img = new Image();
    img.onload = () => {
      this.bgImage = img;
      this.renderCompositor();
    };
    img.src = this.presetBgs[key] || this.presetBgs.jungle;
  }

  loadPresetOverlay(key) {
    const img = new Image();
    img.onload = () => {
      this.overlayImage = img;
      this.renderCompositor();
    };
    img.src = this.presetOverlays[key] || this.presetOverlays.camo;
  }

  handleCustomUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        if (type === 'bg') {
          this.bgImage = img;
        } else {
          this.overlayImage = img;
        }
        this.renderCompositor();
        this.showToast(`Uploaded custom ${type === 'bg' ? 'background' : 'overlay'} photo!`);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  updatePosFromMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.posX = Math.round((x / rect.width) * 100);
    this.posY = Math.round((y / rect.height) * 100);

    if (this.posxSlider) this.posxSlider.value = this.posX;
    if (this.posySlider) this.posySlider.value = this.posY;
    if (this.posxVal) this.posxVal.innerText = this.posX;
    if (this.posyVal) this.posyVal.innerText = this.posY;

    this.renderCompositor();
  }

  renderCompositor() {
    if (!this.canvas || !this.ctx || !this.bgImage) return;

    const parent = this.canvas.parentElement;
    const maxW = parent.clientWidth || 700;
    const maxH = parent.clientHeight || 480;

    const aspect = this.bgImage.width / this.bgImage.height || 1.6;
    let w, h;
    if (maxW / maxH > aspect) {
      h = maxH;
      w = h * aspect;
    } else {
      w = maxW;
      h = w / aspect;
    }

    this.canvas.width = Math.max(200, Math.floor(w));
    this.canvas.height = Math.max(200, Math.floor(h));

    // Clear & Draw BG
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);

    // Draw Overlay Chameleon
    if (this.overlayImage) {
      const realX = (this.posX / 100) * this.canvas.width;
      const realY = (this.posY / 100) * this.canvas.height;

      this.ctx.save();
      this.ctx.globalAlpha = this.opacity;
      this.ctx.globalCompositeOperation = this.blendMode;

      if (this.hue > 0) {
        this.ctx.filter = `hue-rotate(${this.hue}deg)`;
      }

      this.ctx.translate(realX, realY);
      this.ctx.rotate(this.angle);
      this.ctx.scale(this.scale, this.scale);

      const ovW = (this.overlayImage.width * (this.canvas.width / this.bgImage.width)) || 150;
      const ovH = (this.overlayImage.height * (this.canvas.height / this.bgImage.height)) || 150;

      this.ctx.drawImage(this.overlayImage, -ovW / 2, -ovH / 2, ovW, ovH);
      this.ctx.restore();
    }
  }

  /* 4. 🎮 "Find the Chameleon" Game Engine */
  initGameEngine() {
    if (!this.gameCanvas) return;

    // Difficulty selection
    this.diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameDifficulty = btn.dataset.diff;
      });
    });

    if (this.startGameBtn) {
      this.startGameBtn.addEventListener('click', () => this.startNewGame());
    }

    this.gameCanvas.addEventListener('click', (e) => this.handleGameCanvasClick(e));
  }

  resizeGameCanvas() {
    if (!this.gameCanvas) return;
    const parent = this.gameCanvas.parentElement;
    this.gameCanvas.width = parent.clientWidth || 700;
    this.gameCanvas.height = parent.clientHeight || 480;
    this.renderGameFrame();
  }

  startNewGame() {
    this.isGameActive = true;
    this.gameTimer = 30;
    this.gameScore = 0;
    this.gameFound = 0;
    this.updateGameStatsUI();

    if (this.gameOverlayMsg) this.gameOverlayMsg.classList.add('hidden');
    this.resizeGameCanvas();
    this.spawnNextTarget();

    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => {
      this.gameTimer--;
      this.updateGameStatsUI();
      if (this.gameTimer <= 0) {
        this.endGame(false);
      }
    }, 1000);
  }

  spawnNextTarget() {
    if (!this.gameCanvas) return;
    const margin = 60;
    const x = margin + Math.random() * (this.gameCanvas.width - margin * 2);
    const y = margin + Math.random() * (this.gameCanvas.height - margin * 2);

    let radius = 35;
    if (this.gameDifficulty === 'medium') radius = 25;
    if (this.gameDifficulty === 'hard') radius = 18;

    this.currentTarget = { x, y, r: radius };
    this.renderGameFrame();
  }

  renderGameFrame() {
    if (!this.gameCanvas || !this.gameCtx) return;
    const w = this.gameCanvas.width;
    const h = this.gameCanvas.height;

    // Draw Wild Environment Background
    this.gameCtx.clearRect(0, 0, w, h);
    const grad = this.gameCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f2027');
    grad.addColorStop(0.5, '#203a43');
    grad.addColorStop(1, '#2c5364');
    this.gameCtx.fillStyle = grad;
    this.gameCtx.fillRect(0, 0, w, h);

    // Foliage Camouflage Orbs
    for (let i = 0; i < 25; i++) {
      const cx = (i * 137) % w;
      const cy = (i * 97) % h;
      this.gameCtx.fillStyle = i % 2 === 0 ? 'rgba(6, 214, 160, 0.15)' : 'rgba(0, 255, 225, 0.1)';
      this.gameCtx.beginPath();
      this.gameCtx.arc(cx, cy, 40 + (i % 5) * 10, 0, Math.PI * 2);
      this.gameCtx.fill();
    }

    // Render Camouflaged Hidden Chameleon if game is active
    if (this.isGameActive && this.currentTarget) {
      const { x, y, r } = this.currentTarget;
      let alpha = 0.25;
      if (this.gameDifficulty === 'medium') alpha = 0.15;
      if (this.gameDifficulty === 'hard') alpha = 0.08;

      this.gameCtx.save();
      this.gameCtx.globalAlpha = alpha;
      this.gameCtx.fillStyle = '#06d6a0';
      this.gameCtx.beginPath();
      this.gameCtx.arc(x, y, r, 0, Math.PI * 2);
      this.gameCtx.fill();

      // Eye indicator
      this.gameCtx.fillStyle = '#ffffff';
      this.gameCtx.beginPath();
      this.gameCtx.arc(x + r * 0.3, y - r * 0.2, r * 0.25, 0, Math.PI * 2);
      this.gameCtx.fill();
      this.gameCtx.restore();
    }
  }

  handleGameCanvasClick(e) {
    if (!this.isGameActive || !this.currentTarget) return;

    const rect = this.gameCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const dist = Math.hypot(clickX - this.currentTarget.x, clickY - this.currentTarget.y);

    if (dist <= this.currentTarget.r * 1.4) {
      // Spotted!
      this.gameFound++;
      this.gameScore += (this.gameDifficulty === 'hard' ? 300 : this.gameDifficulty === 'medium' ? 200 : 100);
      this.updateGameStatsUI();
      this.showToast('🎯 Spotted! Chameleon found!');

      if (this.gameFound >= this.gameTargetCount) {
        this.endGame(true);
      } else {
        this.spawnNextTarget();
      }
    }
  }

  updateGameStatsUI() {
    if (this.gameTimerEl) this.gameTimerEl.innerText = this.gameTimer;
    if (this.gameScoreEl) this.gameScoreEl.innerText = this.gameScore;
    if (this.gameFoundEl) this.gameFoundEl.innerText = this.gameFound;
  }

  endGame(won) {
    this.isGameActive = false;
    if (this.gameInterval) clearInterval(this.gameInterval);

    if (this.gameOverlayMsg) this.gameOverlayMsg.classList.remove('hidden');

    if (won) {
      if (this.msgTitle) this.msgTitle.innerText = '🏆 Challenge Completed!';
      if (this.msgDesc) this.msgDesc.innerText = `Outstanding! You spotted all 5 hidden chameleons with a score of ${this.gameScore}!`;
    } else {
      if (this.msgTitle) this.msgTitle.innerText = '⏱️ Time Expired!';
      if (this.msgDesc) this.msgDesc.innerText = `You found ${this.gameFound} chameleons with a score of ${this.gameScore}. Try again!`;
    }
  }

  showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }
}

// Instantiate App
document.addEventListener('DOMContentLoaded', () => {
  window.chameleonApp = new ChameleonApp();
});
