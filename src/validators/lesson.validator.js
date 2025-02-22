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

module.exports = {
    lessonContentSchema,
    lessonOrderSchema
}; 