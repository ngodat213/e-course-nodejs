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
 *       properties:
 *         _id:
 *           type: string
 *         course_id:
 *           type: string
 *           description: ID của khóa học
 *         title:
 *           type: string
 *           description: Tiêu đề bài học
 *         description:
 *           type: string
 *           description: Mô tả bài học
 *         order:
 *           type: number
 *           description: Thứ tự bài học trong khóa
 *         type:
 *           type: string
 *           enum: [video, article, quiz]
 *           description: Loại bài học
 *         duration:
 *           type: number
 *           description: Thời lượng (phút)
 *         is_free:
 *           type: boolean
 *           description: Bài học miễn phí
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           description: Trạng thái bài học
 *         content:
 *           type: string
 *           description: Nội dung HTML cho bài viết
 *         video:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             file_url:
 *               type: string
 *             metadata:
 *               type: object
 *               properties:
 *                 duration:
 *                   type: number
 *                 width:
 *                   type: number
 *                 height:
 *                   type: number
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               file_url:
 *                 type: string
 *               original_name:
 *                 type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/lessons/{courseId}:
 *   post:
 *     tags: [Lessons]
 *     summary: Tạo bài học mới
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, article, quiz]
 *               is_free:
 *                 type: boolean
 *               content:
 *                 type: string
 *               video:
 *                 type: string
 *                 format: binary
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Tạo bài học thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *
 *   get:
 *     tags: [Lessons]
 *     summary: Lấy danh sách bài học của khóa học
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
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
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     pages:
 *                       type: number
 */

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Lấy chi tiết bài học
 *     parameters:
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
 *
 *   put:
 *     tags: [Lessons]
 *     summary: Cập nhật bài học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, article, quiz]
 *               is_free:
 *                 type: boolean
 *               content:
 *                 type: string
 *               video:
 *                 type: string
 *                 format: binary
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *
 *   delete:
 *     tags: [Lessons]
 *     summary: Xóa bài học
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
 *     summary: Thay đổi thứ tự bài học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
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
 */