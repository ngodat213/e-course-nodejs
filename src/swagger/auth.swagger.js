/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - password
 *       properties:
 *         first_name:
 *           type: string
 *           description: Tên của người dùng
 *           example: John
 *         last_name:
 *           type: string 
 *           description: Họ của người dùng
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: Email đăng ký
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu (tối thiểu 6 ký tự)
 *           example: "123456"
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email đăng nhập
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Mật khẩu
 *           example: "123456"
 *     OTPInput:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         otp:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *               enum: [student, instructor, admin]
 *             status:
 *               type: string
 *               enum: [pending, active, blocked]
 *         tokens:
 *           type: object
 *           properties:
 *             access_token:
 *               type: string
 *             refresh_token:
 *               type: string
 *     
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refresh_token
 *       properties:
 *         refresh_token:
 *           type: string
 *           example: 7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d...
 *     
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             access_token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refresh_token:
 *               type: string
 *               example: 7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d...
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API xác thực người dùng
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vui lòng kiểm tra email để xác thực tài khoản
 *                 userId:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 *
 * /api/auth/register/mobile:
 *   post:
 *     summary: Đăng ký tài khoản qua mobile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Đăng ký thành công, gửi OTP
 *
 * /api/auth/verify-otp:
 *   post:
 *     summary: Xác thực OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPInput'
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email hoặc mật khẩu không đúng
 *       401:
 *         description: Tài khoản chưa được xác thực
 *       403:
 *         description: Tài khoản đã bị khóa
 *
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Xác thực email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email đã được xác thực
 *
 * /api/auth/forgot-password:
 *   post:
 *     summary: Yêu cầu đặt lại mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email đặt lại mật khẩu đã được gửi
 *
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt lại
 *
 * /api/auth/forgot-password/mobile:
 *   post:
 *     tags: [Auth]
 *     summary: Yêu cầu đặt lại mật khẩu qua mobile (OTP)
 *     description: Gửi OTP đến email để đặt lại mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP has been sent to your email
 *                 userId:
 *                   type: string
 *       400:
 *         description: Email không tồn tại
 *
 * /api/auth/reset-password/otp:
 *   post:
 *     tags: [Auth]
 *     summary: Đặt lại mật khẩu bằng OTP
 *     description: Xác thực OTP và đặt mật khẩu mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của user
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: Mã OTP 6 số
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Mật khẩu mới
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt lại thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: OTP không hợp lệ hoặc đã hết hạn
 *       404:
 *         description: Không tìm thấy user
 *
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh token
 *     description: Lấy access token mới bằng refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token được làm mới thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       401:
 *         description: Refresh token không hợp lệ hoặc đã hết hạn
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Đăng xuất
 *     description: Vô hiệu hóa refresh token hiện tại
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Đăng xuất thành công
 *       401:
 *         description: Refresh token không hợp lệ
 */ 