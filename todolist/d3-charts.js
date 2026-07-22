// D3 Chart Implementation
const d3Container = document.getElementById('d3-chart-container');
let svg, g, pie, arc, color;

// Add Tooltip to body
const tooltip = d3.select("body").append("div")
    .attr("class", "d3-tooltip");

function initChart() {
    const width = 200;
    const height = 200;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    svg = d3.select("#d3-chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Define color scale
    color = d3.scaleOrdinal()
        .domain(["Completed", "Pending", "Empty"])
        .range(["#10b981", "#fbbf24", "rgba(255,255,255,0.1)"]);

    // Compute position of each group on the pie
    pie = d3.pie()
        .value(d => d[1])
        .sort(null);

    // Build the arc for the donut
    arc = d3.arc()
        .innerRadius(radius * 0.5)         // This is the size of the donut hole
        .outerRadius(radius)
        .cornerRadius(8);
}

// Global function called by app.js
function updateChart(tasks) {
    if (!svg) initChart();

    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.length - completedCount;

    // Default data if empty
    let dataObj = { "Completed": completedCount, "Pending": pendingCount };
    if (tasks.length === 0) {
        dataObj = { "Empty": 1 };
    } else if (completedCount === 0 && pendingCount === 0) {
        dataObj = { "Empty": 1 };
    }

    const data = Object.entries(dataObj).filter(d => d[1] > 0);
    const data_ready = pie(data);

    // Map to paths
    const paths = g.selectAll('path')
        .data(data_ready, d => d.data[0]);

    // Remove old
    paths.exit()
        .transition().duration(500)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle, d.startAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            }
        })
        .remove();

    // Add new
    const pathsEnter = paths.enter()
        .append('path')
        .attr('fill', d => color(d.data[0]))
        .attr('stroke', 'var(--glass-bg)')
        .style('stroke-width', '2px')
        .style('opacity', 0)
        .on("mouseover", function(event, d) {
            if (d.data[0] === "Empty") return;
            d3.select(this).style("opacity", 0.8).attr("transform", "scale(1.05)");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`${d.data[0]}: ${d.data[1]}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            if (d.data[0] === "Empty") return;
            d3.select(this).style("opacity", 1).attr("transform", "scale(1)");
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Merge and animate
    pathsEnter.merge(paths)
        .transition().duration(1000)
        .style('opacity', 1)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        });
}
