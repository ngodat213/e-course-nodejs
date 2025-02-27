/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Quản lý bài kiểm tra
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       required:
 *         - lesson_id
 *         - title
 *         - description
 *         - duration
 *         - passing_score
 *         - questions_per_exam
 *       properties:
 *         _id:
 *           type: string
 *         lesson_id:
 *           type: string
 *           description: ID của bài học chứa bài kiểm tra
 *         title:
 *           type: string
 *           description: Tiêu đề bài kiểm tra
 *         description:
 *           type: string
 *           description: Mô tả bài kiểm tra
 *         duration:
 *           type: number
 *           description: Thời gian làm bài (phút)
 *         passing_score:
 *           type: number
 *           description: Điểm đạt tối thiểu (0-100)
 *         total_questions:
 *           type: number
 *           description: Tổng số câu hỏi
 *         random_questions:
 *           type: boolean
 *           description: Có lấy câu hỏi ngẫu nhiên không
 *         questions_per_exam:
 *           type: number
 *           description: Số câu hỏi mỗi lần làm bài
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *         attempts_allowed:
 *           type: number
 *           description: Số lần được phép làm bài (-1 là không giới hạn)
 *
 *     ExamQuestion:
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
 *         image_id:
 *           type: string
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               is_correct:
 *                 type: boolean
 *         explanation:
 *           type: string
 *         points:
 *           type: number
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/exams:
 *   post:
 *     tags: [Exams]
 *     summary: Tạo bài kiểm tra mới
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
 *               - title
 *               - description
 *               - duration
 *               - passing_score
 *               - questions_per_exam
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *               passing_score:
 *                 type: number
 *               random_questions:
 *                 type: boolean
 *               questions_per_exam:
 *                 type: number
 *               attempts_allowed:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *
 *   get:
 *     tags: [Exams]
 *     summary: Lấy danh sách bài kiểm tra của một bài học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học
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
 *         description: Sắp xếp (ví dụ -createdAt, title)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Exam'
 *                       - type: object
 *                         properties:
 *                           question_count:
 *                             type: number
 *                             description: Số lượng câu hỏi
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
 * /api/exams/{examId}:
 *   get:
 *     tags: [Exams]
 *     summary: Lấy chi tiết bài kiểm tra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: include_questions
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *
 *   put:
 *     tags: [Exams]
 *     summary: Cập nhật bài kiểm tra
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *               passing_score:
 *                 type: number
 *               random_questions:
 *                 type: boolean
 *               questions_per_exam:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               attempts_allowed:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *
 *   delete:
 *     tags: [Exams]
 *     summary: Xóa bài kiểm tra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

/**
 * @swagger
 * /api/exams/{examId}/start:
 *   post:
 *     tags: [Exams]
 *     summary: Bắt đầu làm bài kiểm tra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exam_id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 duration:
 *                   type: number
 *                 total_questions:
 *                   type: number
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       question:
 *                         type: string
 *                       video_id:
 *                         type: string
 *                       image_id:
 *                         type: string
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             text:
 *                               type: string
 *                       points:
 *                         type: number
 */

/**
 * @swagger
 * /api/exams/{examId}/submit:
 *   post:
 *     tags: [Exams]
 *     summary: Nộp bài kiểm tra
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       200:
 *         description: Nộp bài thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                 passed:
 *                   type: boolean
 *                 total_questions:
 *                   type: number
 *                 correct_answers:
 *                   type: number
 */ 