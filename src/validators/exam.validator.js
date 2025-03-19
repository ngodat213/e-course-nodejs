const Joi = require('joi');

const createExamSchema = Joi.object({
    title: Joi.string()
        .min(5)
        .max(200)
        .default('Bài kiểm tra')
        .messages({
            'string.min': 'Tiêu đề phải có ít nhất {#limit} ký tự',
            'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự',
            'string.base': 'Tiêu đề phải là chuỗi ký tự'
        }),

    type: Joi.string()
        .valid('quiz')
        .default('quiz')
        .messages({
            'any.only': 'Loại nội dung phải là quiz',
            'string.base': 'Loại nội dung không hợp lệ'
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

    passing_score: Joi.number()
        .min(0)
        .max(100)
        .required()
        .messages({
            'any.required': 'Vui lòng nhập điểm đạt',
            'number.base': 'Điểm đạt phải là số',
            'number.min': 'Điểm đạt không được âm',
            'number.max': 'Điểm đạt tối đa là {#limit}'
        }),

    questions_per_exam: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'any.required': 'Vui lòng nhập số câu hỏi mỗi bài kiểm tra',
            'number.base': 'Số câu hỏi phải là số',
            'number.integer': 'Số câu hỏi phải là số nguyên',
            'number.min': 'Số câu hỏi tối thiểu là {#limit}'
        }),

    random_questions: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'Trường random_questions phải là boolean'
        }),

    attempts_allowed: Joi.number()
        .integer()
        .min(-1)
        .default(-1)
        .messages({
            'number.base': 'Số lần làm bài phải là số',
            'number.integer': 'Số lần làm bài phải là số nguyên',
            'number.min': 'Số lần làm bài tối thiểu là {#limit} (-1 là không giới hạn)'
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

    passing_score: Joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.base': 'Điểm đạt phải là số',
            'number.min': 'Điểm đạt không được âm',
            'number.max': 'Điểm đạt tối đa là {#limit}'
        }),

    questions_per_exam: Joi.number()
        .integer()
        .min(1)
        .messages({
            'number.base': 'Số câu hỏi phải là số',
            'number.integer': 'Số câu hỏi phải là số nguyên',
            'number.min': 'Số câu hỏi tối thiểu là {#limit}'
        }),

    random_questions: Joi.boolean()
        .messages({
            'boolean.base': 'Trường random_questions phải là boolean'
        }),

    attempts_allowed: Joi.number()
        .integer()
        .min(-1)
        .messages({
            'number.base': 'Số lần làm bài phải là số',
            'number.integer': 'Số lần làm bài phải là số nguyên',
            'number.min': 'Số lần làm bài tối thiểu là {#limit} (-1 là không giới hạn)'
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