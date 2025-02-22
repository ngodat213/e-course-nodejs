const Joi = require('joi');

const createOrderSchema = Joi.object({
  courseIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one course is required',
      'array.base': 'Course IDs must be an array'
    })
});

module.exports = {
  createOrderSchema
}; 