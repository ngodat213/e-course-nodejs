const BaseController = require('./base.controller');
const MoMoService = require('../services/momo.service');
const { BadRequestError } = require('../utils/errors');
const i18next = require('i18next');

class MoMoController extends BaseController {
  constructor() {
    super();
  }

  async createPayment(req, res, next) {
    try {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        throw new BadRequestError(i18next.t('payment.invalidAmount'));
      }

      const orderId = `${Date.now()}_${req.user.id}`;
      const requestId = orderId;

      const paymentBody = await MoMoService.createPaymentUrl({
        amount,
        orderId,
        requestId,
        orderInfo: `Payment for order ${orderId}`,
        userId: req.user.id
      });

      this.successResponse(res, paymentBody);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async processIPN(req, res, next) {
    try {
      // Kiểm tra xem có cần bỏ qua xác thực chữ ký không
      if (process.env.MOMO_SKIP_SIGNATURE_VERIFY === 'true') {
        // Sử dụng phương thức đơn giản nếu bỏ qua xác thực
        const result = await MoMoService.processSimpleIPN(req.body);
        return this.successResponse(res, result);
      }
      
      // Sử dụng phương thức xác thực đầy đủ
      const result = await MoMoService.processPaymentResult(req.body);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async processIPNDev(req, res, next) {
    try {
      const result = await MoMoService.processIPNDev(req.query);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
  
  async forceProcessPayment(req, res, next) {
    try {
      const { orderId, status } = req.body;
      const result = await MoMoService.forceProcessPayment(orderId, status);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new MoMoController(); 