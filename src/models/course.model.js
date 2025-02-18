const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thumbnail: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Thumbnail must be a valid URL'
        }
    },
    thumbnail_id: {
        type: String,
        default: null
    },
    student_count: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    review_count: {
        type: Number,
        default: 0
    },
    total_revenue: {
        type: Number,
        default: 0
    },
    lesson_count: {
        type: Number,
        default: 0
    },
    total_duration: {
        type: Number,
        default: 0
    },
    has_certificate: {
        type: Boolean,
        default: false
    },
    requirements: [String],
    what_you_will_learn: [String],
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Tự động tính tổng thời lượng khóa học
courseSchema.pre('save', async function() {
    if (this.isModified('lesson_count')) {
        const Lesson = mongoose.model('Lesson');
        const totalDuration = await Lesson.aggregate([
            { $match: { 
                course_id: this._id,
                status: 'published'
            }},
            { $group: {
                _id: null,
                duration: { $sum: '$duration' }
            }}
        ]);
        this.total_duration = totalDuration[0]?.duration || 0;
    }
});

module.exports = mongoose.model('Course', courseSchema); 