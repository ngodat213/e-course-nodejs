const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["video", "document", "exam"],
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      required: true,
    },
    is_free: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudinaryFile",
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
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
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ course_id: 1, order: 1 });
lessonSchema.index({ title: "text" });

// Middleware để validate lesson type với course type
lessonSchema.pre("save", async function (next) {
  const Course = mongoose.model("Course");
  const course = await Course.findById(this.course_id);
  if (course.type === "quiz" && this.type !== "exam") {
    throw new Error("Quiz courses can only contain exam lessons");
  }

  next();
});

// Middleware để cập nhật course khi thêm/sửa lesson
lessonSchema.post("save", async function () {
  const Course = mongoose.model("Course");

  if (this.status === "published") {
    await Course.findByIdAndUpdate(this.course_id, {
      $inc: {
        lesson_count: 1,
        total_duration: this.duration || 0,
      },
      $push: { lessons: this._id }, 
    });
  }
});

// Middleware để cập nhật course khi lesson bị xóa
lessonSchema.post("remove", async function () {
  const Course = mongoose.model("Course");
  if (this.status === "published") {
    await Course.findByIdAndUpdate(this.course_id, {
      $inc: { lesson_count: -1, total_duration: -this.duration },
      $pull: { lessons: this._id },
    });
  }
});

module.exports = mongoose.model("Lesson", lessonSchema);
