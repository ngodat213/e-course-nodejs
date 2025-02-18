const BaseController = require('./base.controller');
const UserService = require('../services/user.service');

class UserController extends BaseController {
    constructor() {
        super();
    }

    async getProfile(req, res, next) {
        try {
            const user = await UserService.getUserInfo(req.user._id);
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
                req.user._id,
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
            const result = await UserService.updateAvatar(req.user._id, req.file);
            this.logInfo("Avatar uploaded", { userId: req.user._id });
            res.success(result);
        } catch (error) {
            next(error);
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
