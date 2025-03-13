const mongoose = require("mongoose");
const Course = require("./course.model");

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    courses: [
      {
        course_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    payment_method: {
      type: String,
      enum: ["momo", "bank_transfer", "credit_card"],
      required: true,
    },
    payment_info: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    response: {
      type: String,
    },
    completed_at: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Middleware để tự động cập nhật completed_at khi status = paid
orderSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "paid" && !this.completed_at) {
    this.completed_at = new Date();
  }
  next();
});

orderSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.status === "paid") {
    try {
      await Course.updateMany(
        { _id: { $in: doc.courses.map(course => course.course_id) } }, 
        { $inc: { student_count: 1 } }
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật totalOrders:", error);
    }
  }
});

module.exports = mongoose.model("Order", orderSchema);
