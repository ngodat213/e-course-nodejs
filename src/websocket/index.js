const { Server } = require('socket.io');
const authMiddleware = require('../middleware/socket.middleware');
const ChatHandler = require('./handlers/chat.handler');
const { info, error, debug } = require('../utils/logger');

function initializeWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  // Apply authentication middleware
  io.use(authMiddleware);

  // Online users tracking
  const onlineUsers = new Map();

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    
    // Log successful connection
    info(`Socket connected: ${socket.id} for user: ${userId}`);
    
    // Track user connection
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    
    // Emit welcome event to confirm connection
    socket.emit('connection:success', {
      message: 'Successfully connected to websocket server',
      userId: userId
    });
    
    io.emit('users:online', Array.from(onlineUsers.keys()));

    // Initialize chat handler
    new ChatHandler(io, socket);

    // Add ping-pong mechanism to ensure connection is alive
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      info(`Socket disconnected: ${socket.id} for user: ${userId}`);
      onlineUsers.delete(userId);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });

  // Helper method để lấy socketId theo userId
  io.getSocketIdByUserId = (userId) => {
    return onlineUsers.get(userId);
  };
  
  // Lưu biến io vào global để các service khác có thể sử dụng
  global.io = io;

  return io;
}

module.exports = initializeWebSocket; 