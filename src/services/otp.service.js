const crypto = require("crypto");
const User = require("../models/user.model");
const { BadRequestError } = require("../utils/errors");
const EmailTemplateService = require("./email_template.service");
const transporter = require("../config/mail.config");
const i18next = require("i18next");
const HashService = require("./hash.service");

class OTPService {
  // Tạo OTP 6 số
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Tạo thời gian hết hạn (5 phút)
  generateExpiry() {
    return new Date(Date.now() + process.env.OTP_EXPIRES * 60 * 1000);
  }

  // Lưu OTP vào database
  async saveOTP(userId, otp) {
    await User.findByIdAndUpdate(userId, {
      otp: await HashService.hashData(otp),
      otp_expires: this.generateExpiry(),
    });
  }

  // Xác thực OTP
  async verifyOTP(email, otp) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError(i18next.t("user.notFound"));
    }

    if (!user.otp || !user.otp_expires) {
      throw new BadRequestError(i18next.t("otp.notFound"));
    }

    if (user.otp_expires < new Date()) {
      throw new BadRequestError(i18next.t("otp.expired"));
    }

    const isPasswordMatch = await HashService.verifyData(otp, user.otp);
    if (!isPasswordMatch) {
      throw new BadRequestError(i18next.t("otp.invalid"));
    }

    // Xóa OTP sau khi xác thực thành công
    user.otp = undefined;
    user.otp_expires = undefined;
    await user.save();

    return true;
  }

  // Tạo và gửi OTP mới
  async generateAndSendOTP(user, type = "verification") {
    const otp = this.generateOTP();
    await this.saveOTP(user._id, otp);

    // Gửi OTP qua email
    const emailTemplate =
      type === "verification"
        ? EmailTemplateService.getVerificationOTPEmail(user, otp)
        : EmailTemplateService.getResetPasswordOTPEmail(user, otp);

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      ...emailTemplate,
    });

    return otp;
  }
}

module.exports = new OTPService();
