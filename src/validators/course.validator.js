const Joi = require('joi');

const courseSchema = Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required().min(20),
    price: Joi.number().required().min(0),
    thumbnail: Joi.string().uri().allow(null),
    lessons: Joi.array().items(
        Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            video_url: Joi.string().uri().allow(null)
        })
    )
});

const createCourseSchema = Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required().min(20),
    price: Joi.number().required().min(0),
    type: Joi.string().required().valid('course', 'quiz'),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
    categories: Joi.array()
        .items(Joi.string().required().messages({
            'string.empty': 'ID danh mục không được để trống',
            'string.base': 'ID danh mục không hợp lệ'
        }))
        .min(1)
        .required()
        .messages({
            'array.min': 'Khóa học phải thuộc ít nhất 1 danh mục',
            'array.base': 'Danh mục không hợp lệ',
            'any.required': 'Vui lòng chọn danh mục cho khóa học',
            'array.includesRequiredUnknowns': 'Các ID danh mục không được để trống'
        }),
});

const updateCourseSchema = Joi.object({
    title: Joi.string().min(5).max(200),
    description: Joi.string().min(20),
    price: Joi.number().min(0),
    type: Joi.string().valid('course', 'quiz'),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
    status: Joi.string().valid('draft', 'published', 'archived'),
    categories: Joi.array()
        .items(Joi.string().messages({
            'string.empty': 'ID danh mục không được để trống',
            'string.base': 'ID danh mục không hợp lệ'
        }))
        .min(1)
        .messages({
            'array.min': 'Khóa học phải thuộc ít nhất 1 danh mục',
            'array.base': 'Danh mục không hợp lệ',
            'array.includesRequiredUnknowns': 'Các ID danh mục không được để trống'
        }),
}).min(1);

module.exports = {
    courseSchema,
    createCourseSchema,
    updateCourseSchema
}; 