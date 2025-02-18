const mongoose = require('mongoose');

const courseReviewSchema = new mongoose.Schema({
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
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reply: {
        content: String,
        replied_at: Date,
        replied_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Đảm bảo mỗi user chỉ review một khóa học một lần
courseReviewSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

// Tự động cập nhật rating trung bình của khóa học
courseReviewSchema.post('save', async function() {
    const Course = mongoose.model('Course');
    const stats = await this.constructor.aggregate([
        { $match: { course_id: this.course_id, status: 'approved' } },
        { $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            numReviews: { $sum: 1 }
        }}
    ]);

    await Course.findByIdAndUpdate(this.course_id, {
        rating: stats[0]?.avgRating || 0,
        review_count: stats[0]?.numReviews || 0
    });
});

module.exports = mongoose.model('CourseReview', courseReviewSchema); 