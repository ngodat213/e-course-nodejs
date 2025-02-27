const Joi = require('joi');

const createExamSchema = Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required().min(20),
    duration: Joi.number().required().min(1),
    passing_score: Joi.number().required().min(0).max(100),
    random_questions: Joi.boolean(),
    questions_per_exam: Joi.number().required().min(1),
    attempts_allowed: Joi.number().min(-1),
    status: Joi.string().valid('draft', 'published', 'archived')
});

const updateExamSchema = Joi.object({
    title: Joi.string().min(5).max(200),
    description: Joi.string().min(20),
    duration: Joi.number().min(1),
    passing_score: Joi.number().min(0).max(100),
    random_questions: Joi.boolean(),
    questions_per_exam: Joi.number().min(1),
    attempts_allowed: Joi.number().min(-1),
    status: Joi.string().valid('draft', 'published', 'archived')
}).min(1);

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