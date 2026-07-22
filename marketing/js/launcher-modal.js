/**
 * Apex Ecosystem Marketing Platform - Interactive Project Showcase & Live Modal Launcher
 * Manages category filtering, showcase card rendering, dynamic recommendation badges, and live iframe project launcher.
 */

class ProjectLauncherManager {
  constructor() {
    this.projects = window.ECOSYSTEM_PROJECTS || [];
    this.categories = window.ECOSYSTEM_CATEGORIES || [];
    this.currentCategory = 'all';

    this.gridContainer = document.getElementById('project-grid-container');
    this.categoryBar = document.getElementById('category-filter-bar');
    this.modal = document.getElementById('project-launcher-modal');
    this.modalIframe = document.getElementById('launcher-iframe');
    this.modalTitle = document.getElementById('modal-project-title');
    this.modalIcon = document.getElementById('modal-project-icon');
    this.modalExternalLink = document.getElementById('modal-external-link');

    this.init();
  }

  init() {
    this.renderCategoryFilters();
    this.renderProjectGrid();
    this.setupModalEvents();
  }

  renderCategoryFilters() {
    if (!this.categoryBar) return;
    this.categoryBar.innerHTML = '';

    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${cat.id === this.currentCategory ? 'active' : ''}`;
      btn.innerHTML = `<i class="fa-solid ${cat.icon}"></i> ${cat.label}`;
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.currentCategory = cat.id;
        this.updateFilterButtons();
        this.renderProjectGrid();
      });
      this.categoryBar.appendChild(btn);
    });
  }

  updateFilterButtons() {
    const buttons = this.categoryBar.querySelectorAll('.filter-btn');
    buttons.forEach((btn, idx) => {
      if (this.categories[idx].id === this.currentCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  renderProjectGrid() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    const filtered = this.currentCategory === 'all'
      ? this.projects
      : this.projects.filter(p => p.category === this.currentCategory);

    // Get Top Recommended Projects from Analytics Engine
    const topRecs = window.analyticsEngine 
      ? window.analyticsEngine.getTopRecommendedProjects(3).map(p => p.id)
      : ['stttts', 'stockmarket', 'dashboard'];

    filtered.forEach(proj => {
      const isRecommended = topRecs.includes(proj.id);
      const analyticsData = window.analyticsEngine && window.analyticsEngine.data.projects[proj.id];
      const visits = analyticsData ? analyticsData.visitCount : 0;
      const totalSecs = analyticsData ? analyticsData.totalTimeSeconds : 0;

      const card = document.createElement('div');
      card.className = `project-card glass-panel ${isRecommended ? 'recommended-card' : ''}`;
      card.setAttribute('data-id', proj.id);

      card.innerHTML = `
        ${isRecommended ? `<div class="recommendation-badge"><i class="fa-solid fa-fire"></i> RECOMMENDED FOR YOU</div>` : ''}
        
        <div class="card-header">
          <div class="icon-avatar" style="background:${proj.glowColor}; color:${proj.color};">
            <i class="fa-solid ${proj.icon}"></i>
          </div>
          <div class="card-title-group">
            <h3>${proj.title}</h3>
            <span class="badge-cat">${proj.categoryLabel}</span>
          </div>
          <div class="rating-pill">
            <i class="fa-solid fa-star"></i> ${proj.rating}%
          </div>
        </div>

        <p class="card-description">${proj.description}</p>

        <!-- Real Analytics Stats Ribbon -->
        <div class="card-real-stats">
          <span><i class="fa-solid fa-eye"></i> ${visits} Visits</span>
          <span><i class="fa-regular fa-clock"></i> ${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s Spent</span>
        </div>

        <div class="card-metrics">
          <div class="metric-item">
            <span class="m-label">AI Score</span>
            <div class="m-bar"><div class="m-fill" style="width:${proj.metrics.aiScore}%; background:${proj.color}"></div></div>
          </div>
          <div class="metric-item">
            <span class="m-label">3D / Graphics</span>
            <div class="m-bar"><div class="m-fill" style="width:${proj.metrics.graphics}%; background:${proj.color}"></div></div>
          </div>
        </div>

        <div class="card-tags">
          ${proj.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>

        <div class="card-actions">
          <button class="btn btn-primary launch-btn" data-id="${proj.id}">
            <i class="fa-solid fa-rocket"></i> Launch Live App
          </button>
          <button class="btn btn-secondary focus-3d-btn" data-id="${proj.id}">
            <i class="fa-solid fa-atom"></i> 3D Focus
          </button>
        </div>
      `;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = `perspective(1000px) rotateY(${x * 0.04}deg) rotateX(${-y * 0.04}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)';
      });

      const launchBtn = card.querySelector('.launch-btn');
      launchBtn.addEventListener('click', () => this.launchProject(proj.id));

      const focusBtn = card.querySelector('.focus-3d-btn');
      focusBtn.addEventListener('click', () => {
        if (window.galaxyApp) window.galaxyApp.selectPlanet(proj.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      this.gridContainer.appendChild(card);
    });
  }

  launchProject(projectId) {
    const proj = this.projects.find(p => p.id === projectId);
    if (!proj) return;

    if (window.soundEngine) window.soundEngine.playModalOpen();

    // Start Real Project Visit Timer
    if (window.analyticsEngine) {
      window.analyticsEngine.startProjectVisit(projectId);
    }

    this.modalTitle.textContent = proj.title;
    this.modalIcon.className = `fa-solid ${proj.icon}`;
    this.modalIcon.style.color = proj.color;
    this.modalExternalLink.href = proj.path;

    this.modalIframe.src = proj.path;
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (window.soundEngine) window.soundEngine.playClick();

    // End Real Project Visit Timer
    if (window.analyticsEngine) {
      window.analyticsEngine.endProjectVisit();
    }

    this.modal.classList.remove('open');
    this.modalIframe.src = 'about:blank';
    document.body.style.overflow = 'auto';
  }

  setupModalEvents() {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('open')) {
        this.closeModal();
      }
    });
  }
}

window.ProjectLauncherManager = ProjectLauncherManager;
