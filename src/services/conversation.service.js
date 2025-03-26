const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const Course = require("../models/course.model");
const Order = require("../models/order.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
const chatCacheService = require('./chat_cache.service');
const { debug } = require('../utils/logger');

class ConversationService {
  async getOrCreateDirectConversation(userId1, userId2) {
    let conversation = await Conversation.findOne({
      type: 'direct',
      'participants.user': { $all: [userId1, userId2] },
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [
          { user: userId1 },
          { user: userId2 }
        ]
      });
    }

    return conversation;
  }

  async getGroupConversation(courseId) {
    const conversation = await Conversation.findOne({
      type: 'group',
      courseId
    });

    if (!conversation) {
      throw new NotFoundError(i18next.t('conversation.groupNotFound'));
    }

    return conversation;
  }

  async createGroupConversation(courseId, creatorId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t('course.notFound'));
    }

    const participants = [];
    
    if (course.instructor_id.toString() !== creatorId.toString()) {
      participants.push(
        { user: course.instructor_id, role: 'instructor' },
        { user: creatorId, role: 'admin' }
      );
    } else {
      participants.push(
        { user: creatorId, role: 'admin' }
      );
    }

    const conversation = await Conversation.create({
      type: 'group',
      name: `${course.title} Group`,
      courseId,
      participants
    });

    return conversation;
  }

  async checkUserInGroup(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError(i18next.t('conversation.notFound'));
    }

    const isParticipant = conversation.participants.some(
      p => p.user.toString() === userId.toString()
    );

    return isParticipant;
  }

  async addUserToGroup(userId, conversationId, role = 'student') {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError(i18next.t('conversation.notFound'));
    }
    
    const isAlreadyMember = conversation.participants.some(
      p => p.user.toString() === userId.toString()
    );
    
    if (isAlreadyMember) {
      throw new BadRequestError(i18next.t('conversation.alreadyMember'));
    }
    
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: {
        participants: {
          user: userId,
          role,
          joinedAt: Date.now()
        }
      }
    });
    
    // Invalidate cache khi có thành viên mới
    await chatCacheService.invalidateParticipantsCache(conversationId);
    
    return { success: true };
  }

  async verifyPurchasedCourse(userId, courseId) {
    const order = await Order.findOne({
      user_id: userId,
      'courses.course_id': courseId,
      status: 'paid'
    });
    
    return !!order;
  }

  async getConversations(userId) {
    const conversations = await Conversation.find({
      'participants.user': userId
    })
    .populate('lastMessage')
    .populate('courseId', 'title')
    .sort({ updatedAt: -1 });
    
    // Populate participants từ cache nếu có, nếu không thì load từ DB
    for (const conversation of conversations) {
      const cachedParticipants = await chatCacheService.getParticipantsFromCache(conversation._id);
      
      if (cachedParticipants) {
        debug(`Using cached participants for conversation ${conversation._id}`);
        // Gán participants từ cache
        conversation.participants = cachedParticipants.map(p => ({
          user: {
            _id: p.userId,
            name: p.name,
            email: p.email,
            avatar: p.avatar
          },
          role: p.role,
          joinedAt: p.joinedAt || new Date()
        }));
      } else {
        // Load từ database và cache lại
        await conversation.populate('participants.user', 'name email avatar');
        await chatCacheService.cacheParticipants(conversation._id, conversation.participants);
      }
      
      // Thêm thông tin người dùng online
      const onlineUsers = await chatCacheService.getOnlineUsers(conversation._id);
      conversation._doc.onlineUsers = onlineUsers;
      
      // Thêm thông tin người dùng đang typing
      const typingUsers = await chatCacheService.getUsersTyping(conversation._id);
      conversation._doc.typingUsers = typingUsers;
    }
    
    return conversations;
  }

  async getMessages(conversationId, page = 1, limit = 20) {
    // Thử lấy từ cache trước (chỉ áp dụng cho page đầu tiên)
    if (page === 1) {
      const cachedMessages = await chatCacheService.getMessagesFromCache(conversationId);
      if (cachedMessages) {
        debug(`Using cached messages for conversation ${conversationId}`);
        return cachedMessages;
      }
    }
    
    // Nếu không có cache hoặc không phải page đầu, lấy từ database
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const result = messages.reverse();
    
    // Cache lại nếu là page đầu tiên
    if (page === 1) {
      await chatCacheService.cacheMessages(conversationId, result);
    }
    
    return result;
  }

  async addMessage(conversationId, senderId, content, contentType = 'text') {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError(i18next.t('conversation.notFound'));
    }
    
    const isParticipant = conversation.participants.some(
      p => p.user.toString() === senderId.toString()
    );
    
    if (!isParticipant) {
      throw new BadRequestError(i18next.t('conversation.notMember'));
    }
    
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
      contentType,
      readBy: [{ user: senderId }]
    });
    
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id
    });
    
    await message.populate('sender', 'name email avatar');
    
    // Invalidate cache khi có tin nhắn mới
    await chatCacheService.invalidateMessagesCache(conversationId);
    
    return message;
  }

  async markMessagesAsRead(conversationId, userId) {
    await Message.updateMany(
      {
        conversation: conversationId,
        'readBy.user': { $ne: userId }
      },
      {
        $addToSet: {
          readBy: { user: userId }
        }
      }
    );
    
    return { success: true };
  }
}

module.exports = new ConversationService(); 