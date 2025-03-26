require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database.config");
const i18next = require("./config/i18n");
const errorMiddleware = require("./middleware/error.middleware");
const responseEnhancer = require("./utils/response.helper");
const { info, error, debug } = require("./utils/logger");
const http = require('http');

// Khởi tạo express app trước
const app = express();

// Kết nối database
connectDB();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseEnhancer);

// i18n middleware
app.use((req, res, next) => {
  const lng = req.headers["accept-language"] || req.query.lng || "en";
  req.language = lng;
  i18next.changeLanguage(lng);
  next();
});

// Response handler
app.response.success = function (data) {
  return this.status(200).json({
    success: true,
    data,
  });
};

// Routes
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const userRoutes = require("./routes/user.routes");
const momoRoutes = require("./routes/momo.routes");
const orderRoutes = require("./routes/order.routes");
const lessonRoutes = require("./routes/lesson.routes");
const deleteRequestRoutes = require("./routes/delete_request.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const userProgressRoutes = require('./routes/user_progress.routes');
const lessonContentRoutes = require('./routes/lesson_content.routes');
const examRoutes = require('./routes/exam.routes');
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/momo", momoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/lesson-contents", lessonContentRoutes);
app.use("/api/delete-requests", deleteRequestRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/progress', userProgressRoutes);

// Swagger UI setup
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css";
// Swagger UI middleware
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCssUrl: CSS_URL,
    customSiteTitle: "E-Course API Documentation",
  })
);

// Dev routes
if (process.env.NODE_ENV === "development") {
  const devRoutes = require("./routes/dev.routes");
  app.use("/api/dev", devRoutes);
  debug("Development routes enabled");
}

debug("Swagger documentation enabled");

// Error handling
app.use(errorMiddleware);

// Tạo HTTP server sau khi đã có app
const server = http.createServer(app);

// Khởi động server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  info(`Server is running on port ${PORT}`);
  info(`Environment: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === "development") {
    info(`API Documentation: http://localhost:${PORT}/api-docs`);
  }
});

// Initialize WebSocket
const initializeWebSocket = require('./websocket');
initializeWebSocket(server);

// Xử lý lỗi không được bắt
process.on("unhandledRejection", (err) => {
  error("Unhandled Rejection:", err);
  // Đóng server một cách an toàn
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  error("Uncaught Exception:", err);
  // Đóng server một cách an toàn
  process.exit(1);
});
