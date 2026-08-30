import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PriceCard from '../components/PriceCard';
import WeatherWidget from '../components/WeatherWidget';
import { RefreshCw, TrendingUp, LogIn, UserPlus, Smartphone, BarChart3, ShieldCheck } from 'lucide-react';

export default function PublicDashboard() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/prices/today');
      setPrices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return (
    <div className="space-y-12">
      {/* HERO SECTION */}
      <div className="text-center bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <img 
            src="/eHAHIRO-logo.png" 
            alt="eHAHIRO AgriPrice" 
            className="h-28 sm:h-32 w-auto mb-4 drop-shadow-lg" 
          />
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Rwanda Agricultural Market Tracker
          </h1>
          <p className="text-base sm:text-xl text-emerald-50 mb-8 max-w-2xl">
            Real-time crop prices, weather insights, and market trends across Rwanda. Stay ahead and make informed trade decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-800 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl text-base"
            >
              <UserPlus size={20} className="mr-2" />
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-800/80 text-white font-bold rounded-2xl hover:bg-emerald-900 transition-all border border-emerald-400/40 shadow-lg text-base"
            >
              <LogIn size={20} className="mr-2" />
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-green-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Real-time Prices</h3>
          <p className="text-gray-600">Live market data updated by agricultural agents across Rwanda</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
<Smartphone size={32} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Smart Alerts</h3>
          <p className="text-gray-600">Get notified when prices change for crops and markets you care about</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
<BarChart3 size={32} className="text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Market Insights</h3>
          <p className="text-gray-600">Track trends, compare markets, and make informed trading decisions</p>
        </div>
      </div>

      {/* TODAY'S PRICES */}
      <div className="mb-8">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Today's Market Prices</h2>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 px-6 py-3 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-green-300 transition-all duration-300 disabled:opacity-50 sm:w-auto"
          >
            <RefreshCw size={20} className={`transition-transform ${loading ? 'animate-spin' : ''}`} />
            <span className="font-semibold">Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-6 rounded-2xl shadow-sm">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : prices.length === 0 ? (
          <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
            <TrendingUp className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-500 mb-2">Prices will be updated soon</h3>
            <p className="text-gray-400">Agricultural agents are collecting today's market data</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prices.map((price) => (
              <PriceCard key={price.id} price={price} />
            ))}
          </div>
        )}
      </div>

      {/* WEATHER WIDGET */}
      <div className="mb-8">
        <WeatherWidget marketLocation="Kigali" />
      </div>

      {/* CALL TO ACTION */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-6 sm:p-12 text-center shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join the AgriPrice Community</h2>
        <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto">
          Whether you're a farmer, trader, agent, or just interested in agricultural markets,
          join thousands using AgriPrice to make better decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex w-full justify-center items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg sm:w-auto"
          >
            <UserPlus size={24} className="mr-2" />
            Register Now
          </Link>
          <Link
            to="/login"
            className="inline-flex w-full justify-center items-center px-8 py-4 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all shadow-lg sm:w-auto"
          >
            <LogIn size={24} className="mr-2" />
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
