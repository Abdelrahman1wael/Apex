/**
 * Apex Ecosystem Marketing Platform - D3.js Command Center & Ecosystem Telemetry Hub
 * Renders Capability Sunburst Wheel, Benchmark Matrix Chart, Live Telemetry Stream, and D3 Global Heatmap.
 */

class D3AnalyticsEngine {
  constructor() {
    this.projects = window.ECOSYSTEM_PROJECTS || [];

    this.initSunburstWheel();
    this.initBenchmarkMatrix();
    this.initGlobalHeatmap();
    this.initLiveTelemetryFeed();
  }

  /* =========================================================
   * 1. D3 Capability Sunburst Wheel (10 Projects Hierarchy)
   * ========================================================= */
  initSunburstWheel() {
    const container = document.getElementById('d3-sunburst-container');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 550;
    const height = 420;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const hierarchyData = {
      name: 'Ecosystem',
      children: [
        {
          name: 'AI & Audio',
          color: '#9d4edd',
          children: [
            { name: 'Voice Studio', value: 99, id: 'stttts' }
          ]
        },
        {
          name: 'Finance & Data',
          color: '#00ffe1',
          children: [
            { name: 'StockDash', value: 98, id: 'stockmarket' },
            { name: 'GeoDash', value: 96, id: 'dashboard' }
          ]
        },
        {
          name: 'Productivity',
          color: '#7000ff',
          children: [
            { name: '3D Tasks', value: 96, id: 'todolist' },
            { name: 'Weather App', value: 93, id: 'weather' },
            { name: 'Recipe Explorer', value: 91, id: 'recipe' }
          ]
        },
        {
          name: 'Interactive Tools',
          color: '#06d6a0',
          children: [
            { name: 'Chameleon Pro 3D', value: 99, id: 'chameleon' },
            { name: '3D Tic Tac Toe', value: 90, id: 'tictactoe' }
          ]
        },
        {
          name: 'Enterprise & Portfolio',
          color: '#ff007f',
          children: [
            { name: 'Dev Portfolio', value: 95, id: 'portfolio' },
            { name: 'Nexus Company', value: 94, id: 'company' }
          ]
        }
      ]
    };

    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const partition = d3.partition().size([2 * Math.PI, radius]);
    partition(root);

    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)
      .padAngle(0.02)
      .padRadius(radius / 2);

    const path = svg.selectAll('path')
      .data(root.descendants().filter(d => d.depth > 0))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color || (d.parent && d.parent.data.color) || '#00f3ff')
      .attr('opacity', d => (d.depth === 1 ? 0.85 : 0.65))
      .attr('stroke', '#050714')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    path.on('mouseover', function(e, d) {
      d3.select(this)
        .transition().duration(150)
        .attr('opacity', 1)
        .attr('transform', 'scale(1.03)');
      if (window.soundEngine) window.soundEngine.playHover();
    }).on('mouseout', function(e, d) {
      d3.select(this)
        .transition().duration(150)
        .attr('opacity', d => (d.depth === 1 ? 0.85 : 0.65))
        .attr('transform', 'scale(1)');
    }).on('click', (e, d) => {
      if (d.data.id && window.galaxyApp) {
        if (window.soundEngine) window.soundEngine.playClick();
        window.galaxyApp.selectPlanet(d.data.id);
      }
    });

    svg.selectAll('text')
      .data(root.descendants().filter(d => d.depth === 2))
      .enter()
      .append('text')
      .attr('transform', d => {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .text(d => d.data.name);
  }

  /* =========================================================
   * 2. D3 Benchmark Matrix Chart (Grouped Bars)
   * ========================================================= */
  initBenchmarkMatrix() {
    const container = document.getElementById('d3-benchmark-container');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 550;
    const height = 420;
    const margin = { top: 30, right: 20, bottom: 60, left: 50 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const data = this.projects.slice(0, 8);

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.title.split(' ')[0]))
      .range([0, innerWidth])
      .padding(0.25);

    const metricsKeys = ['aiScore', 'graphics', 'utility'];
    const x1 = d3.scaleBand()
      .domain(metricsKeys)
      .range([0, x0.bandwidth()])
      .padding(0.08);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    const colorMap = {
      aiScore: '#9d4edd',
      graphics: '#00f3ff',
      utility: '#06d6a0'
    };

    svg.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('color', 'rgba(255,255,255,0.4)')
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('transform', 'rotate(-25)')
      .style('text-anchor', 'end')
      .attr('fill', '#e0e6ed');

    svg.append('g')
      .attr('color', 'rgba(255,255,255,0.4)')
      .call(d3.axisLeft(yScale).ticks(5));

    const projectGroups = svg.selectAll('.proj-bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${x0(d.title.split(' ')[0])}, 0)`);

    projectGroups.selectAll('rect')
      .data(d => metricsKeys.map(k => ({ key: k, value: d.metrics[k], color: colorMap[k] })))
      .enter()
      .append('rect')
      .attr('x', d => x1(d.key))
      .attr('y', innerHeight)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('rx', 4)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.value))
      .attr('height', d => innerHeight - yScale(d.value));

    const legend = svg.append('g').attr('transform', `translate(${innerWidth - 220}, -15)`);
    const labels = [
      { key: 'aiScore', label: 'AI Score', color: '#9d4edd' },
      { key: 'graphics', label: '3D Visuals', color: '#00f3ff' },
      { key: 'utility', label: 'Utility', color: '#06d6a0' }
    ];

    labels.forEach((l, i) => {
      const legG = legend.append('g').attr('transform', `translate(${i * 75}, 0)`);
      legG.append('rect').attr('width', 10).attr('height', 10).attr('fill', l.color).attr('rx', 2);
      legG.append('text').attr('x', 14).attr('y', 9).attr('fill', '#e0e6ed').attr('font-size', '10px').text(l.label);
    });
  }

  /* =========================================================
   * 3. D3 Global User Engagement Heatmap Matrix
   * ========================================================= */
  initGlobalHeatmap() {
    const container = document.getElementById('d3-global-heatmap-container');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 550;
    const height = 240;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height);

    const hubs = [
      { name: 'San Francisco', x: 80, y: 80, load: 98, color: '#00f3ff' },
      { name: 'New York', x: 160, y: 70, load: 94, color: '#9d4edd' },
      { name: 'London', x: 260, y: 60, load: 92, color: '#3a86ff' },
      { name: 'Berlin', x: 310, y: 65, load: 89, color: '#ff007f' },
      { name: 'Tokyo', x: 440, y: 90, load: 99, color: '#06d6a0' },
      { name: 'Singapore', x: 410, y: 140, load: 95, color: '#ffb703' }
    ];

    const hubG = svg.selectAll('.hub')
      .data(hubs)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    hubG.append('circle')
      .attr('r', 16)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.6);

    hubG.append('circle')
      .attr('r', 6)
      .attr('fill', d => d.color);

    hubG.append('text')
      .attr('dy', 26)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e0e6ed')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text(d => `${d.name} (${d.load}%)`);
  }

  /* =========================================================
   * 4. Live Telemetry Stream Terminal Feed
   * ========================================================= */
  initLiveTelemetryFeed() {
    const feedContainer = document.getElementById('live-telemetry-feed');
    if (!feedContainer) return;

    const sampleLogs = [
      { tag: 'SPEECH STUDIO', color: '#9d4edd', msg: 'Speech recognition engine calibrated: 99.4% accuracy' },
      { tag: 'STOCKDASH', color: '#00ffe1', msg: 'D3 historical price chart & Three.js Sentiment Globe updated' },
      { tag: 'GEODASH', color: '#3a86ff', msg: 'REST Countries API telemetry synced across global nodes' },
      { tag: '3D TASKS', color: '#7000ff', msg: 'Three.js particle background & D3 progress ring updated' },
      { tag: 'AEROCAST', color: '#00b4d8', msg: 'Cascading geo weather telemetry updated' },
      { tag: 'COMPOSITOR', color: '#06d6a0', msg: 'HTML5 Canvas image stamp processing rendered' },
      { tag: '3D TIC TAC TOE', color: '#ff0055', msg: 'Raycasted GSAP 3.12 3D mesh move calculated' },
      { tag: 'PORTFOLIO', color: '#ff007f', msg: 'Typewriter effect & skill badges initialized' }
    ];

    let index = 0;
    setInterval(() => {
      const item = sampleLogs[index % sampleLogs.length];
      index++;

      const logLine = document.createElement('div');
      logLine.className = 'telemetry-log-line';
      const timeStr = new Date().toLocaleTimeString();

      logLine.innerHTML = `
        <span class="log-time">[${timeStr}]</span>
        <span class="log-tag" style="background:${item.color}22; color:${item.color}; border:1px solid ${item.color}66;">${item.tag}</span>
        <span class="log-msg">${item.msg}</span>
      `;

      feedContainer.appendChild(logLine);
      if (feedContainer.children.length > 7) {
        feedContainer.removeChild(feedContainer.children[0]);
      }
      feedContainer.scrollTop = feedContainer.scrollHeight;
    }, 2400);
  }
}

window.D3AnalyticsEngine = D3AnalyticsEngine;
