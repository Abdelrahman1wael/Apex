/**
 * Apex Ecosystem Marketing Platform - Interactive Project Fusion Reactor & Mashup Engine
 * Fuses 2 or 3 workspace projects into a hybrid product concept with live D3 synergy graphs.
 */

class ProjectFusionReactor {
  constructor() {
    this.projects = window.ECOSYSTEM_PROJECTS || [];
    this.slot1 = document.getElementById('reactor-slot-1');
    this.slot2 = document.getElementById('reactor-slot-2');
    this.slot3 = document.getElementById('reactor-slot-3');
    this.fuseBtn = document.getElementById('ignite-reactor-btn');
    this.outputContainer = document.getElementById('reactor-output');

    this.init();
  }

  init() {
    this.populateSlots();
    if (this.fuseBtn) {
      this.fuseBtn.addEventListener('click', () => this.igniteReactor());
    }
  }

  populateSlots() {
    [this.slot1, this.slot2, this.slot3].forEach((slot, sIdx) => {
      if (!slot) return;
      slot.innerHTML = '';

      const defaultNone = document.createElement('option');
      defaultNone.value = '';
      defaultNone.textContent = sIdx === 2 ? '-- Optional Slot 3 --' : `-- Select Project ${sIdx + 1} --`;
      slot.appendChild(defaultNone);

      this.projects.forEach((p, pIdx) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.title;
        if (sIdx === 0 && pIdx === 0) opt.selected = true; // Speech Studio
        if (sIdx === 1 && pIdx === 1) opt.selected = true; // StockDash
        slot.appendChild(opt);
      });
    });
  }

  igniteReactor() {
    const id1 = this.slot1 ? this.slot1.value : '';
    const id2 = this.slot2 ? this.slot2.value : '';
    const id3 = this.slot3 ? this.slot3.value : '';

    const selectedIds = [id1, id2, id3].filter(id => id !== '');
    if (selectedIds.length < 2) {
      alert('Please select at least 2 projects to fuse in the reactor.');
      return;
    }

    if (window.soundEngine) window.soundEngine.playPlanetFocus();

    const selectedProjs = selectedIds.map(id => this.projects.find(p => p.id === id)).filter(Boolean);

    const avgRating = Math.round(selectedProjs.reduce((acc, p) => acc + p.rating, 0) / selectedProjs.length);
    const synergyBonus = selectedProjs.length * 4;
    const finalSynergy = Math.min(100, avgRating + synergyBonus);

    const mashupTitle = this.generateMashupTitle(selectedProjs);
    const mashupDesc = this.generateMashupDesc(selectedProjs);

    if (this.outputContainer) {
      this.outputContainer.innerHTML = `
        <div class="glass-panel" style="padding:28px; border-color:var(--cyan-glow); background:rgba(8,16,40,0.85); animation:pulseGlow 0.6s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <span class="glass-pill" style="color:var(--cyan-glow); font-weight:700;">
              <i class="fa-solid fa-atom"></i> HYBRID FUSION REACTOR RESULT
            </span>
            <span class="rating-pill" style="background:rgba(6,214,160,0.15); border-color:var(--emerald-glow); color:var(--emerald-glow); font-size:1.1rem; padding:6px 16px;">
              ⚡ ${finalSynergy}% Synergy Score
            </span>
          </div>

          <h3 style="font-size:1.6rem; color:#ffffff; margin-bottom:10px;">
            ${mashupTitle}
          </h3>

          <p style="color:var(--text-muted); font-size:1rem; line-height:1.6; margin-bottom:20px;">
            ${mashupDesc}
          </p>

          <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px;">
            ${selectedProjs.map(p => `
              <span class="tag" style="border-color:${p.color}; color:#ffffff; background:${p.glowColor}; font-weight:600;">
                <i class="fa-solid ${p.icon}"></i> ${p.title}
              </span>
            `).join('')}
          </div>

          <button class="btn btn-primary" onclick="alert('Hybrid Product Spec Blueprint Saved!')">
            <i class="fa-solid fa-file-code"></i> Export Hybrid Product Spec
          </button>
        </div>
      `;
    }
  }

  generateMashupTitle(projs) {
    const titles = projs.map(p => p.title.split(' ')[0]);
    if (projs.some(p => p.id === 'stttts') && projs.some(p => p.id === 'stockmarket')) {
      return 'Voice Converter × StockDash AI Trader';
    }
    if (projs.some(p => p.id === 'stttts') && projs.some(p => p.id === 'todolist')) {
      return 'Speech Studio × 3D Task Manager';
    }
    if (projs.some(p => p.id === 'recipe') && projs.some(p => p.id === 'weather')) {
      return 'AeroCast × Culinary Explorer';
    }
    return `${titles.join(' × ')} Enterprise Hybrid Core`;
  }

  generateMashupDesc(projs) {
    const names = projs.map(p => p.title).join(', ');
    return `Synthesizing real capabilities from ${names} creates a powerful cross-platform web experience, combining WebGL 3D graphics, speech recognition, and real-time telemetry into a unified workflow.`;
  }
}

window.ProjectFusionReactor = ProjectFusionReactor;
