const mongoose = require("mongoose");
const { info, error } = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    info("Connected to MongoDB");
  } catch (err) {
    error("MongoDB connection error:", err);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  info("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    info.info("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

module.exports = connectDB;
