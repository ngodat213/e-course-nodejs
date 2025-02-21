const Joi = require('joi');

const createMoMoPaymentSchema = Joi.object({
  amount: Joi.number().required().min(1000).max(50000000),
  orderInfo: Joi.string()
});

module.exports = {
  createMoMoPaymentSchema
}; 