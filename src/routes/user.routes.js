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
router.get("/profile", UserController.getProfile);

/**
 * @route PUT /api/users/profile
 * @desc Cập nhật thông tin profile
 * @access Private
 */
router.put(
  "/profile",
  validateRequest(updateUserSchema),
  UserController.updateProfile
);

/**
 * @route PUT /api/users/change-password
 * @desc Đổi mật khẩu
 * @access Private
 * @validate {currentPassword, newPassword}
 */
router.put(
  "/change-password",
  validateRequest(changePasswordSchema),
  UserController.changePassword
);

/**
 * @route POST /api/users/avatar
 * @desc Upload avatar
 * @access Private
 */
router.post("/avatar", upload.single("avatar"), UserController.uploadAvatar);

// Admin only routes
router.use(restrictTo("admin", "super_admin"));
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.put(
  "/:id",
  validateRequest(updateUserSchema),
  UserController.updateUser
);
router.delete("/:id", UserController.deleteUser);

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
