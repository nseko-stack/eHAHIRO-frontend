import { useState, useEffect } from 'react';
import { getCoordinates, getWeatherData, getWeatherImpact, getFallbackWeather } from '../services/weather';
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, MapPin } from 'lucide-react';

export default function WeatherWidget({ marketLocation = 'Kigali' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState('Kigali');

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      setLoading(true);
      const name = typeof marketLocation === 'string'
        ? marketLocation
        : marketLocation?.city || marketLocation?.name || marketLocation?.location || 'Kigali';
      
      setCityName(name);

      try {
        const coords = await getCoordinates(name);
        let data = null;
        if (coords?.lat && coords?.lon) {
          data = await getWeatherData(coords.lat, coords.lon);
        }
        if (!data) {
          data = getFallbackWeather(name);
        }
        if (isMounted) {
          setWeather(data);
        }
      } catch (err) {
        console.warn('Weather fetch warning:', err);
        if (isMounted) {
          setWeather(getFallbackWeather(name));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [marketLocation]);

  const getWeatherIcon = (condition) => {
    const main = condition?.toLowerCase() || '';
    if (main.includes('rain') || main.includes('drizzle')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (main.includes('cloud')) return <Cloud className="w-8 h-8 text-slate-500" />;
    if (main.includes('clear')) return <Sun className="w-8 h-8 text-amber-500" />;
    return <Cloud className="w-8 h-8 text-emerald-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-green-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-green-100 rounded-xl w-36"></div>
          <div className="h-6 bg-green-100 rounded-xl w-16"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-green-50 rounded-2xl"></div>
          <div className="h-12 bg-green-50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!weather || !weather.main) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-green-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cloud className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-800">Weather Info</h3>
            <p className="text-xs text-gray-500">{cityName}, Rwanda</p>
          </div>
        </div>
        <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
          Standard Conditions
        </span>
      </div>
    );
  }

  const impact = getWeatherImpact(weather);
  const condition = weather.weather?.[0]?.main || 'Clear';
  const description = weather.weather?.[0]?.description || 'clear sky';
  const temp = Math.round(weather.main?.temp ?? 24);
  const humidity = weather.main?.humidity ?? 65;
  const windSpeed = Math.round((weather.wind?.speed ?? 3.5) * 3.6);

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl">
            {getWeatherIcon(condition)}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <MapPin size={14} className="text-emerald-600" />
              <h3 className="font-bold text-gray-900">{cityName}, Rwanda</h3>
            </div>
            <p className="text-xs text-gray-500 capitalize">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-1">
            <Thermometer className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-2xl text-gray-900">{temp}°C</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
            Optimal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-3 p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs font-medium text-gray-500">Humidity</p>
            <p className="font-bold text-gray-900">{humidity}%</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
          <Wind className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs font-medium text-gray-500">Wind Speed</p>
            <p className="font-bold text-gray-900">{windSpeed} km/h</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-200/80">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          Market Supply Impact
        </p>
        <p className="text-sm text-emerald-900 font-medium leading-relaxed">
          {impact}
        </p>
      </div>
    </div>
  );
}