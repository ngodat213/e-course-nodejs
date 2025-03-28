const ConversationService = require('../../services/conversation.service');
const ChatNotificationHandler = require('./chat_notification.handler');
const { debug } = require('../../utils/logger');

class ChatHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
    this.userId = socket.user._id;
    this.notificationHandler = new ChatNotificationHandler(io);
    
    // Bind event handlers
    this.socket.on('join_conversation', this.handleJoinConversation.bind(this));
    this.socket.on('leave_conversation', this.handleLeaveConversation.bind(this));
    this.socket.on('send_message', this.handleSendMessage.bind(this));
    this.socket.on('typing', this.handleTyping.bind(this));
    this.socket.on('stop_typing', this.handleStopTyping.bind(this));
    this.socket.on('read_messages', this.handleReadMessages.bind(this));
    this.socket.on('send_image', this.handleSendImage.bind(this));
  }

  // Join conversation room
  async handleJoinConversation({ conversationId }) {
    try {
      // Verify user is a participant
      const isParticipant = await ConversationService.checkUserInGroup(this.userId, conversationId);
      
      if (!isParticipant) {
        return this.socket.emit('error', { message: 'Not authorized to join this conversation' });
      }
      
      this.socket.join(conversationId);
      debug(`User ${this.userId} joined conversation ${conversationId}`);
      
      // Thông báo cho những người khác trong room
      this.socket.to(conversationId).emit('user_joined', { 
        userId: this.userId.toString(), 
        user: {
          _id: this.socket.user._id,
          name: `${this.socket.user.first_name} ${this.socket.user.last_name}`,
          avatar: this.socket.user.profile_picture
        }
      });
      
      // Mark messages as read
      await ConversationService.markMessagesAsRead(conversationId, this.userId);
      
      // Emit read receipt to others
      this.socket.to(conversationId).emit('messages_read', { userId: this.userId.toString() });
    } catch (error) {
      debug('Error joining conversation:', error);
      this.socket.emit('error', { message: error.message });
    }
  }

  // Leave conversation room
  handleLeaveConversation({ conversationId }) {
    this.socket.leave(conversationId);
    this.socket.to(conversationId).emit('user_left', { userId: this.userId.toString() });
    debug(`User ${this.userId} left conversation ${conversationId}`);
  }

  // Send message
  async handleSendMessage({ conversationId, content, contentType = 'text' }) {
    try {
      const message = await ConversationService.addMessage(
        conversationId, 
        this.userId, 
        content, 
        contentType
      );
      
      // Emit message to all in the conversation including sender
      this.io.to(conversationId).emit('new_message', {
        message: {
          ...message.toObject(),
          sender: {
            _id: this.socket.user._id,
            name: `${this.socket.user.first_name} ${this.socket.user.last_name}`,
            avatar: this.socket.user.profile_picture
          }
        }
      });
      
      // Gửi thông báo
      await this.notificationHandler.handleNewMessage(
        conversationId, 
        message, 
        this.socket.user
      );
    } catch (error) {
      debug('Error sending message:', error);
      this.socket.emit('error', { message: error.message });
    }
  }

  // Send typing indicator
  handleTyping({ conversationId }) {
    this.socket.to(conversationId).emit('typing', { 
      userId: this.userId.toString(),
      name: `${this.socket.user.first_name} ${this.socket.user.last_name}`
    });
  }

  // Stop typing indicator
  handleStopTyping({ conversationId }) {
    this.socket.to(conversationId).emit('stop_typing', { userId: this.userId.toString() });
  }

  // Mark messages as read
  async handleReadMessages({ conversationId }) {
    try {
      await ConversationService.markMessagesAsRead(conversationId, this.userId);
      this.socket.to(conversationId).emit('messages_read', { userId: this.userId.toString() });
    } catch (error) {
      debug('Error marking messages as read:', error);
      this.socket.emit('error', { message: error.message });
    }
  }

  // Send image message
  async handleSendImage({ conversationId, imageData, caption }) {
    try {
      // Xử lý dữ liệu ảnh (base64)
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Tạo file từ buffer
      const file = {
        buffer,
        mimetype: imageData.substring(5, imageData.indexOf(';base64,')),
        originalname: `image_${Date.now()}.jpg`
      };
      
      const message = await ConversationService.addImageMessage(
        conversationId,
        this.userId,
        file,
        caption
      );
      
      // Emit message to all in the conversation including sender
      this.io.to(conversationId).emit('new_message', {
        message: {
          ...message.toObject(),
          sender: {
            _id: this.socket.user._id,
            name: `${this.socket.user.first_name} ${this.socket.user.last_name}`,
            avatar: this.socket.user.profile_picture
          }
        }
      });
      
      // Gửi thông báo
      await this.notificationHandler.handleNewMessage(
        conversationId, 
        message, 
        this.socket.user
      );
    } catch (error) {
      debug('Error sending image message:', error);
      this.socket.emit('error', { message: error.message });
    }
  }
}

module.exports = ChatHandler; 