const container = document.querySelector('.weather-app');
const searchButton = document.querySelector('#search-btn');
const countrySelect = document.querySelector('#country-select');
const citySelect = document.querySelector('#city-select');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.error-message');

let countriesData = [];

// Fetch countries data on load
async function initCountries() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await response.json();
        countriesData = data.data;

        // Populate country select
        countrySelect.innerHTML = '<option value="" disabled selected>Select Country...</option>';
        countriesData.forEach(countryObj => {
            const option = document.createElement('option');
            option.value = countryObj.country;
            option.textContent = countryObj.country;
            countrySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching countries:", error);
        countrySelect.innerHTML = '<option value="" disabled selected>Error loading countries</option>';
    }
}

initCountries();

countrySelect.addEventListener('change', () => {
    const selectedCountryName = countrySelect.value;
    const countryObj = countriesData.find(c => c.country === selectedCountryName);
    
    citySelect.innerHTML = '<option value="" disabled selected>Select City...</option>';
    
    if (countryObj && countryObj.cities.length > 0) {
        countryObj.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    } else {
        citySelect.innerHTML = '<option value="" disabled selected>No cities available</option>';
        citySelect.disabled = true;
    }
});

searchButton.addEventListener('click', () => {
    const city = citySelect.value;
    if (!city) return;
    
    fetchWeather(city);
});

async function fetchWeather(city) {
    try {
        // Step 1: Get coordinates for the city using Open-Meteo Geocoding API
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        if (!geocodeData.results || geocodeData.results.length === 0) {
            showError();
            return;
        }

        const { latitude, longitude, name } = geocodeData.results[0];

        // Step 2: Get weather for coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        updateUI(weatherData.current, name);

    } catch (error) {
        console.error("Error fetching weather:", error);
        showError();
    }
}

function updateUI(currentWeather, cityName) {
    error404.style.display = 'none';
    weatherBox.style.display = 'block';
    weatherDetails.style.display = 'flex';

    const image = document.querySelector('#weather-icon');
    const temperature = document.querySelector('#temp');
    const description = document.querySelector('#desc');
    const humidity = document.querySelector('#humidity span');
    const wind = document.querySelector('#wind span');

    // WMO Weather interpretation codes
    const wmoCodes = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };

    const code = currentWeather.weather_code;
    const isDay = currentWeather.is_day;
    description.innerHTML = wmoCodes[code] || 'Unknown';

    // Set weather icon based on code
    let iconUrl = '';
    
    // Using high quality weather icons from openweathermap for reliability
    if (code === 0) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/01d@4x.png' : 'https://openweathermap.org/img/wn/01n@4x.png';
    } else if (code === 1) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/02d@4x.png' : 'https://openweathermap.org/img/wn/02n@4x.png';
    } else if (code === 2) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/03d@4x.png' : 'https://openweathermap.org/img/wn/03n@4x.png';
    } else if (code === 3) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/04d@4x.png' : 'https://openweathermap.org/img/wn/04n@4x.png';
    } else if (code === 45 || code === 48) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/50d@4x.png' : 'https://openweathermap.org/img/wn/50n@4x.png';
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/10d@4x.png' : 'https://openweathermap.org/img/wn/10n@4x.png';
    } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/13d@4x.png' : 'https://openweathermap.org/img/wn/13n@4x.png';
    } else if (code >= 95) {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/11d@4x.png' : 'https://openweathermap.org/img/wn/11n@4x.png';
    } else {
        iconUrl = isDay ? 'https://openweathermap.org/img/wn/01d@4x.png' : 'https://openweathermap.org/img/wn/01n@4x.png';
    }

    image.src = iconUrl;
    
    // Animate numbers
    animateValue(temperature, 0, Math.round(currentWeather.temperature_2m), 1000);
    animateValue(humidity, 0, currentWeather.relative_humidity_2m, 1000, '%');
    animateValue(wind, 0, Math.round(currentWeather.wind_speed_10m), 1000, ' km/h');
}

function showError() {
    weatherBox.style.display = 'none';
    weatherDetails.style.display = 'none';
    error404.style.display = 'block';
}

function animateValue(obj, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = progress * (2 - progress);
        
        const current = Math.floor(easeOutQuad * (end - start) + start);
        obj.innerHTML = current + suffix;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end + suffix;
        }
    };
    window.requestAnimationFrame(step);
}
