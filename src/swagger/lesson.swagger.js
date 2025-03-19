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
 *     LessonInput:
 *       type: object
 *       required:
 *         - course_id
 *         - title
 *       properties:
 *         course_id:
 *           type: string
 *           description: ID của khóa học
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Tiêu đề bài học
 *         description:
 *           type: string
 *           minLength: 20
 *           maxLength: 1000
 *           description: Mô tả bài học
 *         is_free:
 *           type: boolean
 *           default: false
 *           description: Bài học miễn phí hay không
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *           description: Trạng thái bài học
 *
 *     Lesson:
 *       allOf:
 *         - $ref: '#/components/schemas/LessonInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: ID của bài học
 *             duration:
 *               type: number
 *               description: Tổng thời lượng của bài học (tính bằng phút)
 *               default: 0
 *             contents:
 *               type: array
 *               description: Danh sách nội dung của bài học
 *               items:
 *                 $ref: '#/components/schemas/LessonContent'
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     LessonResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/Lesson'
 *         message:
 *           type: string
 *
 *     LessonsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
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
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     tags: [Lessons]
 *     summary: Tạo bài học mới (Instructor/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *           example:
 *             course_id: "60d3b41f7c213e3ab47892b1"
 *             title: "Bài học đầu tiên"
 *             description: "Mô tả chi tiết về bài học đầu tiên của khóa học"
 *             is_free: true
 *             status: "draft"
 *     responses:
 *       201:
 *         description: Tạo bài học thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/lessons/course/{courseId}:
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
 *         description: ID của khóa học
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: is_free
 *         schema:
 *           type: boolean
 *         description: Lọc theo bài học miễn phí
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng item mỗi trang
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Lấy chi tiết bài học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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
 *         description: ID của bài học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 1000
 *               is_free:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *           example:
 *             title: "Bài học đã cập nhật"
 *             description: "Mô tả mới cho bài học"
 *             is_free: false
 *             status: "published"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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
 *         description: ID của bài học
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lesson deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */