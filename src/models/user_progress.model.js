const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
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
    lesson_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    content_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonContent',
        required: true
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    }
}, {
    timestamps: true
});

// Chỉ cần unique theo user_id và content_id vì một content chỉ thuộc về một lesson
userProgressSchema.index({ user_id: 1, content_id: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema); 