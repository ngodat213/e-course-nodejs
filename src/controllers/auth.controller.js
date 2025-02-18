const BaseController = require('./base.controller');
const AuthService = require('../services/auth.service');
const UserService = require('../services/user.service');

class AuthController extends BaseController {
  constructor() {
    super();
  }

  async register(req, res, next) {
    try {
            const result = await AuthService.register(req.body);
            this.logInfo('User registered', { email: req.body.email });
            this.createdResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async registerMobile(req, res, next) {
        try {
            const result = await AuthService.registerMobile(req.body);
            this.logInfo('Mobile user registered', { email: req.body.email });
            res.success(result, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async verifyOTP(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await AuthService.verifyOTP(email, otp);
            this.logInfo('OTP verified', { email });
            res.success(result, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async resendOTP(req, res, next) {
        try {
            const { userId, type } = req.body;
            const result = await AuthService.resendOTP(userId, type);
            this.logInfo('OTP resent', { userId });
            res.success(result, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            this.logInfo('User logged in', { email });
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const result = await AuthService.verifyEmail(req.params.token);
            this.logInfo('Email verified', { token: req.params.token });
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const result = await AuthService.forgotPassword(req.body.email);
            this.logInfo('Password reset requested', { email: req.body.email });
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async forgotPasswordMobile(req, res, next) {
        try {
            const result = await AuthService.forgotPasswordMobile(req.body.email);
            this.logInfo('Forgot password mobile initiated', { email: req.body.email });
            res.success(result, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const result = await AuthService.resetPassword(
                req.params.token,
                req.body.password
            );
            this.logInfo('Password reset completed', { token: req.params.token });
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async resetPasswordWithOTP(req, res, next) {
        try {
            const { userId, otp, newPassword } = req.body;
            const result = await AuthService.resetPasswordWithOTP(userId, otp, newPassword);
            this.logInfo('Password reset with OTP completed', { userId });
            res.success(result, result.message);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const { refresh_token } = req.body;
            const result = await AuthService.refreshToken(refresh_token);
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async logout(req, res, next) {
        try {
            const { refresh_token } = req.body;
            const result = await AuthService.logout(refresh_token);
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

module.exports = new AuthController(); 