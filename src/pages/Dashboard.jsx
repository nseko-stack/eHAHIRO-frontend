import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { onPriceUpdate, onPriceAlert, offPriceUpdate, offPriceAlert } from '../services/socket';
import { requestNotificationPermission, showPriceAlert } from '../services/notifications';
import PriceCard from '../components/PriceCard';
import WeatherWidget from '../components/WeatherWidget';
import { RefreshCw, TrendingUp } from 'lucide-react';

export default function Dashboard() {
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

    // Set up real-time listeners
    const handlePriceUpdate = (data) => {
      console.log('Real-time price update:', data);
      fetchPrices();
    };

    const handlePriceAlert = (data) => {
      console.log('Price alert received:', data);
      fetchPrices();
      if (data && data.crop_name) {
        showPriceAlert(data.crop_name, data.market_name || 'Market', data.price);
      }
    };

    onPriceUpdate(handlePriceUpdate);
    onPriceAlert(handlePriceAlert);

    // Cleanup listeners on unmount
    return () => {
      offPriceUpdate(handlePriceUpdate);
      offPriceAlert(handlePriceAlert);
    };
  }, []);

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-3">
          Today's Crop Prices
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real-time market prices across Rwanda, verified by on-the-ground market agents.
        </p>
      </div>

      {/* Weather Overview Widget */}
      <div>
        <WeatherWidget marketLocation="Kigali" />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Live Market Rates</h2>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="flex w-full items-center justify-center space-x-2 px-5 py-2.5 bg-white rounded-2xl shadow-md border border-emerald-100 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 disabled:opacity-50 text-sm font-semibold text-emerald-800 sm:w-auto"
        >
          <RefreshCw size={16} className={`transition-transform ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Prices</span>
        </button>
      </div>

      {/* Prices Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/80 p-6 rounded-3xl shadow-sm border border-emerald-50">
              <div className="h-6 bg-emerald-100 rounded-xl mb-4"></div>
              <div className="h-10 bg-emerald-50 rounded-xl mb-4"></div>
              <div className="h-4 bg-emerald-50 rounded-lg w-3/4"></div>
            </div>
          ))}
        </div>
      ) : prices.length === 0 ? (
        <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-emerald-100">
          <TrendingUp className="mx-auto h-20 w-20 text-emerald-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No prices recorded yet today</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Market agents will submit morning prices shortly. Check back soon or view price trends.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prices.map((price) => (
            <PriceCard key={price.id} price={price} />
          ))}
        </div>
      )}
    </div>
  );
}
