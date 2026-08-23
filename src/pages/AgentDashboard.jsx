import { useState, useEffect } from 'react';
import { api } from '../services/api';
import BulkUpload from '../components/BulkUpload';
import { CheckCircle, AlertCircle, Edit2, Trash2, Plus, Loader2, List } from 'lucide-react';

export default function AgentDashboard() {
  const [formData, setFormData] = useState({
    crop_id: '',
    market_id: '',
    price: ''
  });
  const [markets, setMarkets] = useState([]);
  const [crops, setCrops] = useState([]);
  const [myPrices, setMyPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Fetch markets and crops
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: marketsData }, { data: cropsData }] = await Promise.all([
          api.get('/markets'),
          api.get('/crops')
        ]);
        setMarkets(Array.isArray(marketsData) ? marketsData : []);
        setCrops(Array.isArray(cropsData) ? cropsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch agent's own prices
  const fetchMyPrices = async () => {
    try {
      const { data } = await api.get('/prices/my-prices');
      setMyPrices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching my prices:', error);
      setMyPrices([]);
    }
  };

  useEffect(() => {
    fetchMyPrices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/prices', formData);
      setMessage('✅ Price added successfully! SMS alerts sent to farmers.');
      setFormData({ crop_id: '', market_id: '', price: '' });
      fetchMyPrices(); // Refresh list
    } catch (error) {
      setMessage('❌ Error adding price: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = async (priceId) => {
    if (!editPrice) return;
    try {
      await api.put(`/prices/${priceId}`, { price: editPrice });
      setMessage('✅ Price updated successfully!');
      setEditingId(null);
      setEditPrice('');
      fetchMyPrices();
    } catch (error) {
      setMessage('❌ Error updating price: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeletePrice = async (priceId) => {
    if (!window.confirm('Are you sure you want to delete this price?')) return;
    try {
      await api.delete(`/prices/${priceId}`);
      setMessage('✅ Price deleted successfully!');
      fetchMyPrices();
    } catch (error) {
      setMessage('❌ Error deleting price: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Price Form */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-emerald-200">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Plus size={32} className="text-emerald-600" />
          <h2 className="text-3xl font-bold text-gray-900">Add New Price Update</h2>
        </div>
        
        {message && (
          <div className={`p-4 rounded-2xl mb-6 flex items-center space-x-3 ${
            message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.includes('✅') ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Crop</label>
            <select
              value={formData.crop_id}
              onChange={(e) => setFormData({...formData, crop_id: e.target.value})}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all shadow-sm"
              required
            >
              <option value="">Select Crop</option>
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>{crop.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Market</label>
            <select
              value={formData.market_id}
              onChange={(e) => setFormData({...formData, market_id: e.target.value})}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all shadow-sm"
              required
            >
              <option value="">Select Market</option>
              {markets.map(market => (
                <option key={market.id} value={market.id}>{market.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Price (RWF/kg)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-2xl font-bold text-right shadow-sm"
              placeholder="350"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="md:col-span-3 text-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 text-xl font-bold shadow-2xl hover:shadow-3xl bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              <span>{loading ? 'Adding...' : 'Add Price & Send Alerts'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-200">
        <BulkUpload onSuccess={fetchMyPrices} />
      </div>

      {/* My Recent Prices */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-emerald-200">
        <div className="flex items-center gap-3 mb-6">
          <List size={28} />
          <h3 className="text-2xl font-bold text-gray-900">Your Recent Updates</h3>
        </div>
        {myPrices.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No prices added yet. Add your first price above!</p>
        ) : (
          <div className="space-y-4">
            {myPrices.map((price) => (
              <div key={price.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-l-4 border-emerald-400">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-emerald-700 text-lg">{(price.crop_name || 'CRP').slice(0,3).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{price.crop_name} @ {price.market_name}</p>
                    {editingId === price.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="p-2 border rounded w-24"
                          step="0.01"
                          min="0"
                        />
                        <button onClick={() => handleEditPrice(price.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Save</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-emerald-700">RWF {price.price}/kg</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(price.id);
                      setEditPrice(price.price);
                    }}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeletePrice(price.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

