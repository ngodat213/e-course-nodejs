/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - instructor_id
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           description: Tiêu đề khóa học/bài kiểm tra
 *         description:
 *           type: string
 *           description: Mô tả chi tiết
 *         price:
 *           type: number
 *           description: Giá (0 cho miễn phí)
 *         instructor_id:
 *           type: string
 *           description: ID của giảng viên
 *         type:
 *           type: string
 *           enum: [course, exam]
 *           description: Loại (khóa học hoặc bài kiểm tra)
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *         total_duration:
 *           type: number
 *           description: Tổng thời lượng (phút)
 *         lesson_count:
 *           type: number
 *         student_count:
 *           type: number
 *         rating:
 *           type: number
 *         review_count:
 *           type: number
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         what_you_will_learn:
 *           type: array
 *           items:
 *             type: string
 *         thumbnail_id:
 *           type: string
 *           description: ID của ảnh thumbnail
 *         lessons:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID các bài học
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     CourseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/Course'
 *
 *     CourseList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
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
 *     CourseDeleteRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         course_id:
 *           type: string
 *           description: ID of the course to be deleted
 *         instructor_id:
 *           type: string
 *           description: ID of the instructor requesting deletion
 *         reason:
 *           type: string
 *           minLength: 10
 *           description: Reason for deletion request
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         admin_response:
 *           type: object
 *           properties:
 *             admin_id:
 *               type: string
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
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Lấy danh sách khóa học/bài kiểm tra
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [course, exam]
 *         description: Lọc theo loại
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *       - in: query
 *         name: search
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
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseList'
 *
 *   post:
 *     tags: [Courses]
 *     summary: Tạo khóa học/bài kiểm tra mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [course, exam]
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Lấy chi tiết khóa học/bài kiểm tra
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *
 *   put:
 *     tags: [Courses] 
 *     summary: Cập nhật khóa học/bài kiểm tra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [course, exam]
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               what_you_will_learn:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *
 *   delete:
 *     tags: [Courses]
 *     summary: Xóa khóa học/bài kiểm tra
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */

/**
 * @swagger
 * /api/courses/enroll/{id}:
 *   post:
 *     tags: [Courses]
 *     summary: Enroll in a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled in course
 */

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get user's enrolled courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /api/courses/{id}/delete-request:
 *   post:
 *     tags: [Courses]
 *     summary: Request to delete a course
 *     description: Only course instructors can request course deletion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Delete request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseDeleteRequest'
 *       400:
 *         description: A pending delete request already exists
 *       403:
 *         description: Not authorized to request deletion
 */

/**
 * @swagger
 * /api/courses/delete-requests:
 *   get:
 *     tags: [Courses]
 *     summary: Get all course delete requests
 *     description: Only admins can view delete requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
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
 *     responses:
 *       200:
 *         description: List of delete requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseDeleteRequest'
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
 *       403:
 *         description: Not authorized to view delete requests
 */

/**
 * @swagger
 * /api/courses/delete-requests/{requestId}:
 *   put:
 *     tags: [Courses]
 *     summary: Handle a course delete request
 *     description: Only admins can approve/reject delete requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
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
 *               - status
 *               - message
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               message:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Delete request handled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseDeleteRequest'
 *       400:
 *         description: Request has already been handled
 *       403:
 *         description: Not authorized to handle delete requests
 */ 