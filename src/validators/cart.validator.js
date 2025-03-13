const Joi = require("joi");

const addToCartSchema = Joi.object({
  course_id: Joi.string()
    .required()
    .messages({
      "string.empty": "ID khóa học không được để trống",
      "any.required": "ID khóa học là bắt buộc"
    })
});

const removeFromCartSchema = Joi.object({
  course_id: Joi.string()
    .required()
    .messages({
      "string.empty": "ID khóa học không được để trống",
      "any.required": "ID khóa học là bắt buộc"
    })
});

module.exports = {
  addToCartSchema,
  removeFromCartSchema
};
