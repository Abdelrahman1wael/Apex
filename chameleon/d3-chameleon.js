/**
 * Chameleon Pro 3D - D3.js Camouflage Telemetry & Spectral Analytics
 */

class D3ChameleonAnalytics {
  constructor() {
    this.spectralData = [
      { channel: 'Green Camo', match: 94, color: '#06d6a0' },
      { channel: 'Cyan Spectrum', match: 88, color: '#00ffe1' },
      { channel: 'Purple Shift', match: 76, color: '#9d4edd' },
      { channel: 'Luminance', match: 92, color: '#ffb703' }
    ];

    this.environmentData = [
      { env: 'Deep Forest', score: 98, color: '#06d6a0' },
      { env: 'Cyber City', score: 85, color: '#00ffe1' },
      { env: 'Desert Dunes', score: 78, color: '#ffb703' },
      { env: 'Coral Reef', score: 91, color: '#ff0055' }
    ];

    this.initMatchChart();
    this.initVisibilityChart();
  }

  /* 1. Render Spectral Match Bar Chart */
  initMatchChart() {
    const container = d3.select('#d3-match-chart');
    if (container.empty()) return;
    container.html('');

    const width = 340;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const svg = container.append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleBand()
      .domain(this.spectralData.map(d => d.channel))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll('.bar')
      .data(this.spectralData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.channel))
      .attr('width', x.bandwidth())
      .attr('y', height - margin.bottom)
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('rx', 6)
      .transition()
      .duration(1000)
      .attr('y', d => y(d.match))
      .attr('height', d => height - margin.bottom - y(d.match));

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('dy', '10px');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    svg.selectAll('.domain, .tick line').attr('stroke', '#334155');
  }

  /* 2. Render Visibility Donut Chart */
  initVisibilityChart() {
    const container = d3.select('#d3-visibility-chart');
    if (container.empty()) return;
    container.html('');

    const width = 340;
    const height = 220;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = container.append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie()
      .value(d => d.score)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.55)
      .outerRadius(radius);

    svg.selectAll('path')
      .data(pie(this.environmentData))
      .enter()
      .append('path')
      .attr('fill', d => d.data.color)
      .attr('d', arc)
      .style('opacity', 0.85)
      .on('mouseover', function() {
        d3.select(this).style('opacity', 1).attr('transform', 'scale(1.05)');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.85).attr('transform', 'scale(1)');
      });

    // Center Total Text
    const avgScore = Math.round(d3.mean(this.environmentData, d => d.score));
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', '#f1f5f9')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(`${avgScore}%`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text('Camouflage Rating');
  }
}

// Global Export
window.d3ChameleonAnalytics = null;
document.addEventListener('DOMContentLoaded', () => {
  window.d3ChameleonAnalytics = new D3ChameleonAnalytics();
});
