const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const Course = require("../models/course.model");
const Order = require("../models/order.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");

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
    .populate('participants.user', 'name email avatar')
    .populate('courseId', 'title')
    .sort({ updatedAt: -1 });
    
    return conversations;
  }

  async getMessages(conversationId, page = 1, limit = 20) {
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return messages.reverse();
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