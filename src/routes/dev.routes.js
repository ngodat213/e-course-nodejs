const express = require("express");
const router = express.Router();
const { validateRequest } = require("../middleware/validate.middleware");
const { registerAdminSchema } = require("../validators/auth.validator");
const DevController = require("../controllers/dev.controller");

/**
 * @route ALL /api/dev/*
 * @desc Middleware kiểm tra môi trường development
 * @access Development only
 */
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ message: "Route not found" });
  }
  next();
});

/**
 * @route POST /api/dev/register-admin
 * @desc Đăng ký tài khoản admin (chỉ trong development)
 * @access Development only
 * @validate {name, email, password, dev_secret_key}
 */
router.post(
  "/register-admin",
  validateRequest(registerAdminSchema),
  (req, res, next) => {
    DevController.registerAdmin(req, res, next);
  }
);

/**
 * @route GET /api/dev/users
 * @desc Lấy danh sách tất cả users (chỉ trong development)
 * @access Development only
 * @query {dev_secret_key, page, limit, sort, search}
 */
router.get("/users", (req, res, next) => {
  DevController.getAllUsers(req, res, next);
});

module.exports = router;
