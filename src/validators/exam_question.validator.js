const Joi = require('joi');

const createQuestionSchema = Joi.object({
    content: Joi.string()
        .required()
        .min(10)
        .max(1000)
        .messages({
            'any.required': 'Vui lòng nhập nội dung câu hỏi',
            'string.empty': 'Nội dung không được để trống',
            'string.min': 'Nội dung phải có ít nhất {#limit} ký tự',
            'string.max': 'Nội dung không được vượt quá {#limit} ký tự',
            'string.base': 'Nội dung phải là chuỗi ký tự'
        }),
    type: Joi.string()
        .valid('single', 'multiple')
        .required()
        .messages({
            'any.required': 'Vui lòng chọn loại câu hỏi',
            'string.empty': 'Loại câu hỏi không được để trống',
            'any.only': 'Loại câu hỏi phải là single hoặc multiple',
            'string.base': 'Loại câu hỏi không hợp lệ'
        }),
    options: Joi.array()
        .items(Joi.object({
            content: Joi.string()
                .required()
                .min(1)
                .max(500)
                .messages({
                    'any.required': 'Vui lòng nhập nội dung đáp án',
                    'string.empty': 'Nội dung đáp án không được để trống',
                    'string.min': 'Nội dung đáp án phải có ít nhất {#limit} ký tự',
                    'string.max': 'Nội dung đáp án không được vượt quá {#limit} ký tự'
                }),
            is_correct: Joi.boolean()
                .required()
                .messages({
                    'any.required': 'Vui lòng chọn đáp án đúng/sai',
                    'boolean.base': 'Đáp án đúng/sai không hợp lệ'
                })
        }))
        .min(2)
        .max(6)
        .required()
        .messages({
            'any.required': 'Vui lòng nhập các đáp án',
            'array.min': 'Phải có ít nhất {#limit} đáp án',
            'array.max': 'Không được vượt quá {#limit} đáp án'
        }),
    explanation: Joi.string()
        .max(1000)
        .allow('')
        .messages({
            'string.max': 'Giải thích không được vượt quá {#limit} ký tự',
            'string.base': 'Giải thích phải là chuỗi ký tự'
        }),
    points: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(1)
        .messages({
            'number.base': 'Điểm số phải là số',
            'number.integer': 'Điểm số phải là số nguyên',
            'number.min': 'Điểm số tối thiểu là {#limit}',
            'number.max': 'Điểm số tối đa là {#limit}'
        })
});

const updateQuestionSchema = Joi.object({
    content: Joi.string()
        .min(10)
        .max(1000)
        .messages({
            'string.min': 'Nội dung phải có ít nhất {#limit} ký tự',
            'string.max': 'Nội dung không được vượt quá {#limit} ký tự',
            'string.base': 'Nội dung phải là chuỗi ký tự'
        }),
    options: Joi.array()
        .items(Joi.object({
            content: Joi.string()
                .required()
                .min(1)
                .max(500)
                .messages({
                    'any.required': 'Vui lòng nhập nội dung đáp án',
                    'string.empty': 'Nội dung đáp án không được để trống',
                    'string.min': 'Nội dung đáp án phải có ít nhất {#limit} ký tự',
                    'string.max': 'Nội dung đáp án không được vượt quá {#limit} ký tự'
                }),
            is_correct: Joi.boolean()
                .required()
                .messages({
                    'any.required': 'Vui lòng chọn đáp án đúng/sai',
                    'boolean.base': 'Đáp án đúng/sai không hợp lệ'
                })
        }))
        .min(2)
        .max(6)
        .messages({
            'array.min': 'Phải có ít nhất {#limit} đáp án',
            'array.max': 'Không được vượt quá {#limit} đáp án'
        }),
    explanation: Joi.string()
        .max(1000)
        .allow('')
        .messages({
            'string.max': 'Giải thích không được vượt quá {#limit} ký tự',
            'string.base': 'Giải thích phải là chuỗi ký tự'
        }),
    points: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .messages({
            'number.base': 'Điểm số phải là số',
            'number.integer': 'Điểm số phải là số nguyên',
            'number.min': 'Điểm số tối thiểu là {#limit}',
            'number.max': 'Điểm số tối đa là {#limit}'
        })
}).min(1).messages({
    'object.min': 'Vui lòng cung cấp ít nhất một thông tin để cập nhật'
});

module.exports = {
    createQuestionSchema,
    updateQuestionSchema
}; 