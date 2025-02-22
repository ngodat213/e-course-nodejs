/**
 * @swagger
 * tags:
 *   name: MoMo
 *   description: Thanh toán qua MoMo
 * 
 * components:
 *   schemas:
 *     CreateMoMoPayment:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Số tiền thanh toán (VND)
 *           minimum: 1000
 *           maximum: 50000000
 *           example: 10000
 *         orderInfo:
 *           type: string
 *           description: Thông tin đơn hàng
 *           example: "Thanh toan khoa hoc ABC"
 *
 *     MoMoPaymentResponse:
 *       type: object
 *       properties:
 *         partnerCode:
 *           type: string
 *           example: "MOMO"
 *         orderId:
 *           type: string
 *           example: "1702546173979_123"
 *         requestId:
 *           type: string
 *           example: "1702546173979_123"
 *         amount:
 *           type: number
 *           example: 10000
 *         responseTime:
 *           type: number
 *           example: 1702546174
 *         message:
 *           type: string
 *           example: "Success"
 *         resultCode:
 *           type: number
 *           example: 0
 *         payUrl:
 *           type: string
 *           example: "https://test-payment.momo.vn/pay/..."
 *
 *     MoMoIPNResponse:
 *       type: object
 *       properties:
 *         partnerCode:
 *           type: string
 *         orderId:
 *           type: string
 *         requestId:
 *           type: string
 *         amount:
 *           type: number
 *         orderInfo:
 *           type: string
 *         orderType:
 *           type: string
 *         transId:
 *           type: number
 *         resultCode:
 *           type: number
 *         message:
 *           type: string
 *         payType:
 *           type: string
 *         responseTime:
 *           type: number
 *         extraData:
 *           type: string
 *         signature:
 *           type: string
 *
 * /api/momo/create:
 *   post:
 *     tags: [MoMo]
 *     summary: Tạo giao dịch thanh toán MoMo
 *     description: Tạo URL thanh toán và chuyển hướng đến cổng thanh toán MoMo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMoMoPayment'
 *     responses:
 *       200:
 *         description: Tạo giao dịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/MoMoPaymentResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *
 * /api/momo/ipn:
 *   post:
 *     tags: [MoMo]
 *     summary: Nhận thông báo kết quả thanh toán từ MoMo
 *     description: URL nhận IPN (Instant Payment Notification) từ MoMo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoMoIPNResponse'
 *     responses:
 *       200:
 *         description: Xử lý IPN thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [completed, failed]
 *                     message:
 *                       type: string
 *       400:
 *         description: Chữ ký không hợp lệ hoặc dữ liệu không hợp lệ
 */ 