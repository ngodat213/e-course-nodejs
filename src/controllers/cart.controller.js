const BaseController = require("./base.controller");
const CartService = require("../services/cart.service");

class CartController extends BaseController {
  constructor() {
    super();
  }

  async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart(req.user.id);
      this.successResponse(res, cart);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async addToCart(req, res, next) {
    try {
      const cart = await CartService.addToCart(req.user.id, req.body.course_id);
      this.successResponse(res, cart);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async removeFromCart(req, res, next) {
    try {
      const cart = await CartService.removeFromCart(req.user.id, req.body.course_id);
      this.successResponse(res, cart);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async clearCart(req, res, next) {
    try {
      const cart = await CartService.clearCart(req.user.id);
      this.successResponse(res, cart);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async checkout(req, res, next) {
    try {
      const { payment_method } = req.body;
      const result = await CartService.checkout(req.user.id, payment_method);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async processPaymentSuccess(req, res, next) {
    try {
      const { order_id } = req.body;
      const result = await CartService.processSuccessfulPayment(order_id);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new CartController();
