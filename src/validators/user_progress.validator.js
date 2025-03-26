const Joi = require("joi");

const updateProgressSchema = Joi.object({
  status: Joi.string()
    .valid('not_started', 'in_progress', 'completed')
    .required()
});

module.exports = {
  updateProgressSchema
}; 