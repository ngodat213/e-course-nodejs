const Joi = require('joi');

const createMoMoPaymentSchema = Joi.object({
  amount: Joi.number().required().min(1000).max(50000000),
  orderInfo: Joi.string()
});

const forceProcessPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  status: Joi.string().valid('paid', 'failed').default('paid')
});

module.exports = {
  createMoMoPaymentSchema,
  forceProcessPaymentSchema
}; 