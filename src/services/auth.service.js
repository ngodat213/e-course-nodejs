const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const transporter = require("../config/mail.config");
const EmailTemplateService = require("./email_template.service");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const { success } = require("../utils/logger");
const i18next = require("i18next");
const OTPService = require("./otp.service");
const TokenService = require("./token.service");

class AuthService {
  async register(userData) {
    const { email } = userData;

    const existingUser = await User.findOne({
      email,
      status: "active",
    });

    if (existingUser) {
      throw new BadRequestError(i18next.t("auth.emailExists"));
    }

    // Xóa user cũ nếu đang pending
    await User.deleteOne({
      email,
      status: "pending",
    });

    // Tạo verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(
      Date.now() + process.env.OTP_EXPIRES * 60 * 1000
    ); // 48 giờ

    // Tạo user mới với default avatar
    const user = await User.create({
      ...userData,
      profile_picture: process.env.DEFAULT_AVATAR_URL,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
    });

    // Gửi email xác nhận
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const emailTemplate = EmailTemplateService.getVerificationEmail(
      user,
      verificationUrl
    );

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      ...emailTemplate,
    });

    success.info("User registered successfully", { userId: user._id });

    return { message: i18next.t("auth.registerSuccess") };
  }

  async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      user.status = "active";
      user.email_verified = true;
      await user.save();

      return { message: i18next.t("auth.verified") };
    } catch (error) {
      throw new BadRequestError(i18next.t("auth.invalidToken"));
    }
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError(i18next.t("auth.invalidCredentials"));
    }

    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = await TokenService.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(refreshToken) {
    await TokenService.revokeRefreshToken(refreshToken);
    return { message: i18next.t("auth.logoutSuccess") };
  }

  async refreshToken(refreshToken) {
    return await TokenService.refreshAccessToken(refreshToken);
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError(i18next.t("auth.emailNotFound"));
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(
      Date.now() + process.env.OTP_EXPIRES * 60 * 1000
    ); // 5 phút

    // Lưu token vào database
    user.reset_password_token = resetToken;
    user.reset_password_expires = resetTokenExpires;
    await user.save();

    // Gửi email reset password
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailTemplate = EmailTemplateService.getResetPasswordEmail(
      user,
      resetUrl
    );

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      ...emailTemplate,
    });

    return { message: i18next.t("auth.resetEmailSent") };
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError(i18next.t("auth.invalidToken"));
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    // Vô hiệu hóa tất cả refresh tokens
    await TokenService.revokeAllUserTokens(user._id);

    return { message: i18next.t("auth.passwordReset") };
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
      status: "active",
    });

    if (existingUser) {
      throw new BadRequestError(i18next.t("auth.emailExists"));
    }

    // Xóa user cũ nếu đang pending
    await User.deleteOne({
      email,
      status: "pending",
    });

    const user = await User.create({
      ...userData,
      profile_picture: process.env.DEFAULT_AVATAR_URL,
      status: "pending",
    });

    // Tạo và gửi OTP
    await OTPService.generateAndSendOTP(user, "verification");

    success.info("Mobile user registered", { userId: user._id });

    return {
      message: i18next.t("auth.otpSent"),
      userId: user._id,
    };
  }

  async verifyOTP(email, otp) {
    await OTPService.verifyOTP(email, otp);

    const user = await User.findOne({ email });
    user.status = "active";
    await user.save();

    success.info("OTP verified successfully", { email });

    return {
      message: i18next.t("auth.verified"),
    };
  }

  async resendOTP(userId, type = "verification") {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    await OTPService.generateAndSendOTP(user, type);

    return { message: i18next.t("auth.otpResent") };
  }

  async forgotPasswordMobile(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError(i18next.t("errors:auth.emailNotFound"));
    }

    await OTPService.generateAndSendOTP(user, "reset");

    return {
      message: i18next.t("common:auth.otpSent"),
      userId: user.email,
    };
  }

  async resetPasswordWithOTP(userId, otp, newPassword) {
    await OTPService.verifyOTP(userId, otp);

    const user = await User.findById(userId);
    user.password = newPassword;
    await user.save();

    return { message: i18next.t("auth.passwordResetOtpSuccess") };
  }
}

module.exports = new AuthService();
