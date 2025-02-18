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

module.exports = {
    courseSchema
}; 