import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const mockUsers = [
  { id: 1, name: 'John Farmer', phone: '+250788123456', role: 'farmer', location: 'Gasabo', created_at: '2024-01-15' },
  { id: 2, name: 'Agent Sarah', phone: '+250788123457', role: 'agent', location: 'Muhanga', created_at: '2024-01-14' },
  { id: 3, name: 'Admin David', phone: '+250788123458', role: 'admin', location: 'Kigali', created_at: '2024-01-13' },
  { id: 4, name: 'Mary Trader', phone: '+250788123459', role: 'farmer', location: 'Musanze', created_at: '2024-01-12' },
];

const mockStats = {
  totalFarmers: 1247,
  totalAgents: 56,
  totalPricesToday: 89,
  smsSentToday: 2456,
  avgMaizePrice: 342
};

export default function AdminDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [prices, setPrices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCropForm, setShowCropForm] = useState(false);
  const [showMarketForm, setShowMarketForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [cropFormData, setCropFormData] = useState({ name: '', description: '' });
  const [marketFormData, setMarketFormData] = useState({ name: '', location: '' });
  const [userFormData, setUserFormData] = useState({ name: '', phone: '', email: '', role: 'farmer', location: '' });
  const [notificationFilters, setNotificationFilters] = useState({ type: '', userId: '' });
  const [priceSearchTerm, setPriceSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchCrops();
    fetchMarkets();
    fetchPrices();
    fetchNotifications();
    fetchRecentActivity();
  }, []);

  useEffect(() => {
    if (location.pathname === '/crops') setActiveTab('crops');
    else if (location.pathname === '/markets') setActiveTab('markets');
    else if (location.pathname === '/admin') setActiveTab('overview');
  }, [location.pathname]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(Array.isArray(data) ? data : data?.users || mockUsers);
    } catch (error) {
      console.warn('Error fetching users, using mock data:', error.message);
      setUsers(mockUsers);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/users/stats');
      if (data && typeof data === 'object') {
        setStats(data);
      }
    } catch (error) {
      console.warn('Error fetching stats:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      const { data } = await api.get('/crops');
      setCrops(Array.isArray(data) ? data : data?.crops || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const fetchMarkets = async () => {
    try {
      const { data } = await api.get('/markets');
      setMarkets(Array.isArray(data) ? data : data?.markets || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  };

  const fetchPrices = async () => {
    try {
      const { data } = await api.get('/prices');
      setPrices(Array.isArray(data) ? data : data?.prices || []);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/admin/all');
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data } = await api.get('/users/activity');
      setRecentActivity(Array.isArray(data) ? data : data?.activity || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!cropFormData.name) {
      alert('Crop name is required');
      return;
    }
    try {
      await api.post('/crops', cropFormData);
      setCropFormData({ name: '', description: '' });
      setShowCropForm(false);
      fetchCrops();
      alert('🌾 Crop added successfully');
    } catch (error) {
      console.error('Error adding crop:', error);
      alert('Failed to add crop');
    }
  };

  const handleUpdateCrop = async (cropId, cropName) => {
    const newName = prompt('Enter new crop name:', cropName);
    if (!newName) return;
    const newDescription = prompt('Enter description (optional):', '');
    try {
      await api.put(`/crops/${cropId}`, { name: newName, description: newDescription });
      fetchCrops();
      alert('🌾 Crop updated successfully');
    } catch (error) {
      console.error('Error updating crop:', error);
      alert('Failed to update crop');
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    try {
      await api.delete(`/crops/${cropId}`);
      fetchCrops();
      alert('🌾 Crop deleted successfully');
    } catch (error) {
      console.error('Error deleting crop:', error);
      alert('Failed to delete crop');
    }
  };

  const handleAddMarket = async (e) => {
    e.preventDefault();
    if (!marketFormData.name) {
      alert('Market name is required');
      return;
    }
    try {
      await api.post('/markets', marketFormData);
      setMarketFormData({ name: '', location: '' });
      setShowMarketForm(false);
      fetchMarkets();
      alert('🏪 Market added successfully');
    } catch (error) {
      console.error('Error adding market:', error);
      alert('Failed to add market');
    }
  };

  const handleUpdateMarket = async (marketId, marketName) => {
    const newName = prompt('Enter new market name:', marketName);
    if (!newName) return;
    const newLocation = prompt('Enter location (optional):', '');
    try {
      await api.put(`/markets/${marketId}`, { name: newName, location: newLocation });
      fetchMarkets();
      alert('🏪 Market updated successfully');
    } catch (error) {
      console.error('Error updating market:', error);
      alert('Failed to update market');
    }
  };

  const handleDeleteMarket = async (marketId) => {
    if (!confirm('Are you sure you want to delete this market?')) return;
    try {
      await api.delete(`/markets/${marketId}`);
      fetchMarkets();
      alert('🏪 Market deleted successfully');
    } catch (error) {
      console.error('Error deleting market:', error);
      alert('Failed to delete market');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      alert('👤 User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.phone || !userFormData.role) {
      alert('Name, phone and role are required');
      return;
    }
    try {
      const { data } = await api.post('/users', userFormData);
      setUsers([data.user, ...users]);
      setUserFormData({ name: '', phone: '', email: '', role: 'farmer', location: '' });
      setShowUserForm(false);
      alert('👤 User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditUser = async (user) => {
    const newName = prompt('Enter new name:', user.name);
    if (!newName) return;
    const newPhone = prompt('Enter new phone:', user.phone);
    if (!newPhone) return;
    const newEmail = prompt('Enter email (optional):', user.email || '');
    const newRole = prompt('Enter new role (farmer/agent/admin/trader):', user.role);
    if (!newRole) return;
    const newLocation = prompt('Enter new location:', user.location || '');

    try {
      await api.put(`/users/${user.id}`, { name: newName, phone: newPhone, email: newEmail, role: newRole, location: newLocation });
      // Refresh users
      fetchUsers();
      alert('👤 User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleSendBulkSMS = async () => {
    const message = prompt('Enter the message to send to all farmers:');
    if (!message) return;
    try {
      const { data } = await api.post('/notifications/bulk-sms', { message });
      alert(data.message);
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      alert('Failed to send bulk SMS');
    }
  };

  const handleEditPrice = async (price) => {
    const newPrice = prompt('Enter new price:', price.price);
    if (!newPrice || isNaN(newPrice)) return;
    try {
      await api.put(`/prices/${price.id}`, { price: parseFloat(newPrice) });
      fetchPrices();
      alert('💰 Price updated successfully');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  const handleDeletePrice = async (priceId) => {
    if (!confirm('Are you sure you want to delete this price?')) return;
    try {
      await api.delete(`/prices/${priceId}`);
      fetchPrices();
      alert('💰 Price deleted successfully');
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('Failed to delete price');
    }
  };

  const getRoleColor = (role) => {
    if (role === 'farmer') return 'bg-green-100 text-green-700';
    if (role === 'agent') return 'bg-blue-100 text-blue-700';
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p>Manage users, prices & SMS alerts</p>
        </div>
        <button
          onClick={handleSendBulkSMS}
          className="w-full sm:w-auto bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold"
        >
          Send Bulk SMS
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Farmers" value={stats.totalFarmers} />
        <StatCard title="Agents" value={stats.totalAgents} />
        <StatCard title="Prices Today" value={stats.totalPricesToday} />
        <StatCard title="SMS Sent" value={stats.smsSentToday} />
        <StatCard title="Avg Maize Price" value={`${stats.avgMaizePrice} RWF`} />
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {['overview', 'users', 'crops', 'markets', 'prices', 'notifications'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-2 rounded-xl ${
              activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-gray-200'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* USERS SECTION */}
      {activeTab === 'users' && (
        <>
          {/* SEARCH + NEW USER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full md:w-1/2 p-3 border rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="w-full md:w-auto bg-emerald-600 text-white px-4 py-2 rounded-xl"
            >
              {showUserForm ? 'Cancel' : '➕ Add User'}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleAddUser} className="bg-white p-5 rounded-xl shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={userFormData.phone}
                onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={userFormData.email}
                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                className="p-2 border rounded"
              />
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                className="p-2 border rounded"
                required
              >
                <option value="farmer">Farmer</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
                <option value="trader">Trader</option>
              </select>
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  Create User
                </button>
              </div>
            </form>
          )}

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4">{user.email || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{user.location || 'N/A'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* OVERVIEW SECTION */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Welcome Message */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Welcome Admin 👋</h2>
            <p className="mb-4">This dashboard allows you to manage users, crops, markets, monitor prices, and send SMS alerts.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-semibold text-green-700">Quick Actions</p>
                <ul className="mt-2 space-y-1 text-green-600">
                  <li>• Add new crops</li>
                  <li>• Manage users</li>
                  <li>• Send bulk SMS</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-700">Monitor</p>
                <ul className="mt-2 space-y-1 text-blue-600">
                  <li>• Price updates</li>
                  <li>• User activity</li>
                  <li>• System health</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'user_registration' && <span className="text-green-500">👤</span>}
                      {activity.type === 'price_update' && <span className="text-blue-500">💰</span>}
                      {activity.type === 'notification' && <span className="text-orange-500">📱</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      {activity.type === 'user_registration' && (
                        <p className="text-sm">
                          <span className="font-medium">{activity.name}</span> joined as <span className="font-medium">{activity.role}</span>
                        </p>
                      )}
                      {activity.type === 'price_update' && (
                        <p className="text-sm">
                          <span className="font-medium">{activity.agent_name}</span> updated {activity.crop_name} price to RWF {activity.price} at {activity.market_name}
                        </p>
                      )}
                      {activity.type === 'notification' && (
                        <p className="text-sm">
                          SMS sent to <span className="font-medium">{activity.user_name}</span>: {activity.message.substring(0, 50)}...
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CROPS SECTION */}
      {activeTab === 'crops' && (
        <>
          <button
            onClick={() => setShowCropForm(!showCropForm)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl mb-4"
          >
            {showCropForm ? '❌ Cancel' : '➕ Add New Crop'}
          </button>

          {showCropForm && (
            <form onSubmit={handleAddCrop} className="bg-white p-6 rounded-xl shadow mb-6">
              <input
                type="text"
                placeholder="Crop name (e.g., Maize, Beans, Wheat)"
                className="w-full p-3 border rounded-lg mb-3"
                value={cropFormData.name}
                onChange={(e) => setCropFormData({ ...cropFormData, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description (optional)"
                className="w-full p-3 border rounded-lg mb-3"
                rows="3"
                value={cropFormData.description}
                onChange={(e) => setCropFormData({ ...cropFormData, description: e.target.value })}
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Add Crop
              </button>
            </form>
          )}

          <div className="bg-white shadow rounded-xl overflow-x-auto">
            {crops.length === 0 ? (
              <p className="p-4 text-gray-500">No crops found. Add one to get started.</p>
            ) : (
              <table className="w-full min-w-[480px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Crop Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map(crop => (
                    <tr key={crop.id} className="border-t">
                      <td className="p-4">{crop.name}</td>
                      <td className="p-4">{crop.description || 'N/A'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleUpdateCrop(crop.id, crop.name)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCrop(crop.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* MARKETS SECTION */}
      {activeTab === 'markets' && (
        <>
          <button
            onClick={() => setShowMarketForm(!showMarketForm)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl mb-4"
          >
            {showMarketForm ? '❌ Cancel' : '➕ Add New Market'}
          </button>

          {showMarketForm && (
            <form onSubmit={handleAddMarket} className="bg-white p-6 rounded-xl shadow mb-6">
              <input
                type="text"
                placeholder="Market name (e.g., Kigali Central Market)"
                className="w-full p-3 border rounded-lg mb-3"
                value={marketFormData.name}
                onChange={(e) => setMarketFormData({ ...marketFormData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location (optional)"
                className="w-full p-3 border rounded-lg mb-3"
                value={marketFormData.location}
                onChange={(e) => setMarketFormData({ ...marketFormData, location: e.target.value })}
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Add Market
              </button>
            </form>
          )}

          <div className="bg-white shadow rounded-xl overflow-x-auto">
            {markets.length === 0 ? (
              <p className="p-4 text-gray-500">No markets found. Add one to get started.</p>
            ) : (
              <table className="w-full min-w-[480px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Market Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map(market => (
                    <tr key={market.id} className="border-t">
                      <td className="p-4">{market.name}</td>
                      <td className="p-4">{market.location || 'N/A'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleUpdateMarket(market.id, market.name)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMarket(market.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* PRICES SECTION */}
      {activeTab === 'prices' && (
        <>
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search prices by crop or market..."
            className="w-full p-3 border rounded-xl"
            value={priceSearchTerm}
            onChange={(e) => setPriceSearchTerm(e.target.value)}
          />

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-x-auto">
            {prices.length === 0 ? (
              <p className="p-4 text-gray-500">No prices found.</p>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Crop</th>
                    <th className="p-4">Market</th>
                    <th className="p-4">Price (RWF)</th>
                    <th className="p-4">Agent</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices
                    .filter(price => {
                      const cropName = crops.find(c => String(c.id) === String(price.crop_id))?.name || price.crop_name || '';
                      const marketName = markets.find(m => String(m.id) === String(price.market_id))?.name || price.market_name || '';
                      const searchLower = priceSearchTerm.toLowerCase();
                      return cropName.toLowerCase().includes(searchLower) ||
                             marketName.toLowerCase().includes(searchLower);
                    })
                    .map(price => (
                      <tr key={price.id} className="border-t">
                        <td className="p-4 font-medium">{crops.find(c => String(c.id) === String(price.crop_id))?.name || price.crop_name || 'Crop'}</td>
                        <td className="p-4">{markets.find(m => String(m.id) === String(price.market_id))?.name || price.market_name || 'Market'}</td>
                        <td className="p-4 font-bold text-emerald-700">RWF {Number(price.price).toLocaleString()}</td>
                        <td className="p-4">{users.find(u => String(u.id) === String(price.agent_id))?.name || price.agent_name || 'Agent'}</td>
                        <td className="p-4">{price.date ? new Date(price.date).toLocaleDateString() : 'Today'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleEditPrice(price)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePrice(price.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* NOTIFICATIONS SECTION */}
      {activeTab === 'notifications' && (
        <>
          {/* FILTERS */}
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <select
                value={notificationFilters.type}
                onChange={(e) => setNotificationFilters({...notificationFilters, type: e.target.value})}
                className="p-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="sms">SMS</option>
                <option value="in_app">In-App</option>
                <option value="price_alert">Price Alert</option>
              </select>
              <input
                type="text"
                placeholder="Filter by user ID..."
                className="p-2 border rounded-lg"
                value={notificationFilters.userId}
                onChange={(e) => setNotificationFilters({...notificationFilters, userId: e.target.value})}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-x-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500">No notifications found.</p>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications
                    .filter(notification => {
                      if (notificationFilters.type && notification.type !== notificationFilters.type) return false;
                      if (notificationFilters.userId && notification.user_id != notificationFilters.userId) return false;
                      return true;
                    })
                    .map(notification => (
                      <tr key={notification.id} className="border-t">
                        <td className="p-4">{notification.user_name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            notification.type === 'sms' ? 'bg-blue-100 text-blue-700' :
                            notification.type === 'price_alert' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {notification.type}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs truncate">{notification.message}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            notification.is_read ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {notification.is_read ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="p-4">{new Date(notification.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

    </div>
  );
}

/* REUSABLE STAT CARD */
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
