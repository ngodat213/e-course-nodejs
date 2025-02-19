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
      const result = await UserService.updateProfile(req.user._id, req.body);
      this.logInfo("Profile updated", { userId: req.user._id });
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
}

module.exports = new UserController();
