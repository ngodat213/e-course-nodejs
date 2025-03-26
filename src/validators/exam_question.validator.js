const Joi = require('joi');

const createQuestionSchema = Joi.object({
    question: Joi.string()
        .required()
        .min(10)
        .max(1000)
        .messages({
            'any.required': 'Vui lòng nhập câu hỏi',
            'string.empty': 'Câu hỏi không được để trống',
            'string.min': 'Câu hỏi phải có ít nhất {#limit} ký tự',
            'string.max': 'Câu hỏi không được vượt quá {#limit} ký tự',
            'string.base': 'Câu hỏi phải là chuỗi ký tự'
        }),

    answers: Joi.alternatives().try(
        // Cho phép answers là một mảng object
        Joi.array()
            .items(Joi.object({
                text: Joi.string()
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
            .max(6),
        // Cho phép answers là một chuỗi JSON
        Joi.string().custom((value, helpers) => {
            try {
                let parsed;
                // Thử parse chuỗi JSON
                try {
                    // Nếu chuỗi không bắt đầu bằng [ thì thêm vào
                    if (!value.trim().startsWith('[')) {
                        value = `[${value}]`;
                    }
                    parsed = JSON.parse(value);
                } catch (e) {
                    // Nếu không parse được, thử kiểm tra xem có phải là mảng đã được parse
                    if (typeof value === 'object') {
                        parsed = value;
                    } else {
                        return helpers.error('string.jsonParse');
                    }
                }

                // Kiểm tra nếu là object có property answers
                if (parsed.answers && Array.isArray(parsed.answers)) {
                    return parsed.answers;
                }
                
                // Kiểm tra nếu là mảng trực tiếp
                if (Array.isArray(parsed)) {
                    return parsed;
                }

                return helpers.error('string.jsonArray');
            } catch (err) {
                return helpers.error('string.jsonParse');
            }
        })
    )
    .required()
    .custom((value, helpers) => {
        let answers = Array.isArray(value) ? value : value;
        
        // Kiểm tra cấu trúc của mỗi answer
        for (let answer of answers) {
            if (!answer.text || typeof answer.is_correct !== 'boolean') {
                return helpers.error('array.structure');
            }
        }
        
        // Kiểm tra số lượng đáp án
        if (answers.length < 2 || answers.length > 6) {
            return helpers.error('array.length');
        }
        
        // Kiểm tra phải có ít nhất 1 đáp án đúng
        const correctAnswers = answers.filter(answer => answer.is_correct);
        if (correctAnswers.length === 0) {
            return helpers.error('array.minCorrect');
        }
        
        return value;
    })
    .messages({
        'any.required': 'Vui lòng nhập các đáp án',
        'array.length': 'Số lượng đáp án phải từ 2 đến 6',
        'array.structure': 'Cấu trúc đáp án không hợp lệ',
        'array.minCorrect': 'Phải có ít nhất 1 đáp án đúng',
        'string.jsonParse': 'Định dạng JSON không hợp lệ',
        'string.jsonArray': 'Answers phải là một mảng các đáp án'
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
    question: Joi.string()
        .min(10)
        .max(1000)
        .messages({
            'string.min': 'Câu hỏi phải có ít nhất {#limit} ký tự',
            'string.max': 'Câu hỏi không được vượt quá {#limit} ký tự',
            'string.base': 'Câu hỏi phải là chuỗi ký tự'
        }),

    answers: Joi.alternatives().try(
        Joi.array()
            .items(Joi.object({
                text: Joi.string()
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
            .max(6),
        Joi.string().custom((value, helpers) => {
            try {
                let parsed;
                try {
                    // Nếu chuỗi không bắt đầu bằng [ thì thêm vào
                    if (!value.trim().startsWith('[')) {
                        value = `[${value}]`;
                    }
                    parsed = JSON.parse(value);
                } catch (e) {
                    if (typeof value === 'object') {
                        parsed = value;
                    } else {
                        return helpers.error('string.jsonParse');
                    }
                }

                if (parsed.answers && Array.isArray(parsed.answers)) {
                    return parsed.answers;
                }
                
                if (Array.isArray(parsed)) {
                    return parsed;
                }

                return helpers.error('string.jsonArray');
            } catch (err) {
                return helpers.error('string.jsonParse');
            }
        })
    )
    .custom((value, helpers) => {
        if (value) {
            let answers = Array.isArray(value) ? value : value;
            
            // Kiểm tra cấu trúc của mỗi answer
            for (let answer of answers) {
                if (!answer.text || typeof answer.is_correct !== 'boolean') {
                    return helpers.error('array.structure');
                }
            }
            
            // Kiểm tra số lượng đáp án
            if (answers.length < 2 || answers.length > 6) {
                return helpers.error('array.length');
            }
            
            // Kiểm tra phải có ít nhất 1 đáp án đúng
            const correctAnswers = answers.filter(answer => answer.is_correct);
            if (correctAnswers.length === 0) {
                return helpers.error('array.minCorrect');
            }
        }
        return value;
    })
    .messages({
        'array.length': 'Số lượng đáp án phải từ 2 đến 6',
        'array.structure': 'Cấu trúc đáp án không hợp lệ',
        'array.minCorrect': 'Phải có ít nhất 1 đáp án đúng',
        'string.jsonParse': 'Định dạng JSON không hợp lệ',
        'string.jsonArray': 'Answers phải là một mảng các đáp án'
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