/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Quản lý bài học
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - course_id
 *         - title
 *         - type
 *         - order
 *       properties:
 *         _id:
 *           type: string
 *         course_id:
 *           type: string
 *           description: ID của khóa học
 *           ref: Course
 *         title:
 *           type: string
 *           description: Tiêu đề bài học
 *         description:
 *           type: string
 *           description: Mô tả bài học
 *         type:
 *           type: string
 *           enum: [video, document, exam]
 *           description: Loại bài học
 *         duration:
 *           type: number
 *           description: Thời lượng bài học (phút)
 *           default: 0
 *         order:
 *           type: number
 *           description: Thứ tự bài học trong khóa học
 *         is_free:
 *           type: boolean
 *           description: Bài học miễn phí hay không
 *           default: false
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: Trạng thái bài học
 *           default: draft
 *         video:
 *           type: string
 *           description: ID của video (CloudinaryFile)
 *           ref: CloudinaryFile
 *         quiz:
 *           type: string 
 *           description: ID của bài quiz
 *           ref: Quiz
 *         attachments:
 *           type: array
 *           description: Danh sách ID của các file đính kèm
 *           items:
 *             type: string
 *             ref: CloudinaryFile
 *         requirements:
 *           type: array
 *           description: Danh sách ID các bài học yêu cầu
 *           items:
 *             type: string
 *             ref: Lesson
 *         comments:
 *           type: array
 *           description: Danh sách ID các bình luận
 *           items:
 *             type: string
 *             ref: Comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/lessons/{id}:
 *   post:
 *     tags: [Lessons]
 *     summary: Tạo bài học mới (Instructor/Admin only)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, document, exam]
 *               order:
 *                 type: number
 *               is_free:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               video:
 *                 type: string
 *                 format: binary
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tạo bài học thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 */

/**
 * @swagger
 * /api/lessons/{courseId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Lấy danh sách bài học của khóa học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [video, document, exam]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
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
 *                     $ref: '#/components/schemas/Lesson'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     total_pages:
 *                       type: number
 */

/**
 * @swagger
 * /api/lessons/{courseId}/{lessonId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Lấy chi tiết bài học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 */

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   put:
 *     tags: [Lessons]
 *     summary: Cập nhật bài học (Instructor/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học cần cập nhật
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài học
 *               description:
 *                 type: string
 *                 description: Mô tả bài học
 *               type:
 *                 type: string
 *                 enum: [video, document, exam]
 *                 description: Loại bài học
 *               order:
 *                 type: number
 *                 description: Thứ tự bài học
 *               is_free:
 *                 type: boolean
 *                 description: Bài học miễn phí hay không
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: Trạng thái bài học
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: File video bài học
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Các file đính kèm
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: ID các bài học yêu cầu
 *     responses:
 *       200:
 *         description: Cập nhật bài học thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền sửa bài học này
 *       404:
 *         description: Không tìm thấy bài học
 */

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   delete:
 *     tags: [Lessons]
 *     summary: Xóa bài học (Instructor/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/order:
 *   put:
 *     tags: [Lessons]
 *     summary: Thay đổi thứ tự bài học (Instructor/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học cần thay đổi thứ tự
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order
 *             properties:
 *               order:
 *                 type: number
 *                 description: Thứ tự mới của bài học
 *     responses:
 *       200:
 *         description: Cập nhật thứ tự thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Thứ tự không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền sửa bài học này
 *       404:
 *         description: Không tìm thấy bài học
 */