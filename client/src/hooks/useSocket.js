import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('Real-Time WebSocket Connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Real-Time WebSocket Disconnected');
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
};

export default useSocket;
