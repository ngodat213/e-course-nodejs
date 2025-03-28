const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cart.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const {
  addToCartSchema,
  removeFromCartSchema,
  checkoutSchema,
  processPaymentSuccessSchema
} = require("../validators/cart.validator");

// Tất cả routes cần xác thực
router.use(verifyToken);

/**
 * @route GET /api/cart
 * @desc Lấy thông tin giỏ hàng
 * @access Private
 */
router.get("/", (req, res, next) => {
  CartController.getCart(req, res, next);
});

/**
 * @route POST /api/cart/add
 * @desc Thêm khóa học vào giỏ hàng
 * @access Private
 */
router.post("/add", validateRequest(addToCartSchema), (req, res, next) => {
  CartController.addToCart(req, res, next);
});

/**
 * @route POST /api/cart/remove
 * @desc Xóa khóa học khỏi giỏ hàng
 * @access Private
 */
router.post("/remove", validateRequest(removeFromCartSchema), (req, res, next) => {
  CartController.removeFromCart(req, res, next);
});

/**
 * @route POST /api/cart/clear
 * @desc Xóa toàn bộ giỏ hàng
 * @access Private
 */
router.post("/clear", (req, res, next) => {
  CartController.clearCart(req, res, next);
});

/**
 * @route POST /api/cart/checkout
 * @desc Thanh toán giỏ hàng
 * @access Private
 */
router.post("/checkout", validateRequest(checkoutSchema), (req, res, next) => {
  CartController.checkout(req, res, next);
});

/**
 * @route POST /api/cart/payment-success
 * @desc Xử lý sau khi thanh toán thành công
 * @access Private
 */
router.post("/payment-success", validateRequest(processPaymentSuccessSchema), (req, res, next) => {
  CartController.processPaymentSuccess(req, res, next);
});

module.exports = router;
