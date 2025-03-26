const mongoose = require('mongoose');

const lessonContentSchema = new mongoose.Schema({
  lesson_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'document', 'quiz'],
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CloudinaryFile",
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
  },
  attachments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudinaryFile",
    },
  ],
  requirements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: false,
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  discriminatorKey: 'type'
});

// Indexes
lessonContentSchema.index({ lesson_id: 1, order: 1 }, { unique: true });
lessonContentSchema.index({ lesson_id: 1, type: 1 });
lessonContentSchema.index({ status: 1 });

// Middleware để cập nhật duration của lesson
lessonContentSchema.post('save', async function() {
  if (this.status === 'published') {
    const Lesson = mongoose.model('Lesson');
    const totalDuration = await mongoose.model('LessonContent')
      .aggregate([
        { $match: { lesson_id: this.lesson_id, status: 'published' } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]);
    
    await Lesson.findByIdAndUpdate(this.lesson_id, {
      duration: totalDuration[0]?.total || 0
    });
  }
});

module.exports = mongoose.model('LessonContent', lessonContentSchema); 