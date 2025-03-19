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
    description: {
      type: String,
      trim: true,
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
      enum: ["draft", "published", "archived"],
      default: "draft",
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate cho contents
lessonSchema.virtual("contents", {
  ref: "LessonContent",
  localField: "_id",
  foreignField: "lesson_id",
});

// Indexes
lessonSchema.index({ course_id: 1 });
lessonSchema.index({ title: "text" });
lessonSchema.index({ status: 1 });

// Middleware để cập nhật course khi thêm/sửa lesson
lessonSchema.post("save", async function () {
  const Course = mongoose.model("Course");
  if (this.status === "published") {
    await Course.findByIdAndUpdate(this.course_id, {
      $inc: { lesson_count: 1 },
      $push: { lessons: this._id }
    });
  }
});

// Middleware để cập nhật course khi lesson bị xóa
lessonSchema.post("remove", async function () {
  const Course = mongoose.model("Course");
  if (this.status === "published") {
    await Course.findByIdAndUpdate(this.course_id, {
      $inc: { lesson_count: -1 },
      $pull: { lessons: this._id }
    });
  }
});

module.exports = mongoose.model("Lesson", lessonSchema);
