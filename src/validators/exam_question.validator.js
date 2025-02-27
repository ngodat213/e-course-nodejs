const Joi = require('joi');

const createQuestionSchema = Joi.object({
    question: Joi.string().required().min(10),
    answers: Joi.array().items(
        Joi.object({
            text: Joi.string().required(),
            is_correct: Joi.boolean().required()
        })
    ).min(2).required(),
    explanation: Joi.string(),
    points: Joi.number().min(1)
});

const updateQuestionSchema = Joi.object({
    question: Joi.string().min(10),
    answers: Joi.array().items(
        Joi.object({
            text: Joi.string().required(),
            is_correct: Joi.boolean().required()
        })
    ).min(2),
    explanation: Joi.string(),
    points: Joi.number().min(1)
}).min(1);

module.exports = {
    createQuestionSchema,
    updateQuestionSchema
}; 