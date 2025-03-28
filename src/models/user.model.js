const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers_count: {
      type: Number,
      default: 0,
    },
    working_at: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    about: {
      type: String,
      default: null,
    },
    level: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profile_picture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudinaryFile",
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin", "super_admin"],
      default: "student",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
    fcm_tokens: [{
      token: {
        type: String,
        required: true
      },
      device_info: {
        type: String,
        default: null
      },
      last_used: {
        type: Date,
        default: Date.now
      }
    }],
    verification_token: String,
    verification_token_expires: Date,
    otp: String,
    otp_expires: Date,
    reminder_sent: Boolean,
    reset_password_token: String,
    reset_password_expires: Date,
    last_login: Date,
    certificate_count: {
      type: Number,
      default: 0,
    },
    enrolled_courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      }
    ],
    teaching_courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
        default: [],
      },
    ],
    unread_notifications: {
      type: Number,
      default: 0,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    current_streak: {
      type: Number,
      default: 0
    },
    longest_streak: {
      type: Number,
      default: 0
    },
    last_streak_date: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method kiểm tra password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
