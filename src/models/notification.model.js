const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'course_enrolled',
            'course_completed',
            'certificate_earned', 
            'course_updated',
            'new_review',
            'new_message',
            'system'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    action_url: {
        type: String,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes
notificationSchema.index({ user_id: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, read: 1 });

// Tự động cập nhật unread_notifications count trong User model
notificationSchema.post('save', async function() {
    const User = mongoose.model('User');
    const unreadCount = await this.constructor.countDocuments({
        user_id: this.user_id,
        read: false
    });
    
    await User.findByIdAndUpdate(this.user_id, {
        unread_notifications: unreadCount
    });
});

// Methods
notificationSchema.methods.markAsRead = async function() {
    this.read = true;
    await this.save();
    return this;
};

module.exports = mongoose.model('Notification', notificationSchema); 