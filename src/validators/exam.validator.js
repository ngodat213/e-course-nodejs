const Joi = require('joi');

const createExamSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(5)
        .max(200)
        .messages({
            'any.required': 'Vui lòng nhập tiêu đề bài kiểm tra',
            'string.empty': 'Tiêu đề không được để trống',
            'string.min': 'Tiêu đề phải có ít nhất {#limit} ký tự',
            'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự',
            'string.base': 'Tiêu đề phải là chuỗi ký tự'
        }),

    description: Joi.string()
        .required()
        .min(20)
        .max(1000)
        .messages({
            'any.required': 'Vui lòng nhập mô tả bài kiểm tra',
            'string.empty': 'Mô tả không được để trống',
            'string.min': 'Mô tả phải có ít nhất {#limit} ký tự',
            'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
            'string.base': 'Mô tả phải là chuỗi ký tự'
        }),

    duration: Joi.number()
        .integer()
        .min(1)
        .max(180)
        .required()
        .messages({
            'any.required': 'Vui lòng nhập thời gian làm bài',
            'number.base': 'Thời gian phải là số',
            'number.integer': 'Thời gian phải là số nguyên',
            'number.min': 'Thời gian tối thiểu là {#limit} phút',
            'number.max': 'Thời gian tối đa là {#limit} phút'
        }),

    pass_score: Joi.number()
        .min(0)
        .max(100)
        .required()
        .messages({
            'any.required': 'Vui lòng nhập điểm đạt',
            'number.base': 'Điểm đạt phải là số',
            'number.min': 'Điểm đạt không được âm',
            'number.max': 'Điểm đạt tối đa là {#limit}'
        }),

    status: Joi.string()
        .valid('draft', 'published')
        .default('draft')
        .messages({
            'any.only': 'Trạng thái phải là draft hoặc published',
            'string.base': 'Trạng thái không hợp lệ'
        })
});

const updateExamSchema = Joi.object({
    title: Joi.string()
        .min(5)
        .max(200)
        .messages({
            'string.min': 'Tiêu đề phải có ít nhất {#limit} ký tự',
            'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự',
            'string.base': 'Tiêu đề phải là chuỗi ký tự'
        }),

    description: Joi.string()
        .min(20)
        .max(1000)
        .messages({
            'string.min': 'Mô tả phải có ít nhất {#limit} ký tự',
            'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
            'string.base': 'Mô tả phải là chuỗi ký tự'
        }),

    duration: Joi.number()
        .integer()
        .min(1)
        .max(180)
        .messages({
            'number.base': 'Thời gian phải là số',
            'number.integer': 'Thời gian phải là số nguyên',
            'number.min': 'Thời gian tối thiểu là {#limit} phút',
            'number.max': 'Thời gian tối đa là {#limit} phút'
        }),

    pass_score: Joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.base': 'Điểm đạt phải là số',
            'number.min': 'Điểm đạt không được âm',
            'number.max': 'Điểm đạt tối đa là {#limit}'
        }),

    status: Joi.string()
        .valid('draft', 'published')
        .messages({
            'any.only': 'Trạng thái phải là draft hoặc published',
            'string.base': 'Trạng thái không hợp lệ'
        })
}).min(1).messages({
    'object.min': 'Vui lòng cung cấp ít nhất một thông tin để cập nhật'
});

const submitExamSchema = Joi.object({
    answers: Joi.object().pattern(
        Joi.string(),
        Joi.string().required()
    ).required()
});

module.exports = {
    createExamSchema,
    updateExamSchema,
    submitExamSchema
}; 