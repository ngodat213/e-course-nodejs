const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
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
    passing_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    time_limit: {
        type: Number,  // in minutes
        required: true,
        min: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exam', examSchema); 