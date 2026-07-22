// app.js

$(document).ready(function() {
    // 1. Initialize Three.js Scene
    initThreeScene('three-container');

    // 2. Mock Data Generators
    function generateMockStockData(days, startPrice, volatility) {
        let data = [];
        let currentPrice = startPrice;
        let today = new Date();
        
        for (let i = days; i >= 0; i--) {
            let date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Random walk
            let changePercent = (Math.random() - 0.5) * volatility;
            currentPrice = currentPrice * (1 + changePercent);
            
            data.push({
                date: d3.timeFormat("%Y-%m-%d")(date),
                price: parseFloat(currentPrice.toFixed(2))
            });
        }
        return data;
    }

    function generateMockMarketTable() {
        const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
        let tableHtml = '';
        
        tickers.forEach(ticker => {
            const price = (Math.random() * 500 + 50).toFixed(2);
            const change = (Math.random() * 10 - 5).toFixed(2);
            const changeClass = change >= 0 ? 'text-success-custom' : 'text-danger-custom';
            const changeIcon = change >= 0 ? '▲' : '▼';
            const volume = (Math.random() * 10 + 1).toFixed(1) + 'M';
            
            tableHtml += `
                <tr style="cursor:pointer;" class="ticker-row" data-ticker="${ticker}">
                    <td class="fw-bold text-light">${ticker}</td>
                    <td>$${price}</td>
                    <td class="${changeClass}">${changeIcon} ${Math.abs(change)}%</td>
                    <td>${volume}</td>
                </tr>
            `;
        });
        
        $('#market-table tbody').html(tableHtml);
    }

    function addLiveUpdate(message) {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const html = `
            <li class="list-group-item list-group-item-dark-custom">
                <span class="update-time"><span class="live-indicator"></span>${time}</span>
                ${message}
            </li>
        `;
        $('#live-updates-list').prepend(html);
        
        // Keep only last 5
        if($('#live-updates-list li').length > 5) {
            $('#live-updates-list li:last').remove();
        }
    }

    // 3. Initial Setup
    let currentTicker = 'AAPL';
    window.currentChartData = generateMockStockData(30, 150, 0.05); // Save to window for resize handler
    renderD3Chart(window.currentChartData, 'd3-chart-container');
    generateMockMarketTable();
    addLiveUpdate('System initialized. Market open.');

    // 4. Event Listeners
    
    // Search Button
    $('#search-btn').click(function() {
        const val = $('#ticker-input').val().toUpperCase();
        if(val) {
            loadTicker(val);
            $('#ticker-input').val('');
        }
    });

    // Enter key on search
    $('#ticker-input').keypress(function(e) {
        if(e.which == 13) {
            $('#search-btn').click();
        }
    });

    // Timeframe buttons
    $('.btn-group .btn').click(function() {
        $('.btn-group .btn').removeClass('active');
        $(this).addClass('active');
        
        const range = $(this).data('range');
        let days = 30; // 1M
        if (range === '6M') days = 180;
        if (range === '1Y') days = 365;
        
        const lastPrice = window.currentChartData[window.currentChartData.length-1].price;
        window.currentChartData = generateMockStockData(days, lastPrice, 0.05);
        renderD3Chart(window.currentChartData, 'd3-chart-container');
    });

    // Table row click
    $(document).on('click', '.ticker-row', function() {
        const ticker = $(this).data('ticker');
        loadTicker(ticker);
    });

    // Load new ticker logic
    function loadTicker(ticker) {
        currentTicker = ticker;
        $('#chart-title').text(`Stock Price History: ${ticker}`);
        
        // Generate new random data for the ticker
        const startPrice = Math.random() * 400 + 50;
        window.currentChartData = generateMockStockData(30, startPrice, 0.06);
        
        // Re-render chart
        renderD3Chart(window.currentChartData, 'd3-chart-container');
        
        // Add update
        addLiveUpdate(`Loaded historical data for <strong>${ticker}</strong>.`);
        
        // Determine trend for 3D effect
        const start = window.currentChartData[0].price;
        const end = window.currentChartData[window.currentChartData.length-1].price;
        if (window.triggerMarketEffect) {
            window.triggerMarketEffect(end > start);
        }
    }

    // 5. Simulate Live Data
    setInterval(() => {
        // Randomly update a row in the table
        const rows = $('#market-table tbody tr');
        if(rows.length > 0) {
            const randomRowIndex = Math.floor(Math.random() * rows.length);
            const row = $(rows[randomRowIndex]);
            const ticker = row.data('ticker');
            
            const isBullish = Math.random() > 0.5;
            const changeIcon = isBullish ? '▲' : '▼';
            const changeClass = isBullish ? 'text-success-custom' : 'text-danger-custom';
            
            // Flash the row
            row.css('background-color', 'rgba(255,255,255,0.1)');
            setTimeout(() => {
                row.css('background-color', 'transparent');
            }, 500);

            // 10% chance to add a news update
            if(Math.random() > 0.9) {
                const actions = ['surges on earnings beat', 'drops due to sector weakness', 'announces new product', 'downgraded by analysts', 'upgraded by analysts'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                addLiveUpdate(`<strong>${ticker}</strong> ${action}.`);
                
                // Trigger 3D effect
                if (window.triggerMarketEffect) {
                    window.triggerMarketEffect(isBullish);
                }
            }
        }
    }, 3000);
});
