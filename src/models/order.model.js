const mongoose = require("mongoose");
const Course = require("./course.model");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courses: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Course",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

orderSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.status === "paid") {
    try {
      await Course.updateMany(
        { _id: { $in: doc.courses } }, 
        { $inc: { student_count: 1 } }
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật totalOrders:", error);
    }
  }
});

module.exports = mongoose.model("Order", orderSchema);
