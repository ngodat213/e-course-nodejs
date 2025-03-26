const express = require('express');
const router = express.Router();
const MoMoController = require('../controllers/momo.controller');
const { verifyToken, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { createMoMoPaymentSchema, forceProcessPaymentSchema } = require('../validators/momo.validator');

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

// Route mới để xử lý thanh toán thành công mà không cần xác thực chữ ký
// Chỉ admin mới có quyền sử dụng
router.post(
  '/force-process',
  verifyToken,
  restrictTo(['admin', 'super_admin']),
  validateRequest(forceProcessPaymentSchema),
  (req, res, next) => MoMoController.forceProcessPayment(req, res, next)
);

module.exports = router;
