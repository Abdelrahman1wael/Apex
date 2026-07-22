/**
 * Apex Ecosystem Marketing Platform - D3 Individual Project Analytics & Telemetry Engine
 * Renders D3 charts, tracks live project launch views, and monitors user session duration for every project.
 */

class ProjectAnalyticsEngine {
  constructor() {
    this.projects = window.ECOSYSTEM_PROJECTS || [];
    this.projectStats = new Map();
    this.sessionSeconds = 0;
    this.totalLaunches = 0;

    this.initStats();
    this.startSessionTimer();
    this.initModalEvents();
  }

  initStats() {
    this.projects.forEach(p => {
      this.projectStats.set(p.id, {
        views: Math.floor(Math.random() * 500) + 120,
        totalTimeMinutes: Math.floor(Math.random() * 1200) + 300,
        hourlyActivity: Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 80) + 20)
      });
    });
  }

  startSessionTimer() {
    const timerEl = document.getElementById('global-session-timer');
    const liveUsersEl = document.getElementById('global-live-users');

    // Live Users Fluctuation
    let activeUsers = 1420;
    setInterval(() => {
      activeUsers += Math.floor(Math.random() * 7) - 3;
      if (liveUsersEl) liveUsersEl.textContent = activeUsers.toLocaleString();
    }, 3000);

    // Session Timer
    setInterval(() => {
      this.sessionSeconds++;
      if (timerEl) {
        const mins = String(Math.floor(this.sessionSeconds / 60)).padStart(2, '0');
        const secs = String(this.sessionSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  trackProjectLaunch(projectId) {
    const stats = this.projectStats.get(projectId);
    if (stats) {
      stats.views++;
      this.totalLaunches++;
      const launchCounterEl = document.getElementById('global-launch-counter');
      if (launchCounterEl) launchCounterEl.textContent = this.totalLaunches;
    }
  }

  openProjectAnalytics(projectId) {
    const proj = this.projects.find(p => p.id === projectId);
    if (!proj) return;

    const stats = this.projectStats.get(projectId);

    const modal = document.getElementById('project-analytics-modal');
    const titleEl = document.getElementById('analytics-modal-title');
    const iconEl = document.getElementById('analytics-modal-icon');
    const viewsEl = document.getElementById('analytics-views-count');
    const timeEl = document.getElementById('analytics-time-count');

    if (titleEl) titleEl.textContent = `${proj.title} - D3 Analytics`;
    if (iconEl) {
      iconEl.className = `fa-solid ${proj.icon}`;
      iconEl.style.color = proj.color;
    }
    if (viewsEl) viewsEl.textContent = stats.views.toLocaleString();
    if (timeEl) timeEl.textContent = `${stats.totalTimeMinutes} mins`;

    // Render D3 Charts for this project
    this.renderD3LineChart(stats.hourlyActivity, proj.color);
    this.renderD3GaugeRings(proj.metrics, proj.color);

    if (modal) {
      modal.classList.add('open');
      if (window.soundEngine) window.soundEngine.playModalOpen();
    }
  }

  closeModal() {
    const modal = document.getElementById('project-analytics-modal');
    if (modal) {
      modal.classList.remove('open');
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  initModalEvents() {
    const closeBtn = document.getElementById('analytics-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());

    const modal = document.getElementById('project-analytics-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }
  }

  /* =========================================================
   * D3 Charts Rendering for Individual Project
   * ========================================================= */

  renderD3LineChart(dataArray, color) {
    const container = document.getElementById('d3-proj-line-chart');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 450;
    const height = 180;
    const margin = { top: 15, right: 20, bottom: 25, left: 35 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([1, dataArray.length]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, d3.max(dataArray) * 1.2]).range([innerHeight, 0]);

    // Gradient Area
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'proj-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.4);
    grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.0);

    svg.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('color', 'rgba(255,255,255,0.2)')
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d}h`));

    svg.append('g')
      .attr('color', 'rgba(255,255,255,0.2)')
      .call(d3.axisLeft(yScale).ticks(4));

    const area = d3.area()
      .x((d, i) => xScale(i + 1))
      .y0(innerHeight)
      .y1(d => yScale(d))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(dataArray)
      .attr('fill', 'url(#proj-grad)')
      .attr('d', area);

    const line = d3.line()
      .x((d, i) => xScale(i + 1))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(dataArray)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .attr('d', line);
  }

  renderD3GaugeRings(metrics, color) {
    const container = document.getElementById('d3-proj-gauge-container');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 450;
    const height = 180;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height);

    const items = [
      { label: 'AI Score', val: metrics.aiScore, x: width * 0.2, c: '#9d4edd' },
      { label: '3D Visuals', val: metrics.graphics, x: width * 0.5, c: '#00f3ff' },
      { label: 'Utility', val: metrics.utility, x: width * 0.8, c: '#06d6a0' }
    ];

    items.forEach(item => {
      const g = svg.append('g').attr('transform', `translate(${item.x}, ${height / 2})`);
      const radius = 38;

      const arcBg = d3.arc().innerRadius(radius - 6).outerRadius(radius).startAngle(0).endAngle(2 * Math.PI);
      g.append('path').attr('d', arcBg).attr('fill', 'rgba(255,255,255,0.08)');

      const arcVal = d3.arc().innerRadius(radius - 6).outerRadius(radius).startAngle(0).endAngle((item.val / 100) * 2 * Math.PI);
      g.append('path').attr('d', arcVal).attr('fill', item.c);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#ffffff')
        .attr('font-size', '13px')
        .attr('font-weight', '700')
        .text(`${item.val}%`);

      g.append('text')
        .attr('y', radius + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '11px')
        .text(item.label);
    });
  }
}

window.ProjectAnalyticsEngine = ProjectAnalyticsEngine;
