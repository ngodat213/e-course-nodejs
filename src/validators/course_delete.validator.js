const Joi = require('joi');

const deleteRequestSchema = Joi.object({
    reason: Joi.string().required().min(10).max(500)
});

const handleRequestSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    message: Joi.string().min(5).max(500)
}).required();

module.exports = {
    deleteRequestSchema,
    handleRequestSchema
}; 