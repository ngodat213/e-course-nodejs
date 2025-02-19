const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validate.middleware");
const {
  registerSchema,
  loginSchema,
  emailSchema,
  resetPasswordSchema,
  otpSchema,
  resendOtpSchema,
  resetPasswordOtpSchema,
  refreshTokenSchema,
} = require("../validators/auth.validator");

/**
 * @route POST /api/auth/register
 * @desc Đăng ký tài khoản mới thông qua email
 * @access Public
 * @validate {name, email, password}
 */
router.post("/register", validateRequest(registerSchema), (req, res, next) => {
  AuthController.register(req, res, next);
});

/**
 * @route POST /api/auth/register/mobile
 * @desc Đăng ký tài khoản qua mobile (gửi OTP)
 * @access Public
 * @validate {name, email, password}
 */
router.post(
  "/register/mobile",
  validateRequest(registerSchema),
  (req, res, next) => {
    AuthController.registerMobile(req, res, next);
  }
);

/**
 * @route POST /api/auth/verify-otp
 * @desc Xác thực OTP cho đăng ký mobile
 * @access Public
 * @validate {email, otp}
 */
router.post("/verify-otp", validateRequest(otpSchema), (req, res, next) => {
  AuthController.verifyOTP(req, res, next);
});

/**
 * @route POST /api/auth/resend-otp
 * @desc Gửi lại mã OTP
 * @access Public
 * @validate {email}
 */
router.post(
  "/resend-otp",
  validateRequest(resendOtpSchema),
  (req, res, next) => {
    AuthController.resendOTP(req, res, next);
  }
);

/**
 * @route POST /api/auth/login
 * @desc Đăng nhập
 * @access Public
 * @validate {email, password}
 * @returns {token, user}
 */
router.post("/login", validateRequest(loginSchema), (req, res, next) => {
  AuthController.login(req, res, next);
});

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Xác thực email sau khi đăng ký
 * @access Public
 * @param {string} token - Token xác thực email
 */
router.get("/verify-email/:token", (req, res, next) => {
  AuthController.verifyEmail(req, res, next);
});

/**
 * @route POST /api/auth/forgot-password
 * @desc Yêu cầu đặt lại mật khẩu qua email
 * @access Public
 * @validate {email}
 */
router.post(
  "/forgot-password",
  validateRequest(emailSchema),
  (req, res, next) => {
    AuthController.forgotPassword(req, res, next);
  }
);

/**
 * @route POST /api/auth/forgot-password/mobile
 * @desc Yêu cầu đặt lại mật khẩu qua mobile (OTP)
 * @access Public
 * @validate {email}
 */
router.post(
  "/forgot-password/mobile",
  validateRequest(emailSchema),
  (req, res, next) => {
    AuthController.forgotPasswordMobile(req, res, next);
  }
);

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Đặt lại mật khẩu với token
 * @access Public
 * @param {string} token - Token reset password
 * @validate {password}
 */
router.post(
  "/reset-password/:token",
  validateRequest(resetPasswordSchema),
  (req, res, next) => {
    AuthController.resetPassword(req, res, next);
  }
);

/**
 * @route POST /api/auth/reset-password/otp
 * @desc Đặt lại mật khẩu với OTP (mobile)
 * @access Public
 * @validate {email, otp, newPassword}
 */
router.post(
  "/reset-password/otp",
  validateRequest(resetPasswordOtpSchema),
  (req, res, next) => {
    AuthController.resetPasswordWithOTP(req, res, next);
  }
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh token
 * @access Public
 * @validate {refresh_token}
 */
router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  (req, res, next) => {
    AuthController.refreshToken(req, res, next);
  }
);

/**
 * @route POST /api/auth/logout
 * @desc Logout
 * @access Public
 * @validate {refresh_token}
 */
router.post(
  "/logout",
  validateRequest(refreshTokenSchema),
  (req, res, next) => {
    AuthController.logout(req, res, next);
  }
);

module.exports = router;
