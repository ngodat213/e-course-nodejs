const express = require('express');
const router = express.Router();
const MoMoController = require('../controllers/momo.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { createMoMoPaymentSchema } = require('../validators/momo.validator');

router.post(
  '/create',
  verifyToken,
  validateRequest(createMoMoPaymentSchema),
  (req, res, next) => MoMoController.createPayment(req, res, next)
);

router.post('/ipn', (req, res, next) =>
  MoMoController.processIPN(req, res, next)
);

router.get('/ipn/dev', (req, res, next) =>
  MoMoController.processIPNDev(req, res, next)
);

module.exports = router;
