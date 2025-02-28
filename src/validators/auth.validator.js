const Joi = require("joi");

const registerSchema = Joi.object({
  first_name: Joi.string()
    .required()
    .min(2)
    .max(50)
    .messages({
      'any.required': 'Vui lòng nhập họ',
      'string.empty': 'Họ không được để trống',
      'string.min': 'Họ phải có ít nhất {#limit} ký tự',
      'string.max': 'Họ không được vượt quá {#limit} ký tự',
      'string.base': 'Họ phải là chuỗi ký tự'
    }),

  last_name: Joi.string()
    .required()
    .min(2)
    .max(50)
    .messages({
      'any.required': 'Vui lòng nhập tên',
      'string.empty': 'Tên không được để trống', 
      'string.min': 'Tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên không được vượt quá {#limit} ký tự',
      'string.base': 'Tên phải là chuỗi ký tự'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'Vui lòng nhập email',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'string.base': 'Email phải là chuỗi ký tự'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'any.required': 'Vui lòng nhập mật khẩu',
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'string.base': 'Mật khẩu phải là chuỗi ký tự'
    }),

  role: Joi.string()
    .valid('student', 'instructor')
    .default('student')
    .messages({
      'any.only': 'Vai trò phải là student hoặc instructor',
      'string.base': 'Vai trò không hợp lệ'
    })
});

const registerAdminSchema = Joi.object({
  first_name: Joi.string().required().min(2).max(50),
  last_name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  dev_secret_key: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'Vui lòng nhập email',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'string.base': 'Email phải là chuỗi ký tự'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Vui lòng nhập mật khẩu',
      'string.empty': 'Mật khẩu không được để trống',
      'string.base': 'Mật khẩu phải là chuỗi ký tự'
    })
});

const emailSchema = Joi.object({
  email: Joi.string().required().email(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token không được để trống',
      'string.empty': 'Token không được để trống',
      'string.base': 'Token không hợp lệ'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'any.required': 'Vui lòng nhập mật khẩu mới',
      'string.empty': 'Mật khẩu mới không được để trống',
      'string.min': 'Mật khẩu mới phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'string.base': 'Mật khẩu mới phải là chuỗi ký tự'
    })
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

const changePasswordSchema = Joi.object({
  current_password: Joi.string()
    .required()
    .messages({
      'any.required': 'Vui lòng nhập mật khẩu hiện tại',
      'string.empty': 'Mật khẩu hiện tại không được để trống',
      'string.base': 'Mật khẩu hiện tại phải là chuỗi ký tự'
    }),

  new_password: Joi.string()
    .min(6)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'any.required': 'Vui lòng nhập mật khẩu mới',
      'string.empty': 'Mật khẩu mới không được để trống',
      'string.min': 'Mật khẩu mới phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'string.base': 'Mật khẩu mới phải là chuỗi ký tự'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'Vui lòng nhập email',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'string.base': 'Email phải là chuỗi ký tự'
    })
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
  changePasswordSchema,
  forgotPasswordSchema
};
