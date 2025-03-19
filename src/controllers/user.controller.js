const BaseController = require("./base.controller");
const UserService = require("../services/user.service");
const FileService = require("../services/file.service");
const { BadRequestError } = require("../utils/errors");
const i18next = require("i18next");

class UserController extends BaseController {
  constructor() {
    super();
  }

  async getAll(req, res, next) {
    try {
      const users = await UserService.getAllUsers(req.query);
      this.successResponse(res, users);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await UserService.getUserInfo(req.params.id);
      this.successResponse(res, user);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async delete(req, res, next) {
    try {
      const user = await UserService.deleteUser(req.params.id);
      this.successResponse(res, user);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async create(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      this.successResponse(res, user);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async update(req, res, next) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      this.successResponse(res, user);
    } catch (error) {
      this.handleError(error, next);
    }
  }
  async getProfile(req, res, next) {
    try {
      const user = await UserService.getUserInfo(req.user.id);
      this.successResponse(res, user);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = await UserService.updateProfile(req.user.id, req.body);
      this.logInfo("Profile updated", { userId: req.user.id });
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await UserService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      this.logInfo("Password changed", { userId: req.user._id });
      res.success(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw new BadRequestError(i18next.t("upload.noFile"));
      }

      const result = await FileService.uploadFile(req.file, {
        owner_id: req.user.id,
        owner_type: "User",
        purpose: "avatar",
        file_type: "image",
      });

      // Cập nhật profile_picture trong user
      await UserService.update(req.user.id, {
        profile_picture: result._id,
      });

      this.successResponse(res, {
        message: i18next.t("upload.success"),
        file: result,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async setUserRole(req, res, next) {
    try {
      const { userId, role } = req.body;
      const result = await UserService.setRole(userId, role);
      this.logInfo("User role updated", { userId, newRole: role });
      res.success(result);
    } catch (error) {
      next(error);
    }
  }

  async followUser(req, res, next) {
    try {
      const result = await UserService.followUser(req.params.id, req.user._id);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      const result = await UserService.unfollowUser(req.params.id, req.user._id);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getFollowers(req, res, next) {
    try {
      const result = await UserService.getFollowers(req.params.id);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getTeachers(req, res, next) {
    try {
      const result = await UserService.getTeachers(req.query);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getTeacherById(req, res, next) {
    try {
      const result = await UserService.getTeacherById(req.params.id);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateStreak(req, res, next) {
    try {
      const result = await UserService.updateStreak(req.user.id);
      this.successResponse(res, {
        message: i18next.t("user.streakUpdated"),
        ...result
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async resetStreak(req, res, next) {
    try {
      const result = await UserService.resetStreak(req.user.id);
      this.successResponse(res, {
        message: i18next.t("user.streakReset"),
        ...result
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getStreak(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.id);
      this.successResponse(res, {
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        last_streak_date: user.last_streak_date
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new UserController();
