/**
 * @swagger
 * tags:
 *   name: UserProgress
 *   description: Quản lý tiến độ học tập của người dùng
 * 
 * components:
 *   schemas:
 *     UserProgress:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của progress
 *         user_id:
 *           type: string
 *           description: ID của người dùng
 *         course_id:
 *           type: string
 *           description: ID của khóa học
 *         lesson_id:
 *           type: string
 *           description: ID của bài học
 *         content_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             type:
 *               type: string
 *             duration:
 *               type: number
 *             order:
 *               type: number
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *           description: Trạng thái học tập
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 * /api/progress/course/{courseId}:
 *   get:
 *     tags: [UserProgress]
 *     summary: Lấy tất cả progress trong một khóa học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khóa học
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProgress'
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy khóa học
 *
 * /api/progress/lesson/{lessonId}/contents:
 *   get:
 *     tags: [UserProgress]
 *     summary: Lấy tất cả content và progress của một bài học
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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   content:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       type:
 *                         type: string
 *                       duration:
 *                         type: number
 *                       order:
 *                         type: number
 *                   progress:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [not_started, in_progress, completed]
 *
 * /api/progress/content/{contentId}:
 *   get:
 *     tags: [UserProgress]
 *     summary: Lấy progress của một content
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của content
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *
 *   put:
 *     tags: [UserProgress]
 *     summary: Cập nhật trạng thái của content
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của content cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed]
 *                 description: |
 *                   Trạng thái của content:
 *                   * not_started - Chưa bắt đầu
 *                   * in_progress - Đang học
 *                   * completed - Đã hoàn thành
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *
 * /api/progress/content/{contentId}/complete:
 *   post:
 *     tags: [UserProgress]
 *     summary: Đánh dấu content đã hoàn thành
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của content
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *
 * /api/progress/course/{courseId}/content/{contentId}:
 *   post:
 *     tags: [UserProgress]
 *     summary: Tạo progress mới cho một content
 *     description: Tạo progress mới để người dùng có thể học bất kỳ content nào trong khóa học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khóa học
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của content
 *     responses:
 *       201:
 *         description: Tạo progress thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *       400:
 *         description: Lỗi dữ liệu (content không thuộc khóa học, progress đã tồn tại, ...)
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy khóa học hoặc content
 */ 