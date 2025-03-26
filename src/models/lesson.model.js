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
    order: {
      type: Number,
      default: 0,
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

// Middleware để tự động set order trước khi lưu
lessonSchema.pre('save', async function(next) {
  if (this.isNew) { // Chỉ thực hiện khi tạo mới lesson
    try {
      const lastLesson = await this.constructor.findOne(
        { course_id: this.course_id },
        { order: 1 },
        { sort: { order: -1 } }
      );
      
      this.order = lastLesson ? lastLesson.order + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Thêm method để cập nhật thứ tự các lesson
lessonSchema.statics.reorderLessons = async function(courseId, lessonId, newOrder) {
  const lessons = await this.find({ course_id: courseId }).sort({ order: 1 });
  const lesson = lessons.find(l => l._id.toString() === lessonId);
  const oldOrder = lesson.order;

  if (newOrder === oldOrder) return;

  if (newOrder > oldOrder) {
    // Di chuyển xuống
    await this.updateMany(
      { 
        course_id: courseId,
        order: { $gt: oldOrder, $lte: newOrder }
      },
      { $inc: { order: -1 } }
    );
  } else {
    // Di chuyển lên
    await this.updateMany(
      {
        course_id: courseId,
        order: { $gte: newOrder, $lt: oldOrder }
      },
      { $inc: { order: 1 } }
    );
  }

  lesson.order = newOrder;
  await lesson.save();
};

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
