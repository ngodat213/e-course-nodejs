/**
 * @swagger
 * tags:
 *   name: LessonContents
 *   description: Quản lý nội dung bài học
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonContent:
 *       type: object
 *       required:
 *         - lesson_id
 *         - title
 *         - type
 *         - order
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của nội dung bài học
 *         lesson_id:
 *           type: string
 *           description: ID của bài học
 *         title:
 *           type: string
 *           description: Tiêu đề của nội dung
 *         description:
 *           type: string
 *           description: Mô tả chi tiết của nội dung
 *         type:
 *           type: string
 *           enum: [video, document, quiz]
 *           description: Loại nội dung
 *         order:
 *           type: number
 *           description: Thứ tự của nội dung trong bài học
 *         duration:
 *           type: number
 *           description: Thời lượng (cho video)
 *         video:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             file_url:
 *               type: string
 *             metadata:
 *               type: object
 *         quiz:
 *           type: object
 *           description: Chi tiết quiz (nếu type là quiz)
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
 *         requirements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               title:
 *                 type: string
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *           description: Trạng thái của nội dung
 *         version:
 *           type: number
 *           default: 1
 *           description: Phiên bản của nội dung
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateLessonContentRequest:
 *       type: object
 *       required:
 *         - title
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Tiêu đề nội dung
 *         description:
 *           type: string
 *           description: Mô tả chi tiết
 *         type:
 *           type: string
 *           enum: [video, document, quiz]
 *           description: Loại nội dung
 *         quiz_id:
 *           type: string
 *           description: ID của quiz (required nếu type là quiz)
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID các bài học yêu cầu
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *           description: Trạng thái nội dung
 *
 *     UpdateLessonContentRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *         description:
 *           type: string
 *         quiz_id:
 *           type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         removeAttachments:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID các file cần xóa
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *
 *     UpdateOrderRequest:
 *       type: object
 *       required:
 *         - order
 *       properties:
 *         order:
 *           type: number
 *           minimum: 1
 *           description: Thứ tự mới của nội dung
 *
 *     LessonContentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/LessonContent'
 *         message:
 *           type: string
 *
 *     LessonContentsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LessonContent'
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
 */

/**
 * @swagger
 * /api/lesson-contents/{lessonId}/contents:
 *   post:
 *     tags: [LessonContents]
 *     summary: Tạo nội dung mới cho bài học
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
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CreateLessonContentRequest'
 *               - type: object
 *                 properties:
 *                   video:
 *                     type: string
 *                     format: binary
 *                     description: File video (required nếu type là video)
 *                   attachments:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *                     description: Các file đính kèm
 *     responses:
 *       201:
 *         description: Tạo nội dung thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonContentResponse'
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
 *     tags: [LessonContents]
 *     summary: Lấy danh sách nội dung của bài học
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [video, document, quiz]
 *         description: Lọc theo loại nội dung
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Lọc theo trạng thái
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
 *               $ref: '#/components/schemas/LessonContentsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/lesson-contents/{lessonId}/contents/{contentId}:
 *   get:
 *     tags: [LessonContents]
 *     summary: Lấy chi tiết một nội dung
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonContentResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     tags: [LessonContents]
 *     summary: Cập nhật nội dung bài học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/UpdateLessonContentRequest'
 *               - type: object
 *                 properties:
 *                   video:
 *                     type: string
 *                     format: binary
 *                   attachments:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonContentResponse'
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
 *     tags: [LessonContents]
 *     summary: Xóa nội dung bài học
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung
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
 * /api/lesson-contents/{lessonId}/contents/{contentId}/order:
 *   put:
 *     tags: [LessonContents]
 *     summary: Cập nhật thứ tự nội dung
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài học
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderRequest'
 *     responses:
 *       200:
 *         description: Cập nhật thứ tự thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonContentResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */ 