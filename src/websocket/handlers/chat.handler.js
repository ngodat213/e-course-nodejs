const conversationService = require('../../services/conversation.service');
const { info, error } = require('../../utils/logger');

class ChatHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
    this.userId = socket.user._id;
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.socket.on('join:conversations', this.handleJoinConversations.bind(this));
    this.socket.on('message:send', this.handleSendMessage.bind(this));
    this.socket.on('typing:start', this.handleTypingStart.bind(this));
    this.socket.on('typing:stop', this.handleTypingStop.bind(this));
    this.socket.on('message:read', this.handleReadMessage.bind(this));
  }
  
  async handleJoinConversations(conversationIds) {
    try {
      if (!Array.isArray(conversationIds)) {
        conversationIds = [conversationIds];
      }
      
      for (const conversationId of conversationIds) {
        const isMember = await conversationService.checkUserInGroup(
          this.userId,
          conversationId
        );
        
        if (isMember) {
          this.socket.join(`conversation:${conversationId}`);
          info(`User ${this.userId} joined conversation room: ${conversationId}`);
        }
      }
    } catch (err) {
      error(`Error joining conversations: ${err.message}`);
      this.socket.emit('error', { message: err.message });
    }
  }
  
  async handleSendMessage(data) {
    try {
      const { conversationId, content, contentType = 'text' } = data;
      
      const message = await conversationService.addMessage(
        conversationId,
        this.userId,
        content,
        contentType
      );
      
      this.io.to(`conversation:${conversationId}`).emit('message:new', message);
    } catch (err) {
      error(`Error sending message: ${err.message}`);
      this.socket.emit('error', { message: err.message });
    }
  }
  
  handleTypingStart(conversationId) {
    this.socket.to(`conversation:${conversationId}`).emit('typing:start', {
      conversationId,
      userId: this.userId
    });
  }
  
  handleTypingStop(conversationId) {
    this.socket.to(`conversation:${conversationId}`).emit('typing:stop', {
      conversationId,
      userId: this.userId
    });
  }
  
  async handleReadMessage(conversationId) {
    try {
      await conversationService.markMessagesAsRead(conversationId, this.userId);
      
      this.io.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        userId: this.userId
      });
    } catch (err) {
      error(`Error marking messages as read: ${err.message}`);
      this.socket.emit('error', { message: err.message });
    }
  }
}

module.exports = ChatHandler; 