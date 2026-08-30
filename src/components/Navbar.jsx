import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LogIn, UserPlus, TrendingUp, Heart, Menu, X, Shield, Store, LayoutDashboard } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  if (!user) {
    // Public navbar
    return (
      <nav className="bg-white/85 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-emerald-100">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <img src="/eHAHIRO-logo.png" alt="eHAHIRO AgriPrice" className="h-10 w-auto flex-shrink-0" />
            <span className="hidden text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent sm:inline">
              AgriPrice
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-all flex items-center space-x-1 sm:px-4"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </Link>
            <Link
              to="/register"
              className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center space-x-1 sm:px-4"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated navbar
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-emerald-100">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Desktop Nav Links */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link to="/" className="flex items-center space-x-2.5" onClick={() => setMobileMenuOpen(false)}>
            <img src="/eHAHIRO-logo.png" alt="eHAHIRO AgriPrice" className="h-10 w-auto flex-shrink-0" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent hidden sm:inline">
              AgriPrice
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/') ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              <LayoutDashboard size={16} className="mr-1.5" />
              Prices
            </Link>
            <Link
              to="/trends"
              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/trends') ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <TrendingUp size={16} className="mr-1.5" />
              Trends
            </Link>
            <Link
              to="/subscriptions"
              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/subscriptions') ? 'bg-pink-600 text-white shadow-sm' : 'text-gray-700 hover:bg-pink-50'
              }`}
            >
              <Heart size={16} className="mr-1.5" />
              Alerts
            </Link>
            {user.role === 'agent' && (
              <Link
                to="/agent"
                className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/agent') ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <Store size={16} className="mr-1.5" />
                Agent Panel
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/admin') || isActive('/crops') || isActive('/markets')
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                <Shield size={16} className="mr-1.5" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <NotificationDropdown />
          
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {user.name ? user.name[0].toUpperCase() : <User size={12} />}
            </div>
            <span className="font-semibold text-xs text-emerald-900 capitalize">
              {user.name || user.role}
            </span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-200 text-emerald-800 font-bold rounded">
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut size={19} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-lg px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/') ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-emerald-50'
            }`}
          >
            <LayoutDashboard size={18} className="mr-2" />
            Market Prices
          </Link>
          <Link
            to="/trends"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/trends') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'
            }`}
          >
            <TrendingUp size={18} className="mr-2" />
            Price Trends
          </Link>
          <Link
            to="/subscriptions"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/subscriptions') ? 'bg-pink-600 text-white' : 'text-gray-700 hover:bg-pink-50'
            }`}
          >
            <Heart size={18} className="mr-2" />
            My Subscriptions & Alerts
          </Link>
          {user.role === 'agent' && (
            <Link
              to="/agent"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive('/agent') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <Store size={18} className="mr-2" />
              Agent Dashboard
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive('/admin') ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              <Shield size={18} className="mr-2" />
              Admin Dashboard
            </Link>
          )}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Signed in as <strong>{user.phone || user.name}</strong> ({user.role})</span>
          </div>
        </div>
      )}
    </nav>
  );
}

