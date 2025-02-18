const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const { registerSchema, loginSchema, emailSchema, resetPasswordSchema, otpSchema, resendOtpSchema, resetPasswordOtpSchema } = require('../validators/auth.validator');

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/register/mobile', validateRequest(registerSchema), AuthController.registerMobile);
router.post('/verify-otp', validateRequest(otpSchema), AuthController.verifyOTP);
router.post('/resend-otp', validateRequest(resendOtpSchema), AuthController.resendOTP);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/forgot-password', validateRequest(emailSchema), AuthController.forgotPassword);
router.post('/forgot-password/mobile', validateRequest(emailSchema), AuthController.forgotPasswordMobile);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post('/reset-password/otp', validateRequest(resetPasswordOtpSchema), AuthController.resetPasswordWithOTP);

module.exports = router; 