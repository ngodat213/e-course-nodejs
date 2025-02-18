const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
});

const registerAdminSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  dev_secret_key: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

const emailSchema = Joi.object({
  email: Joi.string().required().email(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().min(6).max(50),
});

const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
});

const resendOtpSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid("verification", "reset").default("verification"),
});

const resetPasswordOtpSchema = Joi.object({
  userId: Joi.string().required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
  newPassword: Joi.string().required().min(6).max(50),
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required()
});

module.exports = {
  registerSchema,
  registerAdminSchema,
  loginSchema,
  emailSchema,
  resetPasswordSchema,
  otpSchema,
  resendOtpSchema,
  resetPasswordOtpSchema,
  refreshTokenSchema,
};
