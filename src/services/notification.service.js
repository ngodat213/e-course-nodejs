const admin = require('firebase-admin');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { NotFoundError } = require('../utils/errors');
const i18next = require('i18next');

class NotificationService {
  // Tạo thông báo và gửi push notification
  async create(data) {
    const { user_id, type, title, message, data: payload, action_url } = data;
    
    // Kiểm tra user tồn tại
    const user = await User.findById(user_id);
    if (!user) {
      throw new NotFoundError(i18next.t('user.notFound'));
    }
    
    // Tạo notification trong DB
    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      data: payload || null,
      action_url: action_url || null
    });
    
    // Gửi push notification nếu có tokens
    if (user.fcm_tokens && user.fcm_tokens.length > 0) {
      this.sendPush(user.fcm_tokens, { 
        title, 
        message, 
        data: payload, 
        action_url,
        // Set priority cao cho thông báo tin nhắn để đảm bảo nó hiển thị ngay lập tức
        priority: type === 'new_message' ? 'high' : 'normal'
      });
    }
    
    return notification;
  }

  // Gửi push notification qua FCM
  async sendPush(tokens, data) {
    // Trích xuất tokens nếu là mảng object
    const deviceTokens = tokens.map(item => typeof item === 'string' ? item : item.token);
    
    if (deviceTokens.length === 0) return null;
    
    const { title, message, data: payload, action_url, priority = 'normal' } = data;
    
    // Setup notification payload
    const notificationPayload = {
      notification: {
        title,
        body: message,
        click_action: action_url || '',
        sound: priority === 'high' ? 'default' : null
      },
      data: {
        ...(payload || {}),
        time: new Date().toISOString(),
        priority,
        action_url: action_url || '',
        notification_type: payload?.type || 'general'
      }
    };
    
    // Android specific options
    notificationPayload.android = {
      priority: priority === 'high' ? 'high' : 'normal',
      notification: {
        channel_id: priority === 'high' ? 'high_importance' : 'default',
        icon: 'ic_notification',
        color: '#2196F3'
      }
    };
    
    // iOS specific options
    notificationPayload.apns = {
      payload: {
        aps: {
          sound: priority === 'high' ? 'default' : null,
          content_available: true,
          mutable_content: true
        }
      },
      fcm_options: {
        image: payload?.sender_avatar || null
      }
    };
    
    try {
      const response = await admin.messaging().sendMulticast({
        tokens: deviceTokens,
        ...notificationPayload
      });
      
      // Xử lý tokens không hợp lệ
      if (response.failureCount > 0) {
        const invalidTokens = [];
        
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(deviceTokens[idx]);
          }
        });
        
        // Cập nhật database nếu có tokens lỗi
        if (invalidTokens.length > 0) {
          this.cleanupInvalidTokens(invalidTokens);
        }
      }
      
      return {
        success: response.successCount,
        failure: response.failureCount
      };
    } catch (error) {
      console.error('FCM Error:', error);
      return { error: error.message };
    }
  }
  
  // Xóa tokens không hợp lệ
  async cleanupInvalidTokens(invalidTokens) {
    if (!invalidTokens.length) return;
    
    // Tìm users có chứa invalid tokens và cập nhật
    await User.updateMany(
      { 'fcm_tokens.token': { $in: invalidTokens } },
      { $pull: { fcm_tokens: { token: { $in: invalidTokens } } } }
    );
  }

  // Lấy danh sách thông báo
  async getByUser(userId, options = {}) {
    const { page = 1, limit = 20, unread = false } = options;
    
    const query = { user_id: userId };
    if (unread) {
      query.read = false;
    }
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(query)
    ]);
    
    return {
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user_id: userId, read: false },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      throw new NotFoundError(i18next.t('notification.notFound'));
    }
    
    return notification;
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { user_id: userId, read: false },
      { read: true }
    );
    
    // Cập nhật count trong user model
    await User.findByIdAndUpdate(userId, { unread_notifications: 0 });
    
    return {
      count: result.modifiedCount,
      message: i18next.t('notification.allMarkedRead', { defaultValue: 'All notifications marked as read' })
    };
  }

  // Xóa thông báo
  async delete(notificationId, userId) {
    const result = await Notification.deleteOne({ _id: notificationId, user_id: userId });
    
    if (result.deletedCount === 0) {
      throw new NotFoundError(i18next.t('notification.notFound'));
    }
    
    return {
      message: i18next.t('notification.deleted', { defaultValue: 'Notification deleted successfully' })
    };
  }
  
  // Helper methods cho các loại thông báo phổ biến
  
  // Thông báo khóa học
  async notifyCourseEnrollment(userId, courseId, courseTitle) {
    return this.create({
      user_id: userId,
      type: 'course_enrolled',
      title: i18next.t('notification.courseEnrolled', { defaultValue: 'Course Enrolled' }),
      message: i18next.t('notification.courseEnrolledMessage', { defaultValue: 'You have successfully enrolled in {course}', course: courseTitle }),
      data: { course_id: courseId },
      action_url: `/courses/${courseId}`
    });
  }
  
  // Thông báo chứng chỉ
  async notifyCertificateEarned(userId, courseId, courseTitle) {
    return this.create({
      user_id: userId,
      type: 'certificate_earned',
      title: i18next.t('notification.certificateEarned', { defaultValue: 'Certificate Earned' }),
      message: i18next.t('notification.certificateEarnedMessage', { defaultValue: 'You have earned a certificate for {course}', course: courseTitle }),
      data: { course_id: courseId },
      action_url: `/certificates/${courseId}`
    });
  }
  
  // Thông báo hệ thống
  async notifySystem(userId, title, message, data = null) {
    return this.create({
      user_id: userId,
      type: 'system',
      title,
      message,
      data,
      action_url: null
    });
  }
  
  // Thông báo tin nhắn mới
  async notifyNewMessage(userId, conversationId, senderId, senderName, message, courseId = null, courseTitle = null) {
    return this.create({
      user_id: userId,
      type: 'new_message',
      title: courseTitle ? `${senderName} in ${courseTitle}` : `Message from ${senderName}`,
      message: message.length > 50 ? message.substring(0, 47) + '...' : message,
      data: { 
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        course_id: courseId
      },
      action_url: `/chat/${conversationId}`
    });
  }
}

module.exports = new NotificationService();