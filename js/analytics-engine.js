/**
 * Apex Ecosystem Marketing Platform - Real Analytics & Dynamic Recommendation Engine
 * Background telemetry tracker, JSON persistence, live session timing, and project usage renderer.
 */

class EcosystemAnalyticsEngine {
  constructor() {
    this.storageKey = 'apex_ecosystem_analytics_v1';
    this.projects = window.ECOSYSTEM_PROJECTS || [];
    
    this.data = this.loadAnalyticsData();
    this.activeVisit = null;
    this.sessionSeconds = 0;
    this.totalLaunches = 0;

    this.init();
  }

  init() {
    this.startSessionTimer();
    this.renderTelemetrySectionGrid();
  }

  loadAnalyticsData() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }

    const initialProjectsData = {};
    (window.ECOSYSTEM_PROJECTS || []).forEach(p => {
      initialProjectsData[p.id] = {
        projectId: p.id,
        title: p.title,
        category: p.category,
        visitCount: 0,
        totalTimeSeconds: 0,
        lastVisited: null,
        recommendationScore: p.rating
      };
    });

    return {
      sessionCount: 1,
      totalGlobalSeconds: 0,
      projects: initialProjectsData,
      userCategoryAffinity: {
        ai: 0,
        finance: 0,
        productivity: 0,
        games: 0,
        enterprise: 0
      }
    };
  }

  saveAnalyticsData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
  }

  startSessionTimer() {
    const timerEl = document.getElementById('section-session-timer');

    setInterval(() => {
      this.sessionSeconds++;
      this.data.totalGlobalSeconds++;
      if (timerEl) {
        const mins = String(Math.floor(this.sessionSeconds / 60)).padStart(2, '0');
        const secs = String(this.sessionSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
      this.saveAnalyticsData();
    }, 1000);
  }

  startProjectVisit(projectId) {
    if (this.activeVisit) {
      this.endProjectVisit();
    }

    this.activeVisit = {
      projectId,
      startTime: Date.now()
    };

    const pData = this.data.projects[projectId];
    if (pData) {
      pData.visitCount++;
      this.totalLaunches++;
      pData.lastVisited = new Date().toISOString();
      if (pData.category && this.data.userCategoryAffinity[pData.category] !== undefined) {
        this.data.userCategoryAffinity[pData.category] += 2;
      }
    }

    const launchEl = document.getElementById('section-launch-counter');
    if (launchEl) launchEl.textContent = this.totalLaunches;

    this.recalculateRecommendations();
    this.saveAnalyticsData();
    this.updateUI();
  }

  endProjectVisit() {
    if (!this.activeVisit) return;

    const durationSeconds = Math.round((Date.now() - this.activeVisit.startTime) / 1000);
    const pData = this.data.projects[this.activeVisit.projectId];

    if (pData && durationSeconds > 0) {
      pData.totalTimeSeconds += durationSeconds;
      if (pData.category && this.data.userCategoryAffinity[pData.category] !== undefined) {
        this.data.userCategoryAffinity[pData.category] += Math.min(10, durationSeconds);
      }
    }

    this.activeVisit = null;
    this.recalculateRecommendations();
    this.saveAnalyticsData();
    this.updateUI();
  }

  recalculateRecommendations() {
    this.projects.forEach(p => {
      const pData = this.data.projects[p.id];
      if (!pData) return;

      const categoryWeight = (this.data.userCategoryAffinity[p.category] || 0) * 1.5;
      const visitWeight = pData.visitCount * 3;
      const timeWeight = (pData.totalTimeSeconds / 10) * 2;

      pData.recommendationScore = Math.round(p.rating + categoryWeight + visitWeight + timeWeight);
    });
  }

  getTopRecommendedProjects(limit = 3) {
    return [...this.projects].sort((a, b) => {
      const scoreA = (this.data.projects[a.id] && this.data.projects[a.id].recommendationScore) || a.rating;
      const scoreB = (this.data.projects[b.id] && this.data.projects[b.id].recommendationScore) || b.rating;
      return scoreB - scoreA;
    }).slice(0, limit);
  }

  exportAnalyticsJSON() {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      platform: 'Apex Ecosystem Marketing Portal',
      sessionInfo: {
        totalGlobalSeconds: this.data.totalGlobalSeconds,
        formattedGlobalTime: `${Math.floor(this.data.totalGlobalSeconds / 60)}m ${this.data.totalGlobalSeconds % 60}s`,
        activeCategoryAffinity: this.data.userCategoryAffinity
      },
      projectsAnalytics: Object.values(this.data.projects).map(p => ({
        projectId: p.projectId,
        title: p.title,
        category: p.category,
        totalVisits: p.visitCount,
        totalTimeSpentSeconds: p.totalTimeSeconds,
        averageTimeSpentSeconds: p.visitCount > 0 ? Math.round(p.totalTimeSeconds / p.visitCount) : 0,
        lastVisitedTimestamp: p.lastVisited,
        dynamicRecommendationScore: p.recommendationScore
      })),
      topRecommendedProjects: this.getTopRecommendedProjects(3).map(p => p.title)
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosystem_analytics_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  renderTelemetrySectionGrid() {
    const gridContainer = document.getElementById('project-telemetry-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    this.projects.forEach(p => {
      const pData = this.data.projects[p.id] || { visitCount: 0, totalTimeSeconds: 0 };
      const mins = Math.floor(pData.totalTimeSeconds / 60);
      const secs = pData.totalTimeSeconds % 60;

      const item = document.createElement('div');
      item.className = 'telemetry-item-card glass-panel';
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
          <i class="fa-solid ${p.icon}" style="color:${p.color}; font-size:1.2rem;"></i>
          <span style="font-weight:700; color:#ffffff; font-size:0.95rem;">${p.title}</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.8rem; font-family:var(--font-code);">
          <div style="color:var(--cyan-glow);"><i class="fa-solid fa-eye"></i> ${pData.visitCount} Visits</div>
          <div style="color:var(--emerald-glow);"><i class="fa-regular fa-clock"></i> ${mins}m ${secs}s</div>
        </div>
      `;
      gridContainer.appendChild(item);
    });
  }

  updateUI() {
    this.renderTelemetrySectionGrid();
    if (window.launcherManager && window.launcherManager.renderProjectGrid) {
      window.launcherManager.renderProjectGrid();
    }
  }
}

window.EcosystemAnalyticsEngine = EcosystemAnalyticsEngine;
