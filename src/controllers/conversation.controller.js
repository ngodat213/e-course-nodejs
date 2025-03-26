const BaseController = require('./base.controller');
const ConversationService = require('../services/conversation.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const Course = require('../models/course.model');
const i18next = require('i18next');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

class ConversationController extends BaseController {
  constructor() {
    super();
  }

  async getConversations(req, res, next) {
    try {
      const conversations = await ConversationService.getConversations(req.user.id);
      this.successResponse(res, conversations);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const messages = await ConversationService.getMessages(
        conversationId,
        parseInt(page),
        parseInt(limit)
      );
      
      this.successResponse(res, messages);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { conversationId, content, contentType } = req.body;
      
      const message = await ConversationService.addMessage(
        conversationId,
        req.user.id,
        content,
        contentType
      );
      
      this.successResponse(res, message);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { conversationId } = req.params;
      
      await ConversationService.markMessagesAsRead(conversationId, req.user.id);
      
      this.successResponse(res, { message: i18next.t('conversation.messagesMarkedAsRead') });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getDirectChat(req, res, next) {
    try {
      const { instructorId } = req.params;
      
      const conversation = await ConversationService.getOrCreateDirectConversation(
        req.user.id,
        instructorId
      );
      
      this.successResponse(res, conversation);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async checkGroupAccess(req, res, next) {
    try {
      const { courseId } = req.params;
      
      const hasPurchased = await ConversationService.verifyPurchasedCourse(
        req.user.id,
        courseId
      );
      
      if (!hasPurchased) {
        return this.successResponse(res, {
          canJoin: false,
          message: i18next.t('conversation.needPurchase')
        });
      }
      
      try {
        const conversation = await ConversationService.getGroupConversation(courseId);
        
        const isMember = await ConversationService.checkUserInGroup(
          req.user.id,
          conversation._id
        );
        
        if (isMember) {
          return this.successResponse(res, {
            canJoin: false,
            alreadyJoined: true,
            conversationId: conversation._id,
            message: i18next.t('conversation.alreadyMember')
          });
        }
        
        return this.successResponse(res, {
          canJoin: true,
          conversationId: conversation._id,
          message: i18next.t('conversation.canJoin')
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          return this.successResponse(res, {
            canJoin: false,
            exists: false,
            message: i18next.t('conversation.groupNotExists')
          });
        }
        throw error;
      }
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async joinGroupChat(req, res, next) {
    try {
      const { courseId } = req.body;
      
      // Kiểm tra nếu user là instructor hoặc admin, không cần kiểm tra đã mua khóa học
      const course = await Course.findById(courseId);
      if (!course) {
        throw new NotFoundError(i18next.t('course.notFound'));
      }
      
      // Kiểm tra nếu người dùng là instructor của khóa học
      const isInstructor = course.instructor_id.toString() === req.user.id.toString();
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      
      // Nếu không phải instructor và không phải admin, kiểm tra đã mua khóa học chưa
      if (!isInstructor && !isAdmin) {
        const hasPurchased = await ConversationService.verifyPurchasedCourse(
          req.user.id,
          courseId
        );
        
        if (!hasPurchased) {
          throw new BadRequestError(i18next.t('conversation.needPurchase'));
        }
      }
      
      let conversation;
      
      try {
        conversation = await ConversationService.getGroupConversation(courseId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          conversation = await ConversationService.createGroupConversation(
            courseId,
            isInstructor ? req.user.id : course.instructor_id
          );
        } else {
          throw error;
        }
      }
      
      const isMember = await ConversationService.checkUserInGroup(
        req.user.id,
        conversation._id
      );
      
      if (isMember) {
        return this.successResponse(res, {
          success: true,
          alreadyJoined: true,
          conversationId: conversation._id,
          message: i18next.t('conversation.alreadyMember')
        });
      }
      
      // Xác định role của user trong group
      let role = 'student';
      if (isInstructor) {
        role = 'instructor';
      } else if (isAdmin) {
        role = 'admin';
      }
      
      await ConversationService.addUserToGroup(
        req.user.id,
        conversation._id,
        role
      );
      
      this.successResponse(res, {
        success: true,
        conversationId: conversation._id,
        message: i18next.t('conversation.joinedSuccessfully')
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async uploadMessageImage(req, res, next) {
    try {
      if (!req.file) {
        throw new BadRequestError(i18next.t('common.fileRequired'));
      }

      const { conversationId } = req.body;
      const caption = req.body.caption || '';

      const isMember = await ConversationService.checkUserInGroup(
        req.user.id,
        conversationId
      );

      if (!isMember) {
        fs.unlinkSync(req.file.path);
        throw new BadRequestError(i18next.t('conversation.notMember'));
      }

      const message = await ConversationService.addImageMessage(
        conversationId,
        req.user.id,
        req.file,
        caption
      );

      req.app.get('io').to(`conversation:${conversationId}`).emit('message:new', message);

      fs.unlinkSync(req.file.path);

      this.successResponse(res, message);
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      this.handleError(error, next);
    }
  }
}

module.exports = new ConversationController(); 