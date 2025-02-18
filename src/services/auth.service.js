const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const transporter = require('../config/mail.config');
const EmailTemplateService = require('./email_template.service');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const { success } = require('../utils/logger');
const i18next = require('i18next');
const OTPService = require('./otp.service');

class AuthService {
    async register(userData) {
        const { email } = userData;

        // Chỉ kiểm tra user đã active
        const existingUser = await User.findOne({ 
            email,
            status: 'active'
        });

        if (existingUser) {
            throw new BadRequestError(i18next.t('auth.emailExists'));
        }

        // Xóa user cũ nếu đang pending
        await User.deleteOne({ 
            email,
            status: 'pending'
        });

        // Tạo verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 giờ

        // Tạo user mới với default avatar
        const user = await User.create({
            ...userData,
            profile_picture: process.env.DEFAULT_AVATAR_URL,
            verification_token: verificationToken,
            verification_token_expires: verificationTokenExpires
        });

        // Gửi email xác nhận
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const emailTemplate = EmailTemplateService.getVerificationEmail(user, verificationUrl);

        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: user.email,
            ...emailTemplate
        });

        success.info('User registered successfully', { userId: user._id });

        return { message: i18next.t('auth.registerSuccess') };
    }

    async verifyEmail(token) {
        const user = await User.findOne({
            verification_token: token,
            verification_token_expires: { $gt: Date.now() }
        });

        if (!user) {
            throw new BadRequestError(i18next.t('auth.invalidToken'));
        }

        user.status = 'active';
        user.verification_token = undefined;
        user.verification_token_expires = undefined;
        await user.save();

        success.info('Email verified successfully', { userId: user._id });

        return { message: i18next.t('auth.emailVerified') };
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new UnauthorizedError(i18next.t('auth.invalidCredentials'));
        }

        if (user.status !== 'active') {
            throw new UnauthorizedError(i18next.t('auth.accountInactive'));
        }

        // Cập nhật last_login
        user.last_login = new Date();
        await user.save();

        // Tạo JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        success.info('User logged in successfully', { userId: user._id });

        return { token, user: this._sanitizeUser(user) };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new BadRequestError('Email không tồn tại');
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

        user.reset_password_token = resetToken;
        user.reset_password_expires = resetTokenExpires;
        await user.save();

        // Gửi email reset password
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const emailTemplate = EmailTemplateService.getResetPasswordEmail(user, resetUrl);

        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: user.email,
            ...emailTemplate
        });

        success.info('Reset password email sent', { userId: user._id });

        return { message: 'Email đặt lại mật khẩu đã được gửi' };
    }

    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            reset_password_token: token,
            reset_password_expires: { $gt: Date.now() }
        });

        if (!user) {
            throw new BadRequestError('Token không hợp lệ hoặc đã hết hạn');
        }

        user.password = newPassword;
        user.reset_password_token = undefined;
        user.reset_password_expires = undefined;
        await user.save();

        success.info('Password reset successfully', { userId: user._id });

        return { message: 'Đặt lại mật khẩu thành công' };
    }

    _sanitizeUser(user) {
        const { password, ...sanitizedUser } = user.toObject();
        return sanitizedUser;
    }

    async registerMobile(userData) {
        const { email } = userData;

        // Chỉ kiểm tra user đã active
        const existingUser = await User.findOne({ 
            email,
            status: 'active'
        });

        if (existingUser) {
            throw new BadRequestError(i18next.t('auth.emailExists'));
        }

        // Xóa user cũ nếu đang pending
        await User.deleteOne({ 
            email,
            status: 'pending'
        });

        const user = await User.create({
            ...userData,
            profile_picture: process.env.DEFAULT_AVATAR_URL,
            status: 'pending'
        });

        // Tạo và gửi OTP
        await OTPService.generateAndSendOTP(user, 'verification');

        success.info('Mobile user registered', { userId: user._id });

        return { 
            message: i18next.t('auth.otpSent'),
            userId: user._id 
        };
    }

    async verifyOTP(userId, otp) {
        await OTPService.verifyOTP(userId, otp);

        const user = await User.findById(userId);
        user.status = 'active';
        await user.save();

        success.info('OTP verified successfully', { userId });

        // Tạo JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return { 
            message: i18next.t('auth.verified'),
            token,
            user: this._sanitizeUser(user)
        };
    }

    async resendOTP(userId, type = 'verification') {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        await OTPService.generateAndSendOTP(user, type);

        return { message: i18next.t('auth.otpResent') };
    }

    async forgotPasswordMobile(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new BadRequestError(i18next.t('auth.emailNotFound'));
        }

        await OTPService.generateAndSendOTP(user, 'reset');

        return { 
            message: i18next.t('auth.otpSent'),
            userId: user._id 
        };
    }

    async resetPasswordWithOTP(userId, otp, newPassword) {
        await OTPService.verifyOTP(userId, otp);

        const user = await User.findById(userId);
        user.password = newPassword;
        await user.save();

        success.info('Password reset with OTP', { userId });

        return { message: i18next.t('auth.passwordReset') };
    }
}

module.exports = new AuthService(); 