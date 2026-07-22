// d3-charts.js

function renderD3Chart(data, containerId) {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove(); // Clear previous chart

    // Get container dimensions
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;
    
    if (width === 0 || height === 0) return; // Guard for hidden elements
    
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates if they are strings
    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
        if (typeof d.date === 'string') {
            d.date = parseDate(d.date);
        }
    });

    // Scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.price) * 0.95, d3.max(data, d => d.price) * 1.05])
        .range([innerHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(x).ticks(5);
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`);

    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr("color", "#6c757d"); // Bootstrap secondary color

    svg.append("g")
        .call(yAxis)
        .attr("color", "#6c757d");

    // Gridlines
    const yGridlines = d3.axisLeft(y).tickSize(-innerWidth).tickFormat('').ticks(5);
    svg.append("g")
        .attr("class", "grid")
        .call(yGridlines)
        .attr("color", "rgba(255,255,255,0.05)")
        .select(".domain").remove();

    // Line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.price))
        .curve(d3.curveMonotoneX);

    // Gradient for the area under the line
    const area = d3.area()
        .x(d => x(d.date))
        .y0(innerHeight)
        .y1(d => y(d.price))
        .curve(d3.curveMonotoneX);

    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "area-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(d3.max(data, d => d.price)))
        .attr("x2", 0).attr("y2", innerHeight);

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(13, 202, 240, 0.4)"); // Bootstrap info
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(13, 202, 240, 0)");

    // Draw Area
    svg.append("path")
        .datum(data)
        .attr("fill", "url(#area-gradient)")
        .attr("d", area);

    // Draw Line
    const path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#0dcaf0")
        .attr("stroke-width", 2)
        .attr("d", line);
        
    // Line animation
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Tooltip
    let tooltip = d3.select("body").select(".d3-tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");
    }

    // Hover effects
    const focus = svg.append("g")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 5)
        .attr("fill", "#0dcaf0")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "rgba(255,255,255,0.2)")
        .attr("stroke-dasharray", "3,3");

    svg.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => { focus.style("display", null); tooltip.style("opacity", 1); })
        .on("mouseout", () => { focus.style("display", "none"); tooltip.style("opacity", 0); })
        .on("mousemove", mousemove);

    const bisectDate = d3.bisector(d => d.date).left;

    function mousemove(event) {
        const x0 = x.invert(d3.pointer(event)[0]);
        const i = bisectDate(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        let d = d0;
        if(d1 && d0) {
           d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        } else if (d1) {
           d = d1;
        }
        
        focus.attr("transform", `translate(${x(d.date)},${y(d.price)})`);
        focus.select(".x-hover-line").attr("y2", innerHeight - y(d.price));

        tooltip
            .html(`<div class="date">${d3.timeFormat("%b %d, %Y")(d.date)}</div><div class="price">$${d.price.toFixed(2)}</div>`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
    }
}

// Handle window resize to redraw chart
$(window).resize(function() {
    if(window.currentChartData) {
        renderD3Chart(window.currentChartData, 'd3-chart-container');
    }
});
