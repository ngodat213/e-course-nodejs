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

/**
 * @route POST /api/users/:id/follow
 * @desc Follow một người dùng
 * @access Private
 */
router.post("/:id/follow", (req, res, next) => {
  UserController.followUser(req, res, next);
});

/**
 * @route DELETE /api/users/:id/follow
 * @desc Unfollow một người dùng
 * @access Private
 */
router.delete("/:id/follow", (req, res, next) => {
  UserController.unfollowUser(req, res, next);
});

/**
 * @route GET /api/users/:id/followers
 * @desc Lấy danh sách người theo dõi
 * @access Private
 */
router.get("/:id/followers", (req, res, next) => {
  UserController.getFollowers(req, res, next);
});

/**
 * @route GET /api/users/teachers
 * @desc Lấy danh sách giảng viên
 * @access Public
 */
router.get("/teachers", (req, res, next) => {
  UserController.getTeachers(req, res, next);
});

/**
 * @route GET /api/users/teachers/:id
 * @desc Lấy thông tin chi tiết giảng viên
 * @access Public
 */
router.get("/teachers/:id", (req, res, next) => {
  UserController.getTeacherById(req, res, next);
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

/**
 * @route POST /api/users/streak/increment
 * @desc Tăng streak lên 1 khi user hoàn thành bài học trong ngày
 * @access Private
 */
router.post("/streak/increment", verifyToken, (req, res, next) => {
  UserController.updateStreak(req, res, next);
});

/**
 * @route POST /api/users/streak/reset
 * @desc Reset streak về 0 khi user bỏ lỡ ngày học
 * @access Private
 */
router.post("/streak/reset", verifyToken, (req, res, next) => {
  UserController.resetStreak(req, res, next);
});

/**
 * @route GET /api/users/streak
 * @desc Lấy thông tin streak hiện tại của user
 * @access Private
 */
router.get("/streak", verifyToken, (req, res, next) => {
  UserController.getStreak(req, res, next);
});

module.exports = router;
