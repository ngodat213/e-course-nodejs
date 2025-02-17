const mongoose = require('mongoose');

const userVideoProgressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lesson_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    watched_duration: {
        type: Number,
        default: 0,
        min: 0
    },
    total_duration: {
        type: Number,
        required: true,
        min: 0
    },
    progress_percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    last_watched_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Composite index for unique video progress per user and lesson
userVideoProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

module.exports = mongoose.model('UserVideoProgress', userVideoProgressSchema); 