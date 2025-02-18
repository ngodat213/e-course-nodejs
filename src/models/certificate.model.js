const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    certificate_number: {
        type: String,
        required: true,
        unique: true
    },
    issued_date: {
        type: Date,
        default: Date.now
    },
    completion_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active'
    },
    certificate_url: {
        type: String,
        required: true
    },
    metadata: {
        grade: {
            type: String,
            enum: ['pass', 'merit', 'distinction'],
            required: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        hours_completed: Number,
        skills_acquired: [String]
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Tạo certificate number tự động
certificateSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await this.constructor.countDocuments();
        this.certificate_number = `CERT-${Date.now()}-${count + 1}`;
    }
    next();
});

// Đảm bảo mỗi user chỉ có một certificate cho mỗi khóa học
certificateSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

// Tự động cập nhật số lượng certificates của user
certificateSchema.post('save', async function() {
    const User = mongoose.model('User');
    const certificateCount = await this.constructor.countDocuments({
        user_id: this.user_id,
        status: 'active'
    });
    await User.findByIdAndUpdate(this.user_id, {
        certificate_count: certificateCount
    });
});

module.exports = mongoose.model('Certificate', certificateSchema); 