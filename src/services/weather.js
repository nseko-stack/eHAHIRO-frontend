import axios from 'axios';

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '65fcf1cf366462428c0a4a482686058b';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Pre-defined coordinates for major Rwandan markets/districts as instant fallback
export const RWANDA_COORDINATES = {
  kigali: { lat: -1.9441, lon: 30.0619, name: 'Kigali' },
  gasabo: { lat: -1.9000, lon: 30.1333, name: 'Gasabo' },
  kicukiro: { lat: -1.9833, lon: 30.1000, name: 'Kicukiro' },
  nyarugenge: { lat: -1.9500, lon: 30.0500, name: 'Nyarugenge' },
  muhanga: { lat: -2.0833, lon: 29.7500, name: 'Muhanga' },
  huye: { lat: -2.6000, lon: 29.7333, name: 'Huye' },
  musanze: { lat: -1.5000, lon: 29.6333, name: 'Musanze' },
  rubavu: { lat: -1.6833, lon: 29.2667, name: 'Rubavu' },
  nyagatare: { lat: -1.2967, lon: 30.3247, name: 'Nyagatare' },
  rwamagana: { lat: -1.9487, lon: 30.4347, name: 'Rwamagana' },
  kayonza: { lat: -1.9333, lon: 30.5167, name: 'Kayonza' },
  rusizi: { lat: -2.4833, lon: 28.9000, name: 'Rusizi' },
};

// Generate realistic simulated weather for Rwanda based on location
export const getFallbackWeather = (cityName = 'Kigali') => {
  return {
    name: cityName,
    main: {
      temp: 23.5,
      feels_like: 24.0,
      temp_min: 18.0,
      temp_max: 27.0,
      humidity: 65,
      pressure: 1015
    },
    weather: [
      {
        id: 801,
        main: 'Clouds',
        description: 'scattered clouds',
        icon: '03d'
      }
    ],
    wind: {
      speed: 3.2,
      deg: 120
    }
  };
};

// Get weather data for a location
export const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 6000
    });
    return response.data;
  } catch (error) {
    console.warn('Error fetching OpenWeather data, using fallback data:', error.message);
    return null;
  }
};

// Get 5-day weather forecast
export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 6000
    });
    return response.data;
  } catch (error) {
    console.warn('Error fetching weather forecast:', error.message);
    return null;
  }
};

// Get coordinates for a city (Rwanda locations)
export const getCoordinates = async (city) => {
  if (!city) return RWANDA_COORDINATES.kigali;

  const normalized = city.toLowerCase().trim();
  for (const [key, coords] of Object.entries(RWANDA_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: `${city},RW`,
        limit: 1,
        appid: WEATHER_API_KEY
      },
      timeout: 5000
    });
    if (response.data && response.data.length > 0) {
      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon
      };
    }
  } catch (error) {
    console.warn('Error fetching coordinates from API, defaulting to Kigali:', error.message);
  }

  return RWANDA_COORDINATES.kigali;
};

// Get weather impact on crop prices
export const getWeatherImpact = (weatherData) => {
  if (!weatherData || !weatherData.main || !weatherData.weather?.[0]) {
    return 'Weather conditions are moderate with steady market supply.';
  }

  const temp = weatherData.main.temp;
  const condition = weatherData.weather[0].main.toLowerCase();

  if (temp < 16) {
    return 'Cooler weather may slow crop growth and increase perishable prices.';
  } else if (temp > 29) {
    return 'Warm conditions require prompt transport to maintain produce freshness.';
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    return 'Seasonal rainfall supports high yields and stable harvest prices.';
  } else if (condition.includes('clear')) {
    return 'Favorable sunny conditions ensure steady market logistics and trading.';
  } else if (condition.includes('cloud')) {
    return 'Moderate cloud cover supports stable market conditions and pricing.';
  }

  return 'Current weather indicates steady market supply and trade across regions.';

      };