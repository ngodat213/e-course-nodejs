const mongoose = require('mongoose');

const examHistorySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    answers: {
        type: Map,
        of: String
    },
    passed: {
        type: Boolean,
        required: true
    },
    completed_at: {
        type: Date,
        default: Date.now
    },
    duration_taken: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ExamHistory', examHistorySchema); 