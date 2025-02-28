const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'any.required': 'Vui lòng nhập tên danh mục',
      'string.empty': 'Vui lòng nhập tên danh mục',
      'string.min': 'Tên danh mục phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên danh mục không được vượt quá {#limit} ký tự',
      'string.base': 'Tên danh mục không hợp lệ'
    }),

  description: Joi.string()
    .required()
    .min(10)
    .max(500)
    .messages({
      'any.required': 'Vui lòng nhập mô tả danh mục',
      'string.empty': 'Vui lòng nhập mô tả danh mục',
      'string.min': 'Mô tả phải có ít nhất {#limit} ký tự',
      'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
      'string.base': 'Mô tả không hợp lệ'
    }),

  parent_id: Joi.string()
    .allow(null)
    .messages({
      'string.base': 'ID danh mục cha không hợp lệ',
      'string.empty': 'ID danh mục cha không được để trống'
    }),

  status: Joi.string()
    .valid('active', 'inactive')
    .default('active')
    .messages({
      'any.only': 'Trạng thái phải là active hoặc inactive',
      'string.base': 'Trạng thái không hợp lệ'
    }),

  order: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Thứ tự phải là số',
      'number.integer': 'Thứ tự phải là số nguyên',
      'number.min': 'Thứ tự không được âm'
    })
});

const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Tên danh mục phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên danh mục không được vượt quá {#limit} ký tự',
      'string.base': 'Tên danh mục không hợp lệ'
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .messages({
      'string.min': 'Mô tả phải có ít nhất {#limit} ký tự',
      'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
      'string.base': 'Mô tả không hợp lệ'
    }),

  parent_id: Joi.string()
    .allow(null)
    .messages({
      'string.base': 'ID danh mục cha không hợp lệ',
      'string.empty': 'ID danh mục cha không được để trống'
    }),

  status: Joi.string()
    .valid('active', 'inactive')
    .messages({
      'any.only': 'Trạng thái phải là active hoặc inactive',
      'string.base': 'Trạng thái không hợp lệ'
    }),

  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Thứ tự phải là số',
      'number.integer': 'Thứ tự phải là số nguyên',
      'number.min': 'Thứ tự không được âm'
    })
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật'
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
}; 