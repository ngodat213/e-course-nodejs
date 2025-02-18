const AuthService = require('../services/auth.service');
const { success } = require('../utils/logger');

class AuthController {
    async register(req, res, next) {
        try {
            const result = await AuthService.register(req.body);
            success.info('Registration request processed', { email: req.body.email });
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const result = await AuthService.verifyEmail(req.params.token);
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const result = await AuthService.forgotPassword(req.body.email);
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const result = await AuthService.resetPassword(
                req.params.token,
                req.body.password
            );
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async registerMobile(req, res, next) {
        try {
            const result = await AuthService.registerMobile(req.body);
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyOTP(req, res, next) {
        try {
            const { userId, otp } = req.body;
            const result = await AuthService.verifyOTP(userId, otp);
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async resendOTP(req, res, next) {
        try {
            const { userId, type } = req.body;
            const result = await AuthService.resendOTP(userId, type);
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async forgotPasswordMobile(req, res, next) {
        try {
            const result = await AuthService.forgotPasswordMobile(req.body.email);
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async resetPasswordWithOTP(req, res, next) {
        try {
            const { userId, otp, newPassword } = req.body;
            const result = await AuthService.resetPasswordWithOTP(
                userId,
                otp,
                newPassword
            );
            res.success(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController(); 