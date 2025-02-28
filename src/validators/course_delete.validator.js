const Joi = require('joi');

const createDeleteRequestSchema = Joi.object({
  reason: Joi.string()
    .required()
    .min(10)
    .max(500)
    .messages({
      'any.required': 'Vui lòng nhập lý do xóa khóa học',
      'string.empty': 'Lý do không được để trống',
      'string.min': 'Lý do phải có ít nhất {#limit} ký tự',
      'string.max': 'Lý do không được vượt quá {#limit} ký tự',
      'string.base': 'Lý do phải là chuỗi ký tự'
    })
});

const handleDeleteRequestSchema = Joi.object({
  status: Joi.string()
    .valid('approved', 'rejected')
    .required()
    .messages({
      'any.required': 'Vui lòng chọn trạng thái',
      'string.empty': 'Trạng thái không được để trống',
      'any.only': 'Trạng thái phải là approved hoặc rejected',
      'string.base': 'Trạng thái không hợp lệ'
    }),

  message: Joi.string()
    .required()
    .min(10)
    .max(500)
    .messages({
      'any.required': 'Vui lòng nhập phản hồi',
      'string.empty': 'Phản hồi không được để trống',
      'string.min': 'Phản hồi phải có ít nhất {#limit} ký tự',
      'string.max': 'Phản hồi không được vượt quá {#limit} ký tự',
      'string.base': 'Phản hồi phải là chuỗi ký tự'
    })
});

module.exports = {
  createDeleteRequestSchema,
  handleDeleteRequestSchema
}; 