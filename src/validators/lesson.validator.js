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
    order: Joi.number()
        .min(1)
        .required()
        .messages({
            'number.base': 'Order phải là số',
            'number.min': 'Order phải lớn hơn 0',
            'any.required': 'Order là bắt buộc'
        })
});

// Schema cho Lesson
const createLessonSchema = Joi.object({
  course_id: Joi.string()
    .required()
    .messages({
      'any.required': 'Vui lòng cung cấp ID khóa học',
      'string.empty': 'ID khóa học không được để trống',
      'string.base': 'ID khóa học không hợp lệ'
    }),

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
    .min(20)
    .max(1000)
    .messages({
      'string.min': 'Mô tả phải có ít nhất {#limit} ký tự',
      'string.max': 'Mô tả không được vượt quá {#limit} ký tự',
      'string.base': 'Mô tả phải là chuỗi ký tự'
    }),

  is_free: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Trạng thái miễn phí không hợp lệ'
    }),

  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('draft')
    .messages({
      'any.only': 'Trạng thái phải là draft, published hoặc archived',
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

  is_free: Joi.boolean()
    .messages({
      'boolean.base': 'Trạng thái miễn phí không hợp lệ'
    }),

  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .messages({
      'any.only': 'Trạng thái phải là draft, published hoặc archived',
      'string.base': 'Trạng thái không hợp lệ'
    })
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật'
});

// Schema cho LessonContent
const createLessonContentSchema = Joi.object({
  lesson_id: Joi.string()
    .required()
    .messages({
      'any.required': 'Vui lòng cung cấp ID bài học',
      'string.empty': 'ID bài học không được để trống',
      'string.base': 'ID bài học không hợp lệ'
    }),

  title: Joi.string()
    .required()
    .min(5)
    .max(200)
    .messages({
      'any.required': 'Vui lòng nhập tiêu đề nội dung',
      'string.empty': 'Tiêu đề không được để trống',
      'string.min': 'Tiêu đề phải có ít nhất {#limit} ký tự',
      'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự'
    }),

  type: Joi.string()
    .required()
    .valid('video', 'document', 'quiz')
    .messages({
      'any.required': 'Vui lòng chọn loại nội dung',
      'any.only': 'Loại nội dung phải là video, document hoặc quiz'
    }),

  video: Joi.when('type', {
    is: 'video',
    then: Joi.string().required().messages({
      'any.required': 'Vui lòng upload video'
    })
  }),

  quiz: Joi.when('type', {
    is: 'quiz',
    then: Joi.string().required().messages({
      'any.required': 'Vui lòng cung cấp ID quiz'
    })
  }),

  attachments: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': 'Danh sách tài liệu đính kèm không hợp lệ'
    }),

  requirements: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': 'Danh sách yêu cầu không hợp lệ'
    }),

  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .default('draft')
    .messages({
      'any.only': 'Trạng thái phải là draft, published hoặc archived'
    })
});

const updateLessonContentSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .messages({
      'string.min': 'Tiêu đề phải có ít nhất {#limit} ký tự',
      'string.max': 'Tiêu đề không được vượt quá {#limit} ký tự'
    }),

  video: Joi.string(),
  quiz: Joi.string(),

  attachments: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': 'Danh sách tài liệu đính kèm không hợp lệ'
    }),

  requirements: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': 'Danh sách yêu cầu không hợp lệ'
    }),

  removeAttachments: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': 'Danh sách tài liệu cần xóa không hợp lệ'
    }),

  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .messages({
      'any.only': 'Trạng thái phải là draft, published hoặc archived'
    })
}).min(1).messages({
  'object.min': 'Vui lòng cung cấp ít nhất một trường để cập nhật'
});

module.exports = {
    lessonContentSchema,
    lessonOrderSchema,
    createLessonSchema,
    updateLessonSchema,
    createLessonContentSchema,
    updateLessonContentSchema
}; 