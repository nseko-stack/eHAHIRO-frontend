import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Heart, Plus, Trash2 } from 'lucide-react';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [newCropId, setNewCropId] = useState('');
  const [newMarketId, setNewMarketId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: subsData },
          { data: cropsData },
          { data: marketsData }
        ] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/crops'),
          api.get('/markets')
        ]);
        setSubscriptions(Array.isArray(subsData) ? subsData : subsData?.subscriptions || []);
        setCrops(Array.isArray(cropsData) ? cropsData : []);
        setMarkets(Array.isArray(marketsData) ? marketsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    if (!newCropId || !newMarketId) {
      setMessage('❌ Please select both a crop and a market');
      return;
    }

    try {
      await api.post('/subscriptions', {
        crop_id: newCropId,
        market_id: newMarketId
      });
      setMessage('✅ Subscription added! You will receive instant alerts for this crop/market.');
      setNewCropId('');
      setNewMarketId('');
      
      // Refresh subscriptions
      const { data } = await api.get('/subscriptions');
      setSubscriptions(Array.isArray(data) ? data : data?.subscriptions || []);
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (!window.confirm('Remove this subscription?')) return;

    try {
      await api.delete(`/subscriptions/${subscriptionId}`);
      setMessage('✅ Subscription removed');
      setSubscriptions(subscriptions.filter(s => String(s.id) !== String(subscriptionId)));
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || error.message));
    }
  };

  const getCropName = (cropId) => crops.find(c => String(c.id) === String(cropId))?.name || 'Crop';
  const getMarket = (marketId) => markets.find(m => String(m.id) === String(marketId));
  const getMarketName = (marketId) => getMarket(marketId)?.name || 'Market';
  const getMarketLocation = (marketId, fallbackLoc) => getMarket(marketId)?.location || fallbackLoc || 'Rwanda';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-pink-100/60 rounded-3xl animate-pulse"></div>
        <div className="h-44 bg-white rounded-3xl animate-pulse shadow"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-48 bg-pink-50 rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-pink-50 rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-pink-50 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Heart size={32} />
          <h1 className="text-3xl sm:text-4xl font-bold">My Subscriptions</h1>
        </div>
        <p>Get alerts for specific crop prices at your favorite markets</p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-2xl ${
          message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Add Subscription Form */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-pink-200">
        <div className="flex items-center gap-3 mb-6">
          <Plus size={28} />
          <h2 className="text-2xl font-bold text-gray-900">Add New Subscription</h2>
        </div>
        <form onSubmit={handleAddSubscription} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Crop</label>
            <select
              value={newCropId}
              onChange={(e) => setNewCropId(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500"
            >
              <option value="">Choose a crop...</option>
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>{crop.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Market</label>
            <select
              value={newMarketId}
              onChange={(e) => setNewMarketId(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500"
            >
              <option value="">Choose a market...</option>
              {markets.map(market => (
                <option key={market.id} value={market.id}>{market.name} - {market.location}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <Plus size={20} className="inline mr-2" />
              Subscribe
            </button>
          </div>
        </form>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-pink-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Your Subscriptions ({subscriptions.length})
        </h2>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No subscriptions yet</p>
            <p className="text-gray-400">Add a subscription above to start receiving alerts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map(sub => (
              <div key={sub.id} className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{getCropName(sub.crop_id)}</h3>
                    <p className="text-gray-600 font-semibold">{getMarketName(sub.market_id)}</p>
                    <p className="text-sm text-gray-500 mt-2">📍 {getMarketLocation(sub.market_id, sub.location)}</p>
                  </div>
                  <Heart className="text-pink-600" size={24} fill="currentColor" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You'll receive alerts when prices change for this crop at this market.
                </p>
                <button
                  onClick={() => handleDeleteSubscription(sub.id)}
                  className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
