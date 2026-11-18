import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false, // Só conecta após o login
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  // Também cancela tentativas de reconexão em andamento (não só a conexão ativa).
  socket.disconnect();
};

export default socket;