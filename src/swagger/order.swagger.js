/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng
 * 
 * components:
 *   schemas:
 *     CreateOrder:
 *       type: object
 *       required:
 *         - courseIds
 *       properties:
 *         courseIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID các khóa học
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *
 *     OrderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         courses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         created_at:
 *           type: string
 *           format: date-time
 *
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn hàng mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       200:
 *         description: Tạo đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                 paymentUrl:
 *                   type: string
 *
 *   get:
 *     tags: [Orders]
 *     summary: Lấy danh sách đơn hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     pages:
 *                       type: number
 *                     limit:
 *                       type: number
 *
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy thông tin đơn hàng theo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 */ 