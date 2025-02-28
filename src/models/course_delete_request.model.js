const mongoose = require("mongoose");

const courseDeleteRequestSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      minlength: 10,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    admin_response: {
      admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      message: String,
      action_date: Date,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Không cho tạo nhiều request cho cùng một khóa học
courseDeleteRequestSchema.index({ course_id: 1, status: 1 }, { unique: true });

module.exports = mongoose.model(
  "CourseDeleteRequest",
  courseDeleteRequestSchema
);
