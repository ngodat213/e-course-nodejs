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

const checkoutSchema = Joi.object({
  payment_method: Joi.string()
    .valid("momo")
    .required()
    .messages({
      "string.empty": "Phương thức thanh toán không được để trống",
      "any.required": "Phương thức thanh toán là bắt buộc",
      "any.only": "Phương thức thanh toán không hợp lệ"
    })
});

const processPaymentSuccessSchema = Joi.object({
  order_id: Joi.string()
    .required()
    .messages({
      "string.empty": "ID đơn hàng không được để trống",
      "any.required": "ID đơn hàng là bắt buộc"
    })
});

module.exports = {
  addToCartSchema,
  removeFromCartSchema,
  checkoutSchema,
  processPaymentSuccessSchema
};
