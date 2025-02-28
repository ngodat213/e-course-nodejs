/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Quản lý khóa học
 * 
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - instructor_id
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           description: Tên khóa học
 *         description:
 *           type: string
 *           description: Mô tả khóa học
 *         price:
 *           type: number
 *           description: Giá khóa học (0 cho miễn phí)
 *         instructor_id:
 *           type: string
 *           description: ID của giảng viên
 *         type:
 *           type: string
 *           enum: [course, quiz]
 *           description: Loại khóa học
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Độ khó của khóa học
 *         thumbnail:
 *           type: string
 *           description: URL ảnh thumbnail
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: Trạng thái khóa học
 *         rating:
 *           type: number
 *           description: Đánh giá trung bình
 *         total_reviews:
 *           type: number
 *           description: Tổng số đánh giá
 *         total_students:
 *           type: number
 *           description: Tổng số học viên
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     CourseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/Course'
 *
 *     CourseList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             page:
 *               type: number
 *             limit:
 *               type: number
 *             pages:
 *               type: number
 *     CourseDeleteRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của yêu cầu xóa
 *         course_id:
 *           type: string
 *           description: ID của khóa học
 *         instructor_id:
 *           type: string
 *           description: ID của giảng viên
 *         reason:
 *           type: string
 *           description: Lý do xóa khóa học
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Trạng thái yêu cầu
 *         admin_response:
 *           type: object
 *           properties:
 *             admin_id:
 *               type: string
 *               description: ID của admin xử lý
 *             message:
 *               type: string
 *               description: Phản hồi của admin
 *             action_date:
 *               type: string
 *               format: date-time
 *               description: Thời gian xử lý
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Lấy danh sách khóa học
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng items mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên hoặc mô tả
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sắp xếp (-created_at, price, etc)
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
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *
 *   post:
 *     tags: [Courses]
 *     summary: Tạo khóa học mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [course, quiz]
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo khóa học thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền tạo khóa học
 *
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses] 
 *     summary: Lấy chi tiết khóa học
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
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Không tìm thấy khóa học
 *
 *   put:
 *     tags: [Courses]
 *     summary: Cập nhật khóa học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [course, quiz]
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền sửa khóa học này
 *       404:
 *         description: Không tìm thấy khóa học
 */

/**
 * @swagger
 * /api/courses/enroll/{id}:
 *   post:
 *     tags: [Courses]
 *     summary: Enroll in a course
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
 *         description: Successfully enrolled in course
 */

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get user's enrolled courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /api/courses/{id}/delete-request:
 *   post:
 *     tags: [Courses]
 *     summary: Yêu cầu xóa khóa học
 *     description: Giảng viên gửi yêu cầu xóa khóa học của họ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khóa học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: Lý do xóa khóa học
 *     responses:
 *       200:
 *         description: Yêu cầu xóa đã được gửi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseDeleteRequest'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền gửi yêu cầu xóa
 *       404:
 *         description: Không tìm thấy khóa học
 */

/**
 * @swagger
 * /api/courses/delete-requests:
 *   get:
 *     tags: [Courses]
 *     summary: Lấy danh sách yêu cầu xóa khóa học
 *     description: Admin lấy danh sách các yêu cầu xóa khóa học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Lọc theo trạng thái yêu cầu
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
 *     responses:
 *       200:
 *         description: Danh sách yêu cầu xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseDeleteRequest'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Không có quyền xem danh sách yêu cầu
 */

/**
 * @swagger
 * /api/courses/delete-requests/{requestId}:
 *   put:
 *     tags: [Courses] 
 *     summary: Xử lý yêu cầu xóa khóa học
 *     description: Admin phê duyệt hoặc từ chối yêu cầu xóa khóa học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của yêu cầu xóa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Trạng thái phê duyệt
 *               message:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 description: Phản hồi của admin
 *     responses:
 *       200:
 *         description: Xử lý yêu cầu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseDeleteRequest'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc yêu cầu đã được xử lý
 *       403:
 *         description: Không có quyền xử lý yêu cầu
 *       404:
 *         description: Không tìm thấy yêu cầu xóa
 */ 