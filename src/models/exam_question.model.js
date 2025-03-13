const mongoose = require('mongoose');

const examQuestionSchema = new mongoose.Schema({
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    video_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CloudinaryFile'
    },
    image_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CloudinaryFile'
    },
    answers: [{
        text: {
            type: String,
            required: true
        },
        is_correct: {
            type: Boolean,
            required: true
        }
    }],
    explanation: String,
    points: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Middleware để cập nhật total_questions trong exam
examQuestionSchema.post('save', async function() {
    const Exam = mongoose.model('Exam');
    const questionCount = await this.constructor.countDocuments({
        exam_id: this.exam_id
    });
    await Exam.findByIdAndUpdate(this.exam_id, {
        total_questions: questionCount
    });
});

module.exports = mongoose.model('ExamQuestion', examQuestionSchema); 