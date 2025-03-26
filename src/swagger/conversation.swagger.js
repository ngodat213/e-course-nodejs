/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của conversation
 *         type:
 *           type: string
 *           enum: [direct, group]
 *           description: Loại conversation (direct hoặc group)
 *         name:
 *           type: string
 *           description: Tên của group chat
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   avatar:
 *                     type: string
 *               role:
 *                 type: string
 *                 enum: [admin, instructor, student]
 *               joinedAt:
 *                 type: string
 *                 format: date-time
 *         courseId:
 *           type: string
 *           description: ID của khóa học (chỉ áp dụng với group chat)
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         conversation:
 *           type: string
 *           description: ID của conversation
 *         sender:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             avatar:
 *               type: string
 *         content:
 *           type: string
 *         contentType:
 *           type: string
 *           enum: [text, image, file]
 *         fileInfo:
 *           type: object
 *           description: Thông tin file đính kèm (chỉ khi contentType là image hoặc file)
 *           properties:
 *             fileId:
 *               type: string
 *               description: ID của file trong bảng CloudinaryFile
 *             url:
 *               type: string
 *               description: URL của file trên Cloudinary
 *             publicId:
 *               type: string
 *               description: Public ID của file trên Cloudinary
 *             width:
 *               type: number
 *               description: Chiều rộng của hình ảnh
 *             height:
 *               type: number
 *               description: Chiều cao của hình ảnh
 *             format:
 *               type: string
 *               description: Định dạng file (jpg, png, etc.)
 *             size:
 *               type: number
 *               description: Kích thước file (bytes)
 *         readBy:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               readAt:
 *                 type: string
 *                 format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: API để quản lý chat và tin nhắn
 */

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Lấy danh sách conversations của user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   get:
 *     summary: Lấy danh sách tin nhắn của một conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của conversation
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
 *           default: 20
 *         description: Số lượng tin nhắn mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy conversation
 */

/**
 * @swagger
 * /api/conversations/message:
 *   post:
 *     summary: Gửi tin nhắn trong một conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - content
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID của conversation
 *               content:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *               contentType:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *                 description: Loại nội dung tin nhắn
 *     responses:
 *       200:
 *         description: Tin nhắn đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy conversation
 */

/**
 * @swagger
 * /api/conversations/{conversationId}/read:
 *   post:
 *     summary: Đánh dấu tất cả tin nhắn đã đọc
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của conversation
 *     responses:
 *       200:
 *         description: Tin nhắn đã được đánh dấu đã đọc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Messages marked as read
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy conversation
 */

/**
 * @swagger
 * /api/conversations/direct/{instructorId}:
 *   get:
 *     summary: Lấy hoặc tạo chat 1-1 với instructor
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instructorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của instructor
 *     responses:
 *       200:
 *         description: Thông tin conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/conversations/group-access/{courseId}:
 *   get:
 *     summary: Kiểm tra quyền tham gia group chat của khóa học
 *     tags: [Conversations]
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
 *         description: Thông tin quyền tham gia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     canJoin:
 *                       type: boolean
 *                     alreadyJoined:
 *                       type: boolean
 *                     conversationId:
 *                       type: string
 *                     message:
 *                       type: string
 *       401:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/conversations/join-group:
 *   post:
 *     summary: Tham gia vào group chat của khóa học
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID của khóa học
 *     responses:
 *       200:
 *         description: Kết quả tham gia group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     conversationId:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Chưa mua khóa học
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy khóa học
 */

/**
 * @swagger
 * /api/conversations/message/image:
 *   post:
 *     summary: Upload và gửi tin nhắn hình ảnh
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - image
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID của conversation
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh cần gửi
 *               caption:
 *                 type: string
 *                 description: Chú thích cho hình ảnh (không bắt buộc)
 *     responses:
 *       200:
 *         description: Tin nhắn hình ảnh đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không có file
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy conversation
 */ 