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
 *         first_name:
 *           type: string
 *           description: Họ người dùng
 *         last_name:
 *           type: string
 *           description: Tên người dùng
 *         email:
 *           type: string
 *           description: Email người dùng
 *         working_at:
 *           type: string
 *           description: Nơi làm việc
 *         address:
 *           type: string
 *           description: Địa chỉ
 *         about:
 *           type: string
 *           description: Giới thiệu bản thân
 *         followers:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID người theo dõi
 *         followers_count:
 *           type: number
 *           description: Số lượng người theo dõi
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
 *         fcm_tokens:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               device_info:
 *                 type: string
 *               last_used:
 *                 type: string
 *                 format: date-time
 *           description: FCM tokens cho push notification
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
 *         first_name:
 *           type: string
 *           description: Họ người dùng
 *         last_name:
 *           type: string
 *           description: Tên người dùng
 *         working_at:
 *           type: string
 *           description: Nơi làm việc
 *         address:
 *           type: string
 *           description: Địa chỉ
 *         about:
 *           type: string
 *           description: Giới thiệu bản thân
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
 *     FcmTokenInput:
 *       type: object
 *       required:
 *         - fcm_token
 *       properties:
 *         fcm_token:
 *           type: string
 *           description: FCM token mới từ thiết bị
 *         device_info:
 *           type: string
 *           description: Thông tin thiết bị (optional)
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
 *     Teacher:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của giảng viên
 *         first_name:
 *           type: string
 *           description: Họ giảng viên
 *         last_name:
 *           type: string
 *           description: Tên giảng viên
 *         email:
 *           type: string
 *           description: Email giảng viên
 *         working_at:
 *           type: string
 *           description: Nơi làm việc
 *         level:
 *           type: string
 *           description: Cấp độ giảng viên
 *         about:
 *           type: string
 *           description: Giới thiệu về giảng viên
 *         followers_count:
 *           type: number
 *           description: Số lượng người theo dõi
 *         profile_picture:
 *           type: string
 *           description: URL ảnh đại diện
 *         teaching_courses:
 *           type: array
 *           description: Danh sách khóa học đang dạy
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               title:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               student_count:
 *                 type: number
 *               rating_average:
 *                 type: number
 *         total_students:
 *           type: number
 *           description: Tổng số học viên
 *         average_rating:
 *           type: number
 *           description: Điểm đánh giá trung bình
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
 *                   $ref: '#/components/schemas/User'
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
 * /api/users/{id}/follow:
 *   post:
 *     tags: [Users]
 *     summary: Follow người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng muốn follow
 *     responses:
 *       200:
 *         description: Follow thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 followers_count:
 *                   type: number
 *       400:
 *         description: Lỗi (đã follow hoặc tự follow chính mình)
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người dùng
 *
 *   delete:
 *     tags: [Users]
 *     summary: Unfollow người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng muốn unfollow
 *     responses:
 *       200:
 *         description: Unfollow thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 followers_count:
 *                   type: number
 *       400:
 *         description: Lỗi (chưa follow)
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người dùng
 *
 * /api/users/{id}/followers:
 *   get:
 *     tags: [Users]
 *     summary: Lấy danh sách người theo dõi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: number
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người dùng
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
 *                     $ref: '#/components/schemas/User'
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
 * /api/users/teachers:
 *   get:
 *     tags: [Users]
 *     summary: Lấy danh sách giảng viên
 *     description: API để lấy danh sách giảng viên với các thông tin chi tiết
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
 *           default: -followers_count
 *           enum: [followers_count, -followers_count, total_students, -total_students, average_rating, -average_rating]
 *         description: Sắp xếp kết quả (- là giảm dần)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên hoặc email
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Lọc theo cấp độ giảng viên
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
 *                     $ref: '#/components/schemas/Teacher'
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
 *       400:
 *         description: Lỗi tham số không hợp lệ
 *
 * /api/users/teachers/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin chi tiết giảng viên
 *     description: API để lấy thông tin chi tiết của một giảng viên bao gồm các khóa học, đánh giá và thống kê
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giảng viên
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     working_at:
 *                       type: string
 *                     level:
 *                       type: string
 *                     about:
 *                       type: string
 *                     profile_picture:
 *                       type: string
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           profile_picture:
 *                             type: string
 *                     teaching_courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           thumbnail:
 *                             type: string
 *                           price:
 *                             type: number
 *                           level:
 *                             type: string
 *                           student_count:
 *                             type: number
 *                           rating_average:
 *                             type: number
 *                           reviews:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 rating:
 *                                   type: number
 *                                 content:
 *                                   type: string
 *                                 created_at:
 *                                   type: string
 *                                   format: date-time
 *                                 user_id:
 *                                   type: object
 *                                   properties:
 *                                     first_name:
 *                                       type: string
 *                                     last_name:
 *                                       type: string
 *                                     profile_picture:
 *                                       type: string
 *                     total_students:
 *                       type: number
 *                     average_rating:
 *                       type: number
 *                     total_reviews:
 *                       type: number
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalCourses:
 *                       type: number
 *                     totalStudents:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     totalReviews:
 *                       type: number
 *                     ratingDistribution:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *       404:
 *         description: Không tìm thấy giảng viên
 *
 * /api/users/streak/increment:
 *   post:
 *     tags: [Users]
 *     summary: Tăng streak của user
 *     description: Tăng streak lên 1 khi user hoàn thành bài học trong ngày
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cập nhật streak thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 current_streak:
 *                   type: number
 *                 longest_streak:
 *                   type: number
 *
 * /api/users/streak/reset:
 *   post:
 *     tags: [Users]
 *     summary: Reset streak của user
 *     description: Reset streak về 0 khi user bỏ lỡ ngày học
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reset streak thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 current_streak:
 *                   type: number
 *                 longest_streak:
 *                   type: number
 *
 * /api/users/streak:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin streak
 *     description: Lấy thông tin streak hiện tại của user
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
 *                 current_streak:
 *                   type: number
 *                   description: Số ngày streak hiện tại
 *                 longest_streak:
 *                   type: number
 *                   description: Số ngày streak dài nhất
 *                 last_streak_date:
 *                   type: string
 *                   format: date-time
 *                   description: Thời điểm cập nhật streak gần nhất
 *
 * /api/users/fcm-token:
 *   post:
 *     tags: [Users]
 *     summary: Cập nhật FCM token
 *     description: Cập nhật FCM token cho user để gửi push notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FcmTokenInput'
 *     responses:
 *       200:
 *         description: Cập nhật FCM token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: FCM token updated successfully
 *                 token_count:
 *                   type: number
 *                   description: Số lượng token hiện có của user
 *       400:
 *         description: FCM token không được cung cấp
 *       401:
 *         description: Chưa đăng nhập
 */ 