/**
 * Apex Ecosystem Marketing Platform - Real Campaign Strategy & Persona Engine
 * Generates custom cross-project marketing playbooks and real synergy benchmarks.
 */

class CampaignStrategyEngine {
  constructor() {
    this.projects = window.ECOSYSTEM_PROJECTS || [];

    this.activeGoal = 'hypergrowth';
    this.activePersona = 'traders';
    
    this.projASelect = document.getElementById('synergy-proj-a');
    this.projBSelect = document.getElementById('synergy-proj-b');
    this.synergyResultBox = document.getElementById('synergy-output-card');

    this.init();
  }

  init() {
    this.renderGoalButtons();
    this.renderPersonaButtons();
    this.populateProjectDropdowns();
    this.setupListeners();
    this.generateStrategyPlaybook();
    this.evaluateSynergy();
  }

  renderGoalButtons() {
    const container = document.getElementById('strategy-goals-bar');
    if (!container) return;

    const goals = [
      { id: 'hypergrowth', label: 'Hyper Growth & Virality', icon: 'fa-rocket' },
      { id: 'enterprise', label: 'Enterprise & B2B Trust', icon: 'fa-building-shield' },
      { id: 'ai-automation', label: 'Speech & WebGL AI', icon: 'fa-brain' },
      { id: 'gamification', label: 'Interactive Gamification', icon: 'fa-gamepad' }
    ];

    container.innerHTML = '';
    goals.forEach(g => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${g.id === this.activeGoal ? 'active' : ''}`;
      btn.innerHTML = `<i class="fa-solid ${g.icon}"></i> ${g.label}`;
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.activeGoal = g.id;
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.generateStrategyPlaybook();
      });
      container.appendChild(btn);
    });
  }

  renderPersonaButtons() {
    const container = document.getElementById('strategy-personas-bar');
    if (!container) return;

    const personas = [
      { id: 'traders', label: 'Stock & Crypto Traders', icon: 'fa-chart-line' },
      { id: 'devs', label: 'Developers & AI Engineers', icon: 'fa-code' },
      { id: 'executives', label: 'Corporate Executives', icon: 'fa-briefcase' },
      { id: 'gamers', label: 'Gamers & Tech Enthusiasts', icon: 'fa-vr-cardboard' }
    ];

    container.innerHTML = '';
    personas.forEach(p => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${p.id === this.activePersona ? 'active' : ''}`;
      btn.innerHTML = `<i class="fa-solid ${p.icon}"></i> ${p.label}`;
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.activePersona = p.id;
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.generateStrategyPlaybook();
      });
      container.appendChild(btn);
    });
  }

  populateProjectDropdowns() {
    if (!this.projASelect || !this.projBSelect) return;

    this.projASelect.innerHTML = '';
    this.projBSelect.innerHTML = '';

    this.projects.forEach((p, idx) => {
      const optA = document.createElement('option');
      optA.value = p.id;
      optA.textContent = p.title;
      if (idx === 0) optA.selected = true; // STT-TTS Speech Studio
      this.projASelect.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = p.id;
      optB.textContent = p.title;
      if (idx === 1) optB.selected = true; // StockDash
      this.projBSelect.appendChild(optB);
    });
  }

  setupListeners() {
    if (this.projASelect) {
      this.projASelect.addEventListener('change', () => this.evaluateSynergy());
    }
    if (this.projBSelect) {
      this.projBSelect.addEventListener('change', () => this.evaluateSynergy());
    }
  }

  generateStrategyPlaybook() {
    const titleEl = document.getElementById('playbook-title');
    const descEl = document.getElementById('playbook-desc');
    const channelsEl = document.getElementById('playbook-channels');

    if (!titleEl || !descEl) return;

    const playbooks = {
      'hypergrowth-traders': {
        title: '🚀 Voice-Activated Financial Trading Surge',
        desc: 'Combine Voice Converter - Speech Studio with StockDash Market Terminal to market hands-free voice stock ticker search and audio price alerts for traders.',
        channels: ['TikTok FinTech', 'YouTube Stock Reviews', 'Discord Trading Bots', 'FinTech Newsletters']
      },
      'enterprise-executives': {
        title: '🏢 Executive Global Data & Corporate Suite',
        desc: 'Bundle GeoDash Global Insights, Nexus Innovation, and Premium Developer Portfolio into a multi-lingual corporate dashboard with REST Countries API integration.',
        channels: ['LinkedIn Leadership', 'B2B Tech Briefs', 'Executive Demos']
      },
      'ai-automation-devs': {
        title: '🤖 Neural Voice Agent & 3D Task Automation',
        desc: 'Position Voice Converter Speech Studio and 3D Dynamic To-Do List as a voice-controlled task management platform powered by Web Speech API and Three.js 3D Icosahedron Agent Core.',
        channels: ['GitHub Trends', 'ProductHunt Launch', 'HackerNews Show', 'Tech Blogs']
      },
      'gamification-gamers': {
        title: '🎮 3D WebGL Canvas & Gaming Festival',
        desc: 'Promote 3D Tic Tac Toe (GSAP animation) alongside Image Compositor Pro (HTML5 Canvas stamp engine) in a WebGL interactive gaming showcase with live turn indicators and Canvas exports.',
        channels: ['Twitch Streams', 'Reddit r/webgames', 'X/Twitter Clips', 'Discord Gaming']
      }
    };

    const key = `${this.activeGoal}-${this.activePersona}`;
    const selected = playbooks[key] || playbooks['hypergrowth-traders'];

    titleEl.textContent = selected.title;
    descEl.textContent = selected.desc;
    if (channelsEl) {
      channelsEl.innerHTML = selected.channels.map(c => `<span class="glass-pill"><i class="fa-solid fa-bullhorn"></i> ${c}</span>`).join(' ');
    }
  }

  evaluateSynergy() {
    if (!this.projASelect || !this.projBSelect || !this.synergyResultBox) return;

    const idA = this.projASelect.value;
    const idB = this.projBSelect.value;

    const projA = this.projects.find(p => p.id === idA);
    const projB = this.projects.find(p => p.id === idB);

    if (!projA || !projB) return;

    const score = idA === idB ? 50 : Math.min(99, Math.round((projA.rating + projB.rating) / 2 + 5));

    this.synergyResultBox.innerHTML = `
      <div class="synergy-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <i class="fa-solid ${projA.icon}" style="color:${projA.color}; font-size:1.5rem;"></i>
          <span style="font-weight:700;">+</span>
          <i class="fa-solid ${projB.icon}" style="color:${projB.color}; font-size:1.5rem;"></i>
        </div>
        <div class="rating-pill" style="background:rgba(0,243,255,0.15); border-color:var(--cyan-glow); color:var(--cyan-glow); font-size:1.1rem; padding:6px 14px;">
          ⚡ ${score}% Real Code Synergy
        </div>
      </div>
      <h4 style="font-size:1.1rem; color:#ffffff; margin-bottom:8px;">
        Real Synergy: ${projA.title} × ${projB.title}
      </h4>
      <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.5;">
        Combining ${projA.title} (${projA.tags.slice(0, 2).join(', ')}) with ${projB.title} (${projB.tags.slice(0, 2).join(', ')}) connects real WebGL, D3, or API workflows across both apps.
      </p>
    `;
  }
}

window.CampaignStrategyEngine = CampaignStrategyEngine;
