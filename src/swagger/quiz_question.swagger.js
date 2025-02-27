/**
 * @swagger
 * components:
 *   schemas:
 *     QuizQuestion:
 *       type: object
 *       required:
 *         - exam_id
 *         - question
 *         - answers
 *       properties:
 *         _id:
 *           type: string
 *         exam_id:
 *           type: string
 *         question:
 *           type: string
 *         video_id:
 *           type: string
 *           description: ID của video (nếu có)
 *         image_id:
 *           type: string
 *           description: ID của hình ảnh (nếu có)
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - text
 *               - is_correct
 *             properties:
 *               text:
 *                 type: string
 *               is_correct:
 *                 type: boolean
 *         explanation:
 *           type: string
 *         points:
 *           type: number
 *           default: 1
 */

/**
 * @swagger
 * /api/exams/{examId}/questions:
 *   post:
 *     tags: [Quiz Questions]
 *     summary: Tạo câu hỏi mới
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
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
 *               - question
 *               - answers
 *             properties:
 *               question:
 *                 type: string
 *               video:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *                 format: binary
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     is_correct:
 *                       type: boolean
 *               explanation:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tạo câu hỏi thành công
 *
 *   get:
 *     tags: [Quiz Questions]
 *     summary: Lấy danh sách câu hỏi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
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
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizQuestion'
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
 * /api/exams/{examId}/questions/{questionId}:
 *   get:
 *     tags: [Quiz Questions]
 *     summary: Lấy thông tin chi tiết câu hỏi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizQuestion'
 *
 *   put:
 *     tags: [Quiz Questions]
 *     summary: Cập nhật câu hỏi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
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
 *               question:
 *                 type: string
 *               video:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *                 format: binary
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     is_correct:
 *                       type: boolean
 *               explanation:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *
 *   delete:
 *     tags: [Quiz Questions]
 *     summary: Xóa câu hỏi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */ 