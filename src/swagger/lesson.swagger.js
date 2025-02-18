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
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         order:
 *           type: number
 *         type:
 *           type: string
 *           enum: [video, article, quiz]
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *         is_free:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [draft, published]
 *         content:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *             video_url:
 *               type: string
 *             video_id:
 *               type: string
 *             questions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                   options:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         text:
 *                           type: string
 *                         is_correct:
 *                           type: boolean
 *                   explanation:
 *                     type: string
 *                   points:
 *                     type: number
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               file_id:
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
 *     summary: Create a new lesson
 *     description: Only course owner or admins can create lessons
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
 *                 description: |
 *                  - video: Requires video file upload
 *                  - article: Requires text content
 *                  - quiz: Requires questions array
 *               is_free:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               content:
 *                 type: object
 *                 oneOf:
 *                   - type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         description: Required for article type
 *                   - type: object
 *                     properties:
 *                       questions:
 *                         type: array
 *                         description: Required for quiz type
 *                         items:
 *                           type: object
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Required for video type
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     tags: [Lessons]
 *     summary: Update a lesson
 *     description: Only course owner or admins can update lessons
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
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               content:
 *                 type: object
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
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     tags: [Lessons]
 *     summary: Delete a lesson
 *     description: Only course owner or admins can delete lessons
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
 *         description: Lesson deleted successfully
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/lessons/{courseId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Get all lessons in a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 */

/**
 * @swagger
 * /api/lessons/{courseId}/{lessonId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Get lesson details
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
 *         description: Lesson details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 */ 