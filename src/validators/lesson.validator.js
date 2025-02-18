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
    type: Joi.string().valid('video').required(),
    duration: Joi.number().min(0),
    // Video sẽ được xử lý qua multer, không validate ở đây
    content: Joi.object({
        video_url: Joi.string().uri(),
        video_id: Joi.string()
    }).optional()
});

const articleContentSchema = Joi.object({
    ...baseSchema,
    type: Joi.string().valid('article').required(),
    content: Joi.object({
        text: Joi.string().required().min(100)
    }).required()
});

const quizContentSchema = Joi.object({
    ...baseSchema,
    type: Joi.string().valid('quiz').required(),
    content: Joi.object({
        questions: Joi.array().items(
            Joi.object({
                question: Joi.string().required(),
                options: Joi.array().items(
                    Joi.object({
                        text: Joi.string().required(),
                        is_correct: Joi.boolean().required()
                    })
                ).min(2).required(),
                explanation: Joi.string(),
                points: Joi.number().default(1)
            })
        ).min(1).required()
    }).required()
});

// Middleware để validate dựa trên type
const validateLessonContent = (req, res, next) => {
    try {
        const { type } = req.body;
        let validationSchema;

        switch (type) {
            case 'video':
                if (!req.files?.video) {
                    throw new Error('Video file is required for video type lesson');
                }
                validationSchema = videoContentSchema;
                break;
            case 'article':
                if (!req.body.content?.text) {
                    throw new Error('Text content is required for article type lesson');
                }
                validationSchema = articleContentSchema;
                break;
            case 'quiz':
                if (!req.body.content?.questions) {
                    throw new Error('Questions are required for quiz type lesson');
                }
                validationSchema = quizContentSchema;
                break;
            default:
                throw new Error('Invalid lesson type');
        }

        const { error } = validationSchema.validate(req.body);
        if (error) {
            throw error;
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateLessonContent
}; 