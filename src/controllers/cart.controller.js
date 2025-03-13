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
}

module.exports = new CartController();
