import io from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'https://ehahiro-backend-3.onrender.com';
const socket = io(apiUrl, {
  transports: ['websocket', 'polling']
});

export const initSocket = (user) => {
  if (!socket.connected) {
    socket.connect();
  }
  if (user && user.id) {
    socket.emit('join', user.id);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const onPriceUpdate = (callback) => {
  socket.on('priceUpdate', callback);
};

export const onPriceAlert = (callback) => {
  socket.on('priceAlert', callback);
};

export const offPriceUpdate = (callback) => {
  socket.off('priceUpdate', callback);
};

export const offPriceAlert = (callback) => {
  socket.off('priceAlert', callback);
};

export default socket;