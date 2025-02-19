const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { verifyToken, restrictTo } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const {
  updateUserSchema,
  changePasswordSchema,
  setRoleSchema,
} = require("../validators/user.validator");
const upload = require("../middleware/upload.middleware");

// Protected routes
router.use(verifyToken);

/**
 * @route GET /api/users/profile
 * @desc Lấy thông tin profile người dùng
 * @access Private
 */
router.get("/profile", (req, res, next) => {
  UserController.getProfile(req, res, next);
});

/**
 * @route PUT /api/users/profile
 * @desc Cập nhật thông tin profile
 * @access Private
 */
router.put("/profile", validateRequest(updateUserSchema), (req, res, next) => {
  UserController.updateProfile(req, res, next);
});

/**
 * @route PUT /api/users/change-password
 * @desc Đổi mật khẩu
 * @access Private
 * @validate {currentPassword, newPassword}
 */
router.put(
  "/change-password",
  validateRequest(changePasswordSchema),
  (req, res, next) => {
    UserController.changePassword(req, res, next);
  }
);

/**
 * @route POST /api/users/avatar
 * @desc Upload avatar
 * @access Private
 */
router.post("/avatar", upload.single("avatar"), (req, res, next) => {
  UserController.uploadAvatar(req, res, next);
});

// Admin only routes
router.use(restrictTo("admin", "super_admin"));
router.get("/admin/", (req, res, next) => {
  UserController.getAll(req, res, next);
});
router.get("/admin/:id", (req, res, next) => {
   UserController.getById(req, res, next);
});
router.put("/admin/:id", validateRequest(updateUserSchema), (req, res, next) => {
  UserController.update(req, res, next);
});
router.delete("/admin/:id", (req, res, next) => {
  UserController.delete(req, res, next);
});

/**
 * @route PUT /api/users/role
 * @desc Thay đổi role người dùng (Admin only)
 * @access Private (Admin)
 * @validate {userId, role}
 */
router.put("/role", restrictTo(["admin"]), (req, res, next) => {
  UserController.setUserRole(req, res, next);
});

module.exports = router;
