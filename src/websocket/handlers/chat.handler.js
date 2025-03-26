const conversationService = require('../../services/conversation.service');
const chatCacheService = require('../../services/chat_cache.service');
const { info, error, debug } = require('../../utils/logger');
const Conversation = require('../../models/conversation.model');

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
    
    // Thêm event listener cho disconnection để cập nhật trạng thái online
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
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
          
          // Cập nhật trạng thái online trong Redis
          await chatCacheService.addOnlineUser(conversationId, this.userId);
          
          // Thông báo cho các thành viên khác
          this.socket.to(`conversation:${conversationId}`).emit('user:online', {
            conversationId,
            userId: this.userId.toString()
          });
          
          // Lấy danh sách người dùng online và gửi cho client
          const onlineUsers = await chatCacheService.getOnlineUsers(conversationId);
          this.socket.emit('users:online', {
            conversationId,
            users: onlineUsers
          });
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
      
      // Dừng typing indicator sau khi gửi message
      await this.handleTypingStop(conversationId);
    } catch (err) {
      error(`Error sending message: ${err.message}`);
      this.socket.emit('error', { message: err.message });
    }
  }
  
  async handleTypingStart(conversationId) {
    try {
      // Lưu trạng thái typing vào Redis
      await chatCacheService.setUserTyping(conversationId, this.userId);
      
      this.socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId: this.userId
      });
    } catch (err) {
      debug(`Error handling typing start: ${err}`);
    }
  }
  
  async handleTypingStop(conversationId) {
    try {
      // Xóa trạng thái typing từ Redis
      await chatCacheService.stopUserTyping(conversationId, this.userId);
      
      this.socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: this.userId
      });
    } catch (err) {
      debug(`Error handling typing stop: ${err}`);
    }
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
  
  async handleDisconnect() {
    try {
      // Lấy tất cả conversation mà user là thành viên
      const conversations = await Conversation.find({
        'participants.user': this.userId
      }, '_id');
      
      // Cập nhật trạng thái online trong tất cả các conversation
      for (const conversation of conversations) {
        const conversationId = conversation._id;
        
        // Xóa trạng thái online từ Redis
        await chatCacheService.removeOnlineUser(conversationId, this.userId);
        
        // Xóa trạng thái typing
        await chatCacheService.stopUserTyping(conversationId, this.userId);
        
        // Thông báo cho các thành viên khác
        this.io.to(`conversation:${conversationId}`).emit('user:offline', {
          conversationId,
          userId: this.userId.toString()
        });
      }
      
      info(`User ${this.userId} disconnected from all conversations`);
    } catch (err) {
      error(`Error handling disconnect: ${err.message}`);
    }
  }
}

module.exports = ChatHandler; 