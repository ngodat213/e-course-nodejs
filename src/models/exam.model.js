const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    lesson_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true,
        min: 1
    },
    passing_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    total_questions: {
        type: Number,
        default: 0
    },
    random_questions: {
        type: Boolean,
        default: true
    },
    questions_per_exam: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    attempts_allowed: {
        type: Number,
        default: -1 // -1 means unlimited
    }
}, {
    timestamps: true
});

// Middleware để cập nhật lesson duration khi thay đổi exam
examSchema.post('save', async function() {
    const Lesson = mongoose.model('Lesson');
    await Lesson.findByIdAndUpdate(this.lesson_id, {
        duration: this.duration,
        'content.exam_id': this._id
    });
});

module.exports = mongoose.model('Exam', examSchema); 