/**
 * @swagger
 * tags:
 *   name: Delete Requests
 *   description: Quản lý yêu cầu xóa khóa học
 * 
 * components:
 *   schemas:
 *     DeleteRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của yêu cầu xóa
 *         course_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             description:
 *               type: string
 *         instructor_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *         reason:
 *           type: string
 *           description: Lý do xóa khóa học
 *           minLength: 10
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Trạng thái yêu cầu
 *           default: pending
 *         admin_response:
 *           type: object
 *           properties:
 *             admin_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *             message:
 *               type: string
 *             action_date:
 *               type: string
 *               format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 * /api/courses/{id}/delete-request:
 *   post:
 *     tags: [Delete Requests] 
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
 *               $ref: '#/components/schemas/DeleteRequest'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền gửi yêu cầu xóa
 *       404:
 *         description: Không tìm thấy khóa học
 *
 * /api/courses/delete-requests:
 *   get:
 *     tags: [Delete Requests]
 *     summary: Lấy danh sách yêu cầu xóa
 *     description: Admin lấy danh sách tất cả yêu cầu xóa khóa học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Lọc theo trạng thái
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
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeleteRequest'
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
 *         description: Không có quyền truy cập
 *
 * /api/courses/delete-requests/{requestId}:
 *   put:
 *     tags: [Delete Requests]
 *     summary: Xử lý yêu cầu xóa
 *     description: Admin phê duyệt hoặc từ chối yêu cầu xóa
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
 *         description: Xử lý thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteRequest'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc yêu cầu đã được xử lý
 *       403:
 *         description: Không có quyền xử lý
 *       404:
 *         description: Không tìm thấy yêu cầu xóa
 */ 