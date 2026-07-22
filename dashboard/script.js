// Global Configuration
// Using local data from data.js
let globalData = [];

// DOM Elements
const kpiCountries = document.getElementById('kpi-countries');
const kpiPopulation = document.getElementById('kpi-population');
const kpiArea = document.getElementById('kpi-area');
const loaders = document.querySelectorAll('.loader');

// Tooltip Setup
const tooltip = d3.select("body").append("div")
    .attr("class", "d3-tooltip");

// Color Palette for visualizations
const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
const colorScale = d3.scaleOrdinal(colors);

// Data Formatters
const formatNumber = d3.format(".2s"); // formats like 1.2M, 3G
const formatComma = d3.format(",");

// Initialize Dashboard
async function initDashboard() {
    showLoaders(true);
    try {
        // Use rawCountryData from data.js instead of fetching
        const rawData = rawCountryData;
        
        // Process and clean data
        globalData = rawData
            .filter(d => d.population > 0 && d.area > 0 && d.name.common)
            .map(d => ({
                name: d.name.common,
                population: d.population,
                area: d.area,
                density: d.population / d.area,
                region: d.region || 'Unknown',
                subregion: d.subregion || 'Unknown'
            }));

        updateKPIs();
        
        // Slight delays for stagger effect on initial load
        setTimeout(() => drawBarChart(), 100);
        setTimeout(() => drawDonutChart(), 300);
        setTimeout(() => drawScatterChart(), 500);

        // Handle window resize for responsive charts
        window.addEventListener('resize', debounce(() => {
            drawBarChart();
            drawDonutChart();
            drawScatterChart();
        }, 300));

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load real data from the API. Please check your connection.");
    } finally {
        showLoaders(false);
    }
}

function showLoaders(show) {
    loaders.forEach(loader => loader.classList.toggle('active', show));
}

// Animate counting up for KPI values
function animateValue(obj, start, end, duration, isFormatNumber = false) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (end - start) + start);
        
        if (isFormatNumber) {
            obj.innerHTML = formatNumber(currentVal).replace('G', 'B');
        } else {
            obj.innerHTML = formatComma(currentVal);
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateKPIs() {
    const totalCountries = globalData.length;
    const totalPopulation = d3.sum(globalData, d => d.population);
    const totalArea = d3.sum(globalData, d => d.area);

    animateValue(kpiCountries, 0, totalCountries, 1500, false);
    
    // For very large numbers, just format directly as animating billions can be tricky with short format
    kpiPopulation.textContent = formatNumber(totalPopulation).replace('G', 'B'); 
    kpiArea.textContent = formatNumber(totalArea) + " km²";
}

// 1. Bar Chart: Top 10 Most Populated Countries
function drawBarChart() {
    const containerId = "#bar-chart";
    const container = d3.select(containerId);
    container.selectAll("*").remove();

    const node = container.node();
    if (!node) return;
    
    const margin = { top: 20, right: 30, bottom: 80, left: 70 };
    const width = node.getBoundingClientRect().width - margin.left - margin.right;
    const height = node.getBoundingClientRect().height - margin.top - margin.bottom;

    // Get Top 10
    const top10 = [...globalData].sort((a, b) => b.population - a.population).slice(0, 10);

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(top10.map(d => d.name))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top10, d => d.population) * 1.1]) // Add 10% headroom
        .nice()
        .range([height, 0]);

    // Add Gridlines
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    // X Axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(-10,5)rotate(-45)")
        .style("text-anchor", "end");

    // Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).tickFormat(d => formatNumber(d).replace('G', 'B')))
        .selectAll("text")
        .attr("class", "axis-label");

    // Gradient Def
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", colors[0]); // Light Blue
    gradient.append("stop").attr("offset", "100%").attr("stop-color", colors[1]); // Purple

    // Bars
    svg.selectAll(".bar")
        .data(top10)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.name))
        .attr("width", x.bandwidth())
        .attr("y", height) // Start at bottom for animation
        .attr("height", 0)
        .attr("fill", "url(#bar-gradient)")
        .attr("rx", 6) // Rounded corners
        .attr("ry", 6)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("opacity", 0.8)
                .attr("filter", "drop-shadow(0px 0px 8px rgba(59, 130, 246, 0.6))");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.name}</strong>Population: ${formatComma(d.population)}<br/>Region: ${d.region}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("opacity", 1)
                .attr("filter", null);
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d.population))
        .attr("height", d => height - y(d.population));
}

// 2. Donut Chart: Population by Region
function drawDonutChart() {
    const containerId = "#donut-chart";
    const container = d3.select(containerId);
    container.selectAll("*").remove();

    const node = container.node();
    if (!node) return;

    const width = node.getBoundingClientRect().width;
    const height = node.getBoundingClientRect().height;
    const margin = 30;
    const radius = Math.min(width, height) / 2 - margin;

    // Aggregate Data
    const regionData = d3.rollups(globalData, v => d3.sum(v, d => d.population), d => d.region)
        .map(([region, population]) => ({ region, population }))
        .sort((a, b) => b.population - a.population);

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
        .value(d => d.population)
        .sort(null)
        .padAngle(0.03); // Add space between slices

    const arc = d3.arc()
        .innerRadius(radius * 0.55) // Makes it a donut
        .outerRadius(radius)
        .cornerRadius(8); // Rounded slice edges

    const arcHover = d3.arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius + 10)
        .cornerRadius(8);

    const arcs = svg.selectAll("arc")
        .data(pie(regionData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.region))
        .attr("stroke", "transparent")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition().duration(200)
                .attr("d", arcHover)
                .style("filter", "drop-shadow(0px 0px 8px rgba(255,255,255,0.3))");
            
            const percentage = ((d.data.population / d3.sum(regionData, r => r.population)) * 100).toFixed(1);
            
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.data.region}</strong>Population: ${formatComma(d.data.population)}<br/>Share: ${percentage}%`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(200)
                .attr("d", arc)
                .style("filter", null);
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .transition()
        .duration(1200)
        .ease(d3.easeCircleOut)
        .attrTween("d", function(d) {
            const i = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) { return arc(i(t)); };
        });

    // Central Text
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.2em")
        .style("fill", "var(--text-secondary)")
        .style("font-size", "0.9rem")
        .text("Regions");
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.2em")
        .style("fill", "var(--text-primary)")
        .style("font-size", "1.5rem")
        .style("font-weight", "600")
        .text(regionData.length);
}

// 3. Scatter Plot: Area vs Population Density
function drawScatterChart() {
    const containerId = "#scatter-chart";
    const container = d3.select(containerId);
    container.selectAll("*").remove();

    const node = container.node();
    if (!node) return;

    const margin = { top: 20, right: 40, bottom: 50, left: 70 };
    const width = node.getBoundingClientRect().width - margin.left - margin.right;
    const height = node.getBoundingClientRect().height - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Use log scale for better distribution of geographical data
    const x = d3.scaleLog()
        .domain([10, d3.max(globalData, d => d.area)])
        .range([0, width])
        .nice();

    const y = d3.scaleLog()
        .domain([0.1, d3.max(globalData, d => d.density)])
        .range([height, 0])
        .nice();

    // Add Gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));
        
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    // X Axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5, formatNumber))
        .selectAll("text").attr("class", "axis-label");
        
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Total Area (km²) [Log Scale]");

    // Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5, formatNumber))
        .selectAll("text").attr("class", "axis-label");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Density (Pop/km²) [Log Scale]");

    // Dots
    svg.append('g')
        .selectAll("dot")
        .data(globalData)
        .enter()
        .append("circle")
        .attr("cx", d => x(Math.max(d.area, 10)))
        .attr("cy", d => y(Math.max(d.density, 0.1)))
        .attr("r", 0)
        .style("fill", d => colorScale(d.region))
        .style("opacity", 0.7)
        .style("stroke", "var(--bg-color)")
        .style("stroke-width", "1px")
        .style("cursor", "crosshair")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1)
                .style("stroke-width", "2px")
                .style("stroke", "#fff")
                .attr("r", 8);
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.name}</strong>Region: ${d.region}<br/>Density: ${d.density.toFixed(1)} /km²<br/>Area: ${formatComma(d.area)} km²`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.7)
                .style("stroke-width", "1px")
                .style("stroke", "var(--bg-color)")
                .attr("r", 5);
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .ease(d3.easeElastic)
        .delay((d, i) => i * 4)
        .attr("r", 5);
}

// Utility: Debounce for window resize
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Routing Logic
function setupRouting() {
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    function navigateTo(hash) {
        if (!hash || hash === '#') hash = '#overview';
        
        // Update Nav Links
        navItems.forEach(item => {
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
                if (pageTitle) pageTitle.textContent = item.getAttribute('data-title');
                if (pageSubtitle) pageSubtitle.textContent = item.getAttribute('data-subtitle');
            } else {
                item.classList.remove('active');
            }
        });

        // Show/Hide Sections
        viewSections.forEach(section => {
            if ('#' + section.id.replace('view-', '') === hash) {
                section.style.display = 'block';
                // Dispatch resize event to fix D3 chart dimensions when they become visible
                window.dispatchEvent(new Event('resize'));
            } else {
                section.style.display = 'none';
            }
        });
    }

    // Handle clicks on nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = item.getAttribute('href');
            window.history.pushState(null, '', hash);
            navigateTo(hash);
        });
    });

    // Handle back/forward buttons
    window.addEventListener('popstate', () => {
        navigateTo(window.location.hash);
    });

    // Initial load route
    navigateTo(window.location.hash);
}

// Start app
document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
    setupRouting();
});
