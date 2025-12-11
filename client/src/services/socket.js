import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      const token = localStorage.getItem('token');
      
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onAlert(callback) {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.ALERT, callback);
    }
  }

  onLiveOccupancy(callback) {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.LIVE_OCCUPANCY, callback);
    }
  }

  offAlert() {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.ALERT);
    }
  }

  offLiveOccupancy() {
    if (this.socket) {
      this.socket.off(SOCKET_EVENTS.LIVE_OCCUPANCY);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;