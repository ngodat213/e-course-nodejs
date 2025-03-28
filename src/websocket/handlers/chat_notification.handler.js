const NotificationService = require('../../services/notification.service');
const Conversation = require('../../models/conversation.model');
const { debug } = require('../../utils/logger');

class ChatNotificationHandler {
  constructor(io) {
    this.io = io;
  }

  async handleNewMessage(conversationId, message, sender) {
    try {
      // Lấy thông tin conversation và participants
      const conversation = await this.getConversationWithParticipants(conversationId);
      if (!conversation) return;

      // Lọc ra những người dùng không phải người gửi
      const recipients = conversation.participants
        .filter(p => p.user._id.toString() !== sender._id.toString())
        .map(p => p.user);

      // Không có người nhận, không cần gửi thông báo
      if (recipients.length === 0) return;

      // Gửi thông báo cho từng người nhận qua FCM
      for (const recipient of recipients) {
        // Gửi thông báo qua Socket nếu user đang online
        const socketId = this.io.getSocketIdByUserId(recipient._id.toString());
        
        if (socketId) {
          this.io.to(socketId).emit('new_message_notification', {
            conversationId: conversation._id,
            message: this.getMessagePreview(message),
            sender: {
              _id: sender._id,
              name: sender.name || `${sender.first_name} ${sender.last_name}`,
              avatar: sender.avatar || sender.profile_picture
            }
          });
        }
        
        // Gửi thông báo FCM nếu user không online hoặc không trong conversation hiện tại
        if (!socketId || !this.isUserInConversation(recipient._id.toString(), conversationId)) {
          await this.sendFcmNotification(recipient, conversation, message, sender);
        }
      }
    } catch (error) {
      debug('Error in chat notification handler:', error);
    }
  }

  isUserInConversation(userId, conversationId) {
    const rooms = this.io.sockets.adapter.rooms.get(conversationId);
    if (!rooms) return false;
    
    // Kiểm tra xem user có đang trong phòng conversation không
    for (const socketId of rooms) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.user && socket.user._id.toString() === userId) {
        return true;
      }
    }
    return false;
  }

  async getConversationWithParticipants(conversationId) {
    return await Conversation.findById(conversationId)
      .populate('participants.user', 'first_name last_name email profile_picture fcm_tokens')
      .populate('courseId', 'title');
  }

  async sendFcmNotification(recipient, conversation, message, sender) {
    // Bỏ qua nếu người dùng không có FCM token
    if (!recipient.fcm_tokens || recipient.fcm_tokens.length === 0) return;

    const notificationData = {
      user_id: recipient._id,
      type: 'new_message',
      title: this.getNotificationTitle(conversation, sender),
      message: this.getNotificationMessage(message),
      data: {
        conversation_id: conversation._id.toString(),
        sender_id: sender._id.toString(),
        sender_name: sender.name || `${sender.first_name} ${sender.last_name}`,
        course_id: conversation.courseId?._id?.toString(),
        course_title: conversation.courseId?.title,
        message_type: message.contentType,
        message_preview: this.getMessagePreview(message)
      },
      action_url: `/chat/${conversation._id}`
    };

    await NotificationService.create(notificationData);
  }

  getNotificationTitle(conversation, sender) {
    const senderName = sender.name || `${sender.first_name} ${sender.last_name}`;
    
    if (conversation.type === 'group') {
      return `${senderName} in ${conversation.courseId?.title || conversation.name}`;
    }
    return `Message from ${senderName}`;
  }

  getNotificationMessage(message) {
    if (message.contentType === 'image') {
      return 'Sent an image';
    }
    return message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
  }

  getMessagePreview(message) {
    if (message.contentType === 'image') {
      return '📷 Image';
    }
    return message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
  }
}

module.exports = ChatNotificationHandler; 