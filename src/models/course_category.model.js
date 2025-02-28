const mongoose = require("mongoose");

const courseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudinaryFile",
      default: null,
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }],
    course_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index để sắp xếp theo order
courseCategorySchema.index({ order: 1 });

// Middleware để tự động cập nhật course_count
courseCategorySchema.pre('save', function(next) {
  if (this.isModified('courses')) {
    this.course_count = this.courses.length;
  }
  next();
});

// Method để thêm course vào category
courseCategorySchema.methods.addCourse = async function(courseId) {
  if (!this.courses.includes(courseId)) {
    this.courses.push(courseId);
    await this.save();
  }
  return this;
};

// Method để xóa course khỏi category
courseCategorySchema.methods.removeCourse = async function(courseId) {
  this.courses = this.courses.filter(id => id.toString() !== courseId.toString());
  await this.save();
  return this;
};

module.exports = mongoose.model("CourseCategory", courseCategorySchema); 