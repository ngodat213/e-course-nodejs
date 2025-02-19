/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng
 * 
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của người dùng
 *         name:
 *           type: string
 *           description: Tên người dùng
 *         email:
 *           type: string
 *           description: Email người dùng
 *         profile_picture:
 *           type: object
 *           description: Thông tin avatar
 *           properties:
 *             _id:
 *               type: string
 *             file_url:
 *               type: string
 *         role:
 *           type: string
 *           enum: [student, instructor, admin, super_admin]
 *         status:
 *           type: string
 *           enum: [pending, active, blocked]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Tên người dùng
 *         email:
 *           type: string
 *           format: email
 *           description: Email
 *
 *     ChangePasswordInput:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Mật khẩu hiện tại
 *         newPassword:
 *           type: string
 *           description: Mật khẩu mới
 *
 *     SetRoleInput:
 *       type: object
 *       required:
 *         - userId
 *         - role
 *       properties:
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         role:
 *           type: string
 *           enum: [student, instructor, admin]
 *           description: Role mới
 *
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string  
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     profile_picture:
 *                       type: string
 *                     enrolled_courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     teaching_courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                 stats:
 *                   type: object
 *                   description: Thống kê người dùng
 *       401:
 *         description: Chưa đăng nhập
 *
 *   put:
 *     tags: [Users] 
 *     summary: Cập nhật profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *
 * /api/users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Đổi mật khẩu
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu không đúng
 *       401:
 *         description: Chưa đăng nhập
 *
 * /api/users/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 *       400:
 *         description: File không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *
 * /api/users/admin:
 *   get:
 *     tags: [Users]
 *     summary: Lấy danh sách người dùng (Admin)
 *     description: API dành cho admin để quản lý danh sách người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Số lượng item mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *           enum: [name, -name, email, -email, role, -role, createdAt, -createdAt]
 *         description: Sắp xếp kết quả (- là giảm dần)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên hoặc email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, instructor, admin]
 *         description: Lọc theo role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, blocked]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [student, instructor, admin, super_admin]
 *                       status:
 *                         type: string
 *                         enum: [pending, active, blocked]
 *                       profile_picture:
 *                         type: string
 *                         description: Signed URL của avatar
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *
 * /api/users/admin/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin chi tiết người dùng (Admin)
 *     description: API dành cho admin để xem thông tin chi tiết của một người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     profile_picture:
 *                       type: string
 *                     enrolled_courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           progress_percent:
 *                             type: number
 *                     teaching_courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           student_count:
 *                             type: number
 *                 stats:
 *                   type: object
 *                   description: Thống kê người dùng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *
 *   put:
 *     tags: [Users]
 *     summary: Cập nhật thông tin người dùng (Admin)
 *     description: API dành cho admin để cập nhật thông tin của một người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *               status:
 *                 type: string
 *                 enum: [pending, active, blocked]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *
 *   delete:
 *     tags: [Users]
 *     summary: Xóa người dùng (Admin)
 *     description: API dành cho admin để xóa một người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Xóa người dùng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 */ 