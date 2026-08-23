import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || {};
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (token && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setUser(parsed);
          api.defaults.headers.Authorization = `Bearer ${token}`;
          initSocket(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading saved user session:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (phone) => {
    const { data } = await api.post('/auth/login', { phone });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    // Initialize WebSocket connection
    initSocket(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    // Initialize WebSocket connection
    initSocket(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.Authorization;
    setUser(null);
    // Disconnect WebSocket
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};