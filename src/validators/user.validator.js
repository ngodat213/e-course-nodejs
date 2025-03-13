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

const updateProfileSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Họ phải có ít nhất {#limit} ký tự',
      'string.max': 'Họ không được vượt quá {#limit} ký tự',
      'string.base': 'Họ phải là chuỗi ký tự'
    }),

  last_name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên không được vượt quá {#limit} ký tự',
      'string.base': 'Tên phải là chuỗi ký tự'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại phải có 10 chữ số',
      'string.base': 'Số điện thoại không hợp lệ'
    }),

  bio: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Giới thiệu không được vượt quá {#limit} ký tự',
      'string.base': 'Giới thiệu phải là chuỗi ký tự'
    }),

  address: Joi.string()
    .max(200)
    .messages({
      'string.max': 'Địa chỉ không được vượt quá {#limit} ký tự',
      'string.base': 'Địa chỉ phải là chuỗi ký tự'
    })
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một thông tin để cập nhật'
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'inactive', 'banned')
    .required()
    .messages({
      'any.required': 'Vui lòng chọn trạng thái',
      'string.empty': 'Trạng thái không được để trống',
      'any.only': 'Trạng thái phải là active, inactive hoặc banned',
      'string.base': 'Trạng thái không hợp lệ'
    }),

  reason: Joi.string()
    .when('status', {
      is: 'banned',
      then: Joi.string().required().min(10).max(500),
      otherwise: Joi.string().allow('')
    })
    .messages({
      'any.required': 'Vui lòng nhập lý do khi cấm người dùng',
      'string.empty': 'Lý do không được để trống khi cấm người dùng',
      'string.min': 'Lý do phải có ít nhất {#limit} ký tự',
      'string.max': 'Lý do không được vượt quá {#limit} ký tự'
    })
});

module.exports = {
    updateUserSchema,
    changePasswordSchema,
    setRoleSchema,
    updateProfileSchema,
    updateStatusSchema
}; 