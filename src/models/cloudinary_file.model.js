const mongoose = require("mongoose");

const cloudinaryFileSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "owner_type",
    },
    owner_type: {
      type: String,
      required: true,
      enum: ["User", "Course", "Exam", "Lesson"],
    },
    file_type: {
      type: String,
      required: true,
      enum: ["image", "video", "document"],
    },
    file_url: {
      type: String,
      required: true,
      select: false,
    },
    public_id: {
      type: String,
      required: true,
      unique: true,
    },
    format: {
      type: String,
      required: false,
    },
    metadata: {
      width: Number,
      height: Number,
      duration: Number,
      pages: Number,
    },
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CloudinaryFile", cloudinaryFileSchema);
