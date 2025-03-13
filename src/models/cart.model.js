const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [
      {
        course_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        added_at: {
          type: Date,
          default: Date.now
        }
      }
    ],
    total_items: {
      type: Number,
      default: 0
    },
    total_amount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Middleware để tự động cập nhật total_items và total_amount
cartSchema.pre("save", function(next) {
  if (this.isModified("items")) {
    this.total_items = this.items.length;
    this.total_amount = this.items.reduce((total, item) => total + item.price, 0);
  }
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
