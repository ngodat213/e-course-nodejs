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
    order: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "article", "quiz"],
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    is_free: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    content: {
      type: String, // HTML content cho article
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudinaryFile",
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    attachments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudinaryFile",
    }],
    requirements: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    }],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Indexes
lessonSchema.index({ course_id: 1, order: 1 });
lessonSchema.index({ title: "text" });

// Middleware để cập nhật course khi lesson được publish
lessonSchema.post("save", async function () {
  const Course = mongoose.model("Course");
  if (this.status === "published") {
    await Course.findByIdAndUpdate(this.course_id, {
      $inc: { lesson_count: 1, total_duration: this.duration },
    });
  }
});

// Middleware để cập nhật course khi lesson bị xóa
lessonSchema.post("remove", async function () {
  const Course = mongoose.model("Course");
  if (this.status === "published") {
    await Course.findByIdAndUpdate(this.course_id, {
      $inc: { lesson_count: -1, total_duration: -this.duration },
    });
  }
});

module.exports = mongoose.model("Lesson", lessonSchema);
