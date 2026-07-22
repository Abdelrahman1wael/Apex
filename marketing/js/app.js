/**
 * Apex Ecosystem Marketing Platform - Main Application Controller
 * Orchestrates Three.js 3D Holodeck, Real Analytics Engine, Voice Narrator, Launcher Modal, and Custom Cursor.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initSoundToggle();

  // 1. Initialize Real Ecosystem Analytics Engine & JSON Exporter
  if (window.EcosystemAnalyticsEngine) {
    window.analyticsEngine = new window.EcosystemAnalyticsEngine();
  }

  // Export Analytics JSON Button Event in Telemetry Section
  const exportJsonBtn = document.getElementById('section-export-json-btn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      if (window.analyticsEngine) window.analyticsEngine.exportAnalyticsJSON();
    });
  }

  // 2. Three.js 3D Holodeck Canvas
  const galaxyContainerId = 'three-canvas-container';
  let galaxyApp = null;

  if (window.EcosystemGalaxy && document.getElementById(galaxyContainerId)) {
    galaxyApp = new window.EcosystemGalaxy(galaxyContainerId, (selectedProject) => {
      handlePlanetSelection(selectedProject);
      if (window.voiceAgent) {
        window.voiceAgent.speakProject(selectedProject.id);
      }
    });
    window.galaxyApp = galaxyApp;
  }

  // 3. 3D Holodeck Viewport Mode Switcher
  initHolodeckModes(galaxyApp);

  // 4. Voice Narrator Agent
  if (window.VoiceNarratorAgent) {
    window.voiceAgent = new window.VoiceNarratorAgent();
  }

  // 5. Project Launcher & Modal Manager for 10 Projects
  let launcherManager = null;
  if (window.ProjectLauncherManager) {
    launcherManager = new window.ProjectLauncherManager();
    window.launcherManager = launcherManager;
  }

  // 6. Reset Camera View Button
  const resetBtn = document.getElementById('reset-camera-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      if (galaxyApp) galaxyApp.resetView();
      hidePlanetDetailPanel();
    });
  }

  // 7. Planet Detail Drawer Close & Launch Controls
  const detailCloseBtn = document.getElementById('detail-panel-close');
  if (detailCloseBtn) {
    detailCloseBtn.addEventListener('click', () => hidePlanetDetailPanel());
  }

  const detailLaunchBtn = document.getElementById('detail-launch-btn');
  if (detailLaunchBtn) {
    detailLaunchBtn.addEventListener('click', () => {
      const projId = detailLaunchBtn.getAttribute('data-id');
      if (launcherManager && projId) {
        launcherManager.launchProject(projId);
      }
    });
  }

  // 8. Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        if (window.soundEngine) window.soundEngine.playClick();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

/* =========================================================
 * Helper Functions
 * ========================================================= */

function initCustomCursor() {
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (!cursorDot || !cursorRing) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();
}

function initSoundToggle() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    if (window.soundEngine) {
      const enabled = window.soundEngine.toggleSound();
      soundBtn.innerHTML = enabled 
        ? '<i class="fa-solid fa-volume-high"></i>' 
        : '<i class="fa-solid fa-volume-xmark"></i>';
      soundBtn.classList.toggle('muted', !enabled);
    }
  });
}

function initHolodeckModes(galaxyApp) {
  const btnConstellation = document.getElementById('mode-constellation-btn');
  const btnHoloTable = document.getElementById('mode-holotable-btn');
  const btnWarpTunnel = document.getElementById('mode-warptunnel-btn');

  const modeBtns = [btnConstellation, btnHoloTable, btnWarpTunnel].filter(Boolean);

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      if (galaxyApp) galaxyApp.setMode(mode);
    });
  });
}

function handlePlanetSelection(project) {
  const panel = document.getElementById('planet-detail-panel');
  if (!panel) return;

  document.getElementById('detail-title').textContent = project.title;
  document.getElementById('detail-subtitle').textContent = project.subtitle;
  document.getElementById('detail-desc').textContent = project.description;
  document.getElementById('detail-cat').textContent = project.categoryLabel;
  document.getElementById('detail-rating').textContent = `${project.rating}%`;
  
  const icon = document.getElementById('detail-icon');
  if (icon) {
    icon.className = `fa-solid ${project.icon}`;
    icon.style.color = project.color;
  }

  const launchBtn = document.getElementById('detail-launch-btn');
  if (launchBtn) {
    launchBtn.setAttribute('data-id', project.id);
    launchBtn.style.background = `linear-gradient(135deg, ${project.color}, #3a86ff)`;
  }

  panel.classList.add('visible');
}

function hidePlanetDetailPanel() {
  const panel = document.getElementById('planet-detail-panel');
  if (panel) panel.classList.remove('visible');
  if (window.galaxyApp) window.galaxyApp.resetView();
}
