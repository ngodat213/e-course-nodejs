const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    order: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['video', 'article', 'quiz'],
        required: true
    },
    duration: {
        type: Number, // Thời lượng tính bằng phút
        default: 0
    },
    is_free: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    content: {
        // Cho bài viết
        text: String,
        // Cho video
        video_url: String,
        video_id: String, // Cloudinary public_id
        // Cho quiz
        questions: [{
            question: {
                type: String,
                required: true
            },
            options: [{
                text: String,
                is_correct: Boolean
            }],
            explanation: String,
            points: {
                type: Number,
                default: 1
            }
        }]
    },
    requirements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    attachments: [{
        name: String,
        url: String,
        file_id: String // Cloudinary public_id
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index để sắp xếp theo thứ tự
lessonSchema.index({ course_id: 1, order: 1 });

// Tự động cập nhật số lượng bài học trong khóa học
lessonSchema.post('save', async function() {
    const Course = mongoose.model('Course');
    const lessonCount = await this.constructor.countDocuments({
        course_id: this.course_id,
        status: 'published'
    });
    await Course.findByIdAndUpdate(this.course_id, {
        lesson_count: lessonCount
    });
});

module.exports = mongoose.model('Lesson', lessonSchema); 