const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    instructor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["course", "quiz"],
      required: true
    },
    thumbnail_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudinaryFile",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "deleted"],
      default: "draft",
    },
    total_duration: {
      type: Number,
      default: 0,
    },
    lesson_count: {
      type: Number,
      default: 0,
    },
    student_count: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    review_count: {
      type: Number,
      default: 0,
    },
    total_revenue: {
      type: Number,
      default: 0,
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware để validate type và lessons
courseSchema.pre('save', async function(next) {
  if (this.isModified('type')) {
    const Lesson = mongoose.model('Lesson');
    if (this.type === 'quiz') {
      // Kiểm tra xem có lesson nào không phải quiz không
      const nonQuizLessons = await Lesson.exists({
        course_id: this._id,
        type: { $ne: 'exam' }
      });
      
      if (nonQuizLessons) {
        throw new Error('Quiz courses can only contain exam lessons');
      }
    }
  }
  next();
});

// Tự động tính tổng thời lượng khóa học
courseSchema.pre("save", async function () {
  if (this.isModified("lesson_count")) {
    const Lesson = mongoose.model("Lesson");
    const totalDuration = await Lesson.aggregate([
      {
        $match: {
          course_id: this._id,
          status: "published",
        },
      },
      {
        $group: {
          _id: null,
          duration: { $sum: "$duration" },
        },
      },
    ]);
    this.total_duration = totalDuration[0]?.duration || 0;
  }
});

module.exports = mongoose.model("Course", courseSchema);
