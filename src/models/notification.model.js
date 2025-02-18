const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'course_enrolled',         // Đăng ký khóa học
            'course_completed',        // Hoàn thành khóa học
            'certificate_issued',      // Nhận chứng chỉ
            'review_approved',         // Review được duyệt
            'course_updated',          // Khóa học cập nhật
            'new_lesson',             // Bài học mới
            'instructor_reply',        // Giảng viên trả lời
            'payment_success',         // Thanh toán thành công
            'payment_failed',          // Thanh toán thất bại
            'system_notification'      // Thông báo hệ thống
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    data: {
        // Dữ liệu bổ sung tùy theo loại thông báo
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        lesson_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        review_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseReview'
        },
        certificate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Certificate'
        },
        payment_id: String,
        amount: Number,
        link: String,
        action: String
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index để tối ưu truy vấn
notificationSchema.index({ user_id: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, read: 1 });

// Tự động cập nhật số lượng thông báo chưa đọc của user
notificationSchema.post('save', async function() {
    const User = mongoose.model('User');
    const unreadCount = await this.constructor.countDocuments({
        user_id: this.user_id,
        read: false
    });
    
    await User.findByIdAndUpdate(this.user_id, {
        $set: { unread_notifications: unreadCount }
    });
});

// Static methods
notificationSchema.statics = {
    // Tạo thông báo mới
    async createNotification(data) {
        const notification = await this.create(data);
        
        // Thêm notification vào mảng notifications của user
        await mongoose.model('User').findByIdAndUpdate(
            data.user_id,
            { $push: { notifications: notification._id } }
        );

        return notification;
    },

    // Đánh dấu đã đọc nhiều thông báo
    async markManyAsRead(userId, notificationIds) {
        const result = await this.updateMany(
            {
                _id: { $in: notificationIds },
                user_id: userId
            },
            { $set: { read: true } }
        );

        // Cập nhật số lượng thông báo chưa đọc
        const unreadCount = await this.countDocuments({
            user_id: userId,
            read: false
        });

        await mongoose.model('User').findByIdAndUpdate(
            userId,
            { $set: { unread_notifications: unreadCount } }
        );

        return result;
    },

    // Xóa thông báo cũ
    async deleteOldNotifications(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const result = await this.deleteMany({
            created_at: { $lt: cutoffDate },
            read: true
        });

        return result;
    }
};

// Instance methods
notificationSchema.methods = {
    // Đánh dấu đã đọc một thông báo
    async markAsRead() {
        if (!this.read) {
            this.read = true;
            await this.save();

            // Cập nhật số lượng thông báo chưa đọc
            const unreadCount = await this.constructor.countDocuments({
                user_id: this.user_id,
                read: false
            });

            await mongoose.model('User').findByIdAndUpdate(
                this.user_id,
                { $set: { unread_notifications: unreadCount } }
            );
        }
        return this;
    }
};

module.exports = mongoose.model('Notification', notificationSchema); 