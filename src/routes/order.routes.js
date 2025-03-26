const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { createOrderSchema } = require('../validators/order.validator');


router.post(
  '/',
  verifyToken,
  validateRequest(createOrderSchema),
  (req, res, next) => OrderController.create(req, res, next)
);

router.get(
  '/',
  verifyToken,
  (req, res, next) => OrderController.getAll(req, res, next)
);

router.get(
  '/:id',
  verifyToken,
  (req, res, next) => OrderController.getById(req, res, next)
);

module.exports = router; 