import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function PriceTrends() {
  const [prices, setPrices] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: cropsData }, { data: marketsData }] = await Promise.all([
          api.get('/crops'),
          api.get('/markets')
        ]);
        setCrops(cropsData);
        setMarkets(marketsData);
        if (cropsData.length > 0) setSelectedCrop(cropsData[0].id);
        if (marketsData.length > 0) setSelectedMarket(marketsData[0].id);
      } catch (error) {
        console.error('Error fetching crops/markets:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!selectedCrop || !selectedMarket) return;
      setLoading(true);
      try {
        const { data } = await api.get('/prices/history', {
          params: {
            cropId: selectedCrop,
            marketId: selectedMarket,
            days
          }
        });
        
        const historyData = Array.isArray(data) ? data : [];
        // Transform data for chart
        const chartData = historyData.map(p => ({
          date: p.date ? new Date(p.date).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' }) : 'N/A',
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
          crop: p.crop_name || '',
          market: p.market_name || ''
        }));
        setPrices(chartData);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setPrices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [selectedCrop, selectedMarket, days]);

  const getCropName = () => crops.find(c => String(c.id) === String(selectedCrop))?.name || 'Crop';
  const getMarketName = () => markets.find(m => String(m.id) === String(selectedMarket))?.name || 'Market';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={32} />
          <h1 className="text-3xl sm:text-4xl font-bold">Price Trends</h1>
        </div>
        <p>Track crop prices over time and identify market trends</p>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
            >
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>{crop.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Market</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
            >
              {markets.map(market => (
                <option key={market.id} value={market.id}>{market.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Days</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-blue-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 break-words">
          {getCropName()} @ {getMarketName()} - Last {days} Days
        </h2>
        
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : prices.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">No price data available for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'line' ? (
              <LineChart data={prices} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={prices.length > 10 ? Math.floor(prices.length / 6) : 0}
                />
                <YAxis width={55} />
                <Tooltip formatter={(value) => `RWF ${Number(value).toLocaleString()}`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 7 }}
                  name="Price (RWF/kg)"
                />
              </LineChart>
            ) : (
              <BarChart data={prices} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={prices.length > 10 ? Math.floor(prices.length / 6) : 0}
                />
                <YAxis width={55} />
                <Tooltip formatter={(value) => `RWF ${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="price" fill="#10b981" radius={[8, 8, 0, 0]} name="Price (RWF/kg)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistics */}
      {prices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox 
            title="Highest Price" 
            value={`RWF ${Math.max(...prices.map(p => Number(p.price) || 0)).toLocaleString()}/kg`}
            color="emerald"
          />
          <StatBox 
            title="Lowest Price" 
            value={`RWF ${Math.min(...prices.map(p => Number(p.price) || 0)).toLocaleString()}/kg`}
            color="red"
          />
          <StatBox 
            title="Average Price" 
            value={`RWF ${Math.round(prices.reduce((a, b) => a + (Number(b.price) || 0), 0) / prices.length).toLocaleString()}/kg`}
            color="blue"
          />
          <StatBox 
            title="Period Change" 
            value={prices.length > 1 && prices[0].price > 0 ? `${(((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100).toFixed(1)}%` : '0.0%'}
            color="purple"
          />
        </div>
      )}
    </div>
  );
}

function StatBox({ title, value, color }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200'
  };
  
  return (
    <div className={`${colors[color]} border-2 rounded-2xl p-6 text-center`}>
      <p className="text-gray-600 text-sm font-semibold">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
