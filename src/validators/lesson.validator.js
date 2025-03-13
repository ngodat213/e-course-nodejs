const Joi = require('joi');

const baseSchema = {
    title: Joi.string().required().min(3).max(200),
    description: Joi.string(),
    type: Joi.string().valid('video', 'article', 'quiz').required(),
    is_free: Joi.boolean(),
    status: Joi.string().valid('draft', 'published'),
    requirements: Joi.array().items(Joi.string())
};

const videoContentSchema = Joi.object({
    ...baseSchema,
    content: Joi.object({
        video_url: Joi.string().uri(),
        video_id: Joi.string()
    })
});

const articleContentSchema = Joi.object({
    ...baseSchema,
    content: Joi.object({
        text: Joi.string().required().min(100)
    })
});

const quizContentSchema = Joi.object({
    ...baseSchema,
    content: Joi.object({
        questions: Joi.array().items(Joi.object({
            question: Joi.string().required(),
            options: Joi.array().items(Joi.object({
                text: Joi.string().required(),
                is_correct: Joi.boolean().required()
            })).min(2).required(),
            explanation: Joi.string(),
            points: Joi.number().min(0).default(1)
        })).min(1).required()
    })
});

// Schema cho lesson content
const lessonContentSchema = (type) => {
    switch (type) {
        case 'video':
            return videoContentSchema;
        case 'article':
            return articleContentSchema;
        case 'quiz':
            return quizContentSchema;
        default:
            throw new Error('Invalid lesson type');
    }
};

// Schema cho order
const lessonOrderSchema = Joi.object({
    order: Joi.number().required().min(1).messages({
        'number.base': 'Order must be a number',
        'number.min': 'Order must be greater than 0',
        'any.required': 'Order is required'
    })
});

const createLessonSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(5)
    .max(200)
    .messages({
      'any.required': 'Vui lòng nhập tiêu đề bài học',
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
      'any.required': 'Vui lòng nhập mô tả bài học',
      'string.empty': 'Mô tả không được để trống',
      'string.min': 'Mô tả phải có ít nhất {#limit} ký tự',
      'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
      'string.base': 'Mô tả phải là chuỗi ký tự'
    }),

  content: Joi.string()
    .required()
    .min(50)
    .messages({
      'any.required': 'Vui lòng nhập nội dung bài học',
      'string.empty': 'Nội dung không được để trống',
      'string.min': 'Nội dung phải có ít nhất {#limit} ký tự',
      'string.base': 'Nội dung phải là chuỗi ký tự'
    }),

  type: Joi.string()
    .valid('video', 'text', 'exam')
    .required()
    .messages({
      'any.required': 'Vui lòng chọn loại bài học',
      'string.empty': 'Loại bài học không được để trống',
      'any.only': 'Loại bài học phải là video, text hoặc exam',
      'string.base': 'Loại bài học không hợp lệ'
    }),

  duration: Joi.number()
    .integer()
    .min(0)
    .when('type', {
      is: 'video',
      then: Joi.required()
    })
    .messages({
      'any.required': 'Vui lòng nhập thời lượng video',
      'number.base': 'Thời lượng phải là số',
      'number.integer': 'Thời lượng phải là số nguyên',
      'number.min': 'Thời lượng không được âm'
    }),

  is_free: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Trạng thái miễn phí không hợp lệ'
    }),

  status: Joi.string()
    .valid('draft', 'published')
    .default('draft')
    .messages({
      'any.only': 'Trạng thái phải là draft hoặc published',
      'string.base': 'Trạng thái không hợp lệ'
    })
});

const updateLessonSchema = Joi.object({
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

  content: Joi.string()
    .min(50)
    .messages({
      'string.min': 'Nội dung phải có ít nhất {#limit} ký tự',
      'string.base': 'Nội dung phải là chuỗi ký tự'
    }),

  duration: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Thời lượng phải là số',
      'number.integer': 'Thời lượng phải là số nguyên',
      'number.min': 'Thời lượng không được âm'
    }),

  is_free: Joi.boolean()
    .messages({
      'boolean.base': 'Trạng thái miễn phí không hợp lệ'
    }),

  status: Joi.string()
    .valid('draft', 'published')
    .messages({
      'any.only': 'Trạng thái phải là draft hoặc published',
      'string.base': 'Trạng thái không hợp lệ'
    })
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật'
});

module.exports = {
    lessonContentSchema,
    lessonOrderSchema,
    createLessonSchema,
    updateLessonSchema
}; 