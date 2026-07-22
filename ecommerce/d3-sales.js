/**
 * Apex Luxe 3D E-Commerce - D3.js Sales Telemetry & Inventory Analytics
 */

class D3SalesAnalytics {
  constructor() {
    this.salesData = [
      { category: 'Audio Tech', revenue: 145, color: '#00ffe1' },
      { category: '3D Wearables', revenue: 210, color: '#9d4edd' },
      { category: 'Cyberware', revenue: 380, color: '#ff0055' },
      { category: 'Quantum Devices', revenue: 290, color: '#ffb703' }
    ];

    this.inventoryData = [
      { category: 'Audio Tech', count: 42, color: '#00ffe1' },
      { category: '3D Wearables', count: 28, color: '#9d4edd' },
      { category: 'Cyberware', count: 65, color: '#ff0055' },
      { category: 'Quantum Devices', count: 19, color: '#ffb703' }
    ];

    this.initBarChart();
    this.initDonutChart();
  }

  /* 1. Render Category Revenue Bar Chart */
  initBarChart() {
    const container = d3.select('#d3-bar-chart');
    if (container.empty()) return;
    container.html(''); // Clear previous

    const width = 340;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const svg = container.append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleBand()
      .domain(this.salesData.map(d => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.salesData, d => d.revenue) * 1.15])
      .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll('.bar')
      .data(this.salesData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.category))
      .attr('width', x.bandwidth())
      .attr('y', height - margin.bottom)
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('rx', 6)
      .transition()
      .duration(1000)
      .attr('y', d => y(d.revenue))
      .attr('height', d => height - margin.bottom - y(d.revenue));

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
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `$${d}K`))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    svg.selectAll('.domain, .tick line').attr('stroke', '#334155');
  }

  /* 2. Render Inventory Donut Chart */
  initDonutChart() {
    const container = d3.select('#d3-donut-chart');
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
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.55)
      .outerRadius(radius);

    const slices = svg.selectAll('path')
      .data(pie(this.inventoryData))
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
    const totalUnits = d3.sum(this.inventoryData, d => d.count);
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', '#f0f4f8')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(totalUnits);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text('Units in Stock');
  }
}

// Global Export
window.d3SalesAnalytics = null;
document.addEventListener('DOMContentLoaded', () => {
  window.d3SalesAnalytics = new D3SalesAnalytics();
});
