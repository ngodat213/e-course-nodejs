const UserService = require("../services/user.service");
const { success } = require("../utils/logger");

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = req.user;
      res.success(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const result = await UserService.updateProfile(userId, req.body);
      success.info("Profile updated", { userId });
      res.success(result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user._id;
      const { currentPassword, newPassword } = req.body;
      await UserService.changePassword(userId, currentPassword, newPassword);
      success.info("Password changed", { userId });
      res.success({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
      next(error);
    }
  }

  // Admin only controllers
  async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers(req.query);
      res.success(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.success(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const result = await UserService.updateUser(req.params.id, req.body);
      success.info("User updated by admin", {
        adminId: req.user._id,
        userId: req.params.id,
      });
      res.success(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await UserService.deleteUser(req.params.id);
      success.info("User deleted by admin", {
        adminId: req.user._id,
        userId: req.params.id,
      });
      res.success({ message: "Xóa người dùng thành công" });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const result = await UserService.uploadAvatar(req.user._id, req.file);
      res.success(result);
    } catch (error) {
      next(error);
    }
  }

  async setUserRole(req, res, next) {
    try {
      const { userId, role } = req.body;
      const result = await UserService.setUserRole(userId, role, req.user);
      success.info("User role updated", {
        adminId: req.user._id,
        userId,
        newRole: role,
      });
      res.success(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserInfo(req, res, next) {
    try {
      const result = await UserService.getUserInfo(req.user._id);
      res.success(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
