import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false, // Só conecta após o login
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;