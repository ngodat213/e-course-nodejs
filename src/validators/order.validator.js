const Joi = require('joi');

const createOrderSchema = Joi.object({
  course_id: Joi.string()
    .required()
    .messages({
      'any.required': 'Vui lòng chọn khóa học',
      'string.empty': 'ID khóa học không được để trống',
      'string.base': 'ID khóa học không hợp lệ'
    }),

  payment_method: Joi.string()
    .valid('momo', 'bank_transfer', 'credit_card')
    .required()
    .messages({
      'any.required': 'Vui lòng chọn phương thức thanh toán',
      'string.empty': 'Phương thức thanh toán không được để trống',
      'any.only': 'Phương thức thanh toán không hợp lệ',
      'string.base': 'Phương thức thanh toán không hợp lệ'
    }),

  coupon_code: Joi.string()
    .allow('')
    .messages({
      'string.base': 'Mã giảm giá không hợp lệ'
    })
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'completed', 'failed', 'refunded')
    .required()
    .messages({
      'any.required': 'Vui lòng chọn trạng thái',
      'string.empty': 'Trạng thái không được để trống',
      'any.only': 'Trạng thái phải là pending, completed, failed hoặc refunded',
      'string.base': 'Trạng thái không hợp lệ'
    }),

  note: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Ghi chú không được vượt quá {#limit} ký tự',
      'string.base': 'Ghi chú phải là chuỗi ký tự'
    })
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
}; 