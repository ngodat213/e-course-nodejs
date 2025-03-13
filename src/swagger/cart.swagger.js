/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Quản lý giỏ hàng
 * 
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         course_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             price:
 *               type: number
 *             thumbnail_id:
 *               type: object
 *               properties:
 *                 file_url:
 *                   type: string
 *             instructor_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 profile_picture:
 *                   type: object
 *                   properties:
 *                     file_url:
 *                       type: string
 *         price:
 *           type: number
 *         added_at:
 *           type: string
 *           format: date-time
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         total_items:
 *           type: number
 *         total_amount:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Lấy thông tin giỏ hàng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Chưa đăng nhập
 *
 * /api/cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Thêm khóa học vào giỏ hàng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *             properties:
 *               course_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Lỗi dữ liệu
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy khóa học
 *
 * /api/cart/remove:
 *   post:
 *     tags: [Cart]
 *     summary: Xóa khóa học khỏi giỏ hàng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *             properties:
 *               course_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Lỗi dữ liệu
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy khóa học trong giỏ hàng
 *
 * /api/cart/clear:
 *   post:
 *     tags: [Cart]
 *     summary: Xóa toàn bộ giỏ hàng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy giỏ hàng
 */
