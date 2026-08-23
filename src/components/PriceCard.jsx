import { MapPin, User, Calendar, TrendingUp } from 'lucide-react';

export default function PriceCard({ price }) {
  if (!price) return null;

  const numPrice = typeof price.price === 'number' ? price.price : parseFloat(price.price) || 0;
  const isHigh = numPrice > 400;

  const formattedDate = price.date
    ? new Date(price.date).toLocaleDateString('en-RW', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Today';

  return (
    <div className="group bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-lg hover:shadow-2xl border border-green-100 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-extrabold text-gray-900 pr-2 flex-1 truncate" title={price.crop_name}>
          {price.crop_name || 'Crop'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
          isHigh ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }`}>
          <TrendingUp size={12} className="mr-0.5" />
          <span>{isHigh ? 'High Yield' : 'Standard'}</span>
        </span>
      </div>
      
      <div className="space-y-2 mb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-emerald-700">
            RWF {numPrice.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-gray-500">/kg</span>
        </div>
        <div className="flex items-center text-gray-700 font-medium text-sm">
          <MapPin size={15} className="mr-1 text-emerald-600 flex-shrink-0" />
          <span className="truncate">{price.market_name || 'Market'}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
        <span className="flex items-center">
          <Calendar size={13} className="mr-1 text-gray-400" />
          {formattedDate}
        </span>
        {price.agent_name && (
          <span className="flex items-center font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
            <User size={12} className="mr-1" />
            {price.agent_name}
          </span>
        )}
      </div>
    </div>
  );
}