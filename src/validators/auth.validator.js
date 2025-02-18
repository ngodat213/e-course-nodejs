const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(50)
});

const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
});

const emailSchema = Joi.object({
    email: Joi.string().required().email()
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().required().min(6).max(50)
});

const otpSchema = Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

const resendOtpSchema = Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('verification', 'reset').default('verification')
});

const resetPasswordOtpSchema = Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    newPassword: Joi.string().required().min(6).max(50)
});

module.exports = {
    registerSchema,
    loginSchema,
    emailSchema,
    resetPasswordSchema,
    otpSchema,
    resendOtpSchema,
    resetPasswordOtpSchema
}; 