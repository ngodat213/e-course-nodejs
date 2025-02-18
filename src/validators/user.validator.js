const Joi = require('joi');

const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    profile_picture: Joi.string().uri().allow(null),
    role: Joi.string().valid('student', 'instructor', 'admin'),
    status: Joi.string().valid('pending', 'active', 'blocked')
}).min(1); // Yêu cầu ít nhất 1 trường được cập nhật

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(50)
        .not(Joi.ref('currentPassword'))
        .messages({
            'any.only': 'Mật khẩu mới phải khác mật khẩu hiện tại'
        })
});

const setRoleSchema = Joi.object({
    userId: Joi.string().required(),
    role: Joi.string().valid('student', 'instructor', 'admin').required()
});

module.exports = {
    updateUserSchema,
    changePasswordSchema,
    setRoleSchema
}; 