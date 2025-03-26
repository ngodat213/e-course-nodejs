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
 *         type:
 *           type: string
 *           enum: [quiz]
 *           description: Loại bài kiểm tra
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
 *           minLength: 10
 *           maxLength: 1000
 *         video_id:
 *           type: string
 *         image_id:
 *           type: string
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
 *                 minLength: 1
 *                 maxLength: 500
 *               is_correct:
 *                 type: boolean
 *           minItems: 2
 *           maxItems: 6
 *         explanation:
 *           type: string
 *           maxLength: 1000
 *         points:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 */

/**
 * @swagger
 * /api/exams/lessons/{lessonId}:
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
 *               - duration
 *               - passing_score
 *               - questions_per_exam
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 default: Bài kiểm tra
 *                 description: Tiêu đề của bài kiểm tra
 *               type:
 *                 type: string
 *                 enum: [quiz]
 *                 default: quiz
 *                 description: Loại nội dung (chỉ hỗ trợ quiz)
 *               duration:
 *                 type: number
 *                 description: Thời gian làm bài (phút)
 *               passing_score:
 *                 type: number
 *                 description: Điểm đạt tối thiểu (0-100)
 *               random_questions:
 *                 type: boolean
 *                 default: true
 *                 description: Có lấy câu hỏi ngẫu nhiên không
 *               questions_per_exam:
 *                 type: number
 *                 description: Số câu hỏi mỗi lần làm bài
 *               attempts_allowed:
 *                 type: number
 *                 default: -1
 *                 description: Số lần được phép làm bài (-1 là không giới hạn)
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: Trạng thái bài kiểm tra
 *           example:
 *             title: "Kiểm tra cuối kỳ"
 *             type: "quiz"
 *             duration: 60
 *             passing_score: 80
 *             questions_per_exam: 20
 *             random_questions: true
 *             attempts_allowed: 2
 *             status: "draft"
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *         description: Sắp xếp (ví dụ -createdAt)
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
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Tiêu đề của bài kiểm tra
 *               duration:
 *                 type: number
 *                 description: Thời gian làm bài (phút)
 *               passing_score:
 *                 type: number
 *                 description: Điểm đạt tối thiểu (0-100)
 *               random_questions:
 *                 type: boolean
 *                 description: Có lấy câu hỏi ngẫu nhiên không
 *               questions_per_exam:
 *                 type: number
 *                 description: Số câu hỏi mỗi lần làm bài
 *               attempts_allowed:
 *                 type: number
 *                 description: Số lần được phép làm bài (-1 là không giới hạn)
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Trạng thái bài kiểm tra
 *           example:
 *             title: "Kiểm tra cuối kỳ (Đã cập nhật)"
 *             duration: 90
 *             passing_score: 85
 *             status: "published"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *           example:
 *             answers:
 *               "questionId1": "answerId1"
 *               "questionId2": "answerId2"
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
 *                   description: Điểm số (0-100)
 *                 passed:
 *                   type: boolean
 *                   description: Đạt hay không đạt
 *                 total_questions:
 *                   type: number
 *                   description: Tổng số câu hỏi
 *                 correct_answers:
 *                   type: number
 *                   description: Số câu trả lời đúng
 */

/**
 * @swagger
 * /api/exams/{examId}/questions
 *   post:
 *     tags: [Exams]
 *     summary: Tạo câu hỏi mới cho bài kiểm tra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài kiểm tra
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
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Nội dung câu hỏi
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: File video (nếu có)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh (nếu có)
 *               answers:
 *                 type: string
 *                 description: |
 *                   Chuỗi JSON chứa danh sách các đáp án hợp lệ.
 *                   **Định dạng JSON bắt buộc**: Phải là một mảng JSON chứa các object đáp án, ví dụ:
 *                   ```json
 *                   [
 *                     { "text": "Facebook", "is_correct": false },
 *                     { "text": "Google", "is_correct": true },
 *                     { "text": "Microsoft", "is_correct": false },
 *                     { "text": "Apple", "is_correct": false }
 *                   ]
 *                   ```
 *               explanation:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Giải thích đáp án (nếu có)
 *               points:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 1
 *                 description: Điểm số cho câu hỏi
 *           example:
 *             question: "Công ty nào phát triển hệ điều hành Android?"
 *             answers: '[{"text":"Facebook","is_correct":false},{"text":"Google","is_correct":true},{"text":"Microsoft","is_correct":false},{"text":"Apple","is_correct":false}]'
 *             explanation: "Android được phát triển bởi Google từ năm 2005"
 *             points: 1
 *           encoding:
 *             video:
 *               contentType: video/*
 *             image:
 *               contentType: image/*
 *     responses:
 *       201:
 *         description: Tạo câu hỏi thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamQuestion'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy bài kiểm tra
 *
 *   get:
 *     tags: [Exams]
 *     summary: Lấy danh sách câu hỏi của bài kiểm tra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài kiểm tra
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamQuestion'
 *
 * /api/exams/{examId}/questions/{questionId}:
 *   put:
 *     tags: [Exams]
 *     summary: Cập nhật câu hỏi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài kiểm tra
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của câu hỏi
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Nội dung câu hỏi
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: File video (nếu có)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh (nếu có)
 *               answers:
 *                 type: string
 *                 description: |
 *                   Mảng JSON chứa các đáp án. Có thể gửi theo 2 định dạng:
 *                   1. Mảng trực tiếp: [{"text":"Đáp án 1","is_correct":false},{"text":"Đáp án 2","is_correct":true}]
 *                   2. Object có property answers: {"answers":[{"text":"Đáp án 1","is_correct":false},{"text":"Đáp án 2","is_correct":true}]}
 *               explanation:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Giải thích đáp án (nếu có)
 *               points:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Điểm số cho câu hỏi
 *           encoding:
 *             video:
 *               contentType: video/*
 *             image:
 *               contentType: image/*
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamQuestion'
 *
 *   delete:
 *     tags: [Exams]
 *     summary: Xóa câu hỏi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài kiểm tra
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của câu hỏi
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
 *                 message:
 *                   type: string
 *
 * /api/exams/{examId}/questions/{questionId}:
 *   get:
 *     tags: [Exams]
 *     summary: Lấy chi tiết câu hỏi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài kiểm tra
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của câu hỏi
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamQuestion'
 */ 