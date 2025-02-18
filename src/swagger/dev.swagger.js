/**
 * @swagger
 * tags:
 *   name: Development
 *   description: API endpoints chỉ dùng trong môi trường development
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DevRegisterAdmin:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - dev_secret_key
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Admin User
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: admin123
 *         dev_secret_key:
 *           type: string
 *           description: Secret key for development
 *           example: Code26102003
 *     
 *     UsersList:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 100
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             totalPages:
 *               type: number
 *               example: 10
 */

/**
 * @swagger
 * /api/dev/register-admin:
 *   post:
 *     tags: [Development]
 *     summary: Đăng ký tài khoản admin (Development Only)
 *     description: API này chỉ hoạt động trong môi trường development
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DevRegisterAdmin'
 *     responses:
 *       201:
 *         description: Tạo tài khoản admin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc dev_secret_key sai
 *       404:
 *         description: Route không khả dụng trong production
 */

/**
 * @swagger
 * /api/dev/users:
 *   get:
 *     tags: [Development]
 *     summary: Lấy danh sách tất cả users (Development Only)
 *     description: API này chỉ hoạt động trong môi trường development
 *     parameters:
 *       - in: query
 *         name: dev_secret_key
 *         required: true
 *         schema:
 *           type: string
 *         description: Secret key for development
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng items mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-created_at'
 *         description: Sắp xếp (prefix - để sắp xếp giảm dần)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo email hoặc tên
 *     responses:
 *       200:
 *         description: Lấy danh sách users thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/UsersList'
 *       400:
 *         description: dev_secret_key không hợp lệ
 *       404:
 *         description: Route không khả dụng trong production
 */ 