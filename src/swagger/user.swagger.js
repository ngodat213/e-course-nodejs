/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload user avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file format or size
 */

/**
 * @swagger
 * /api/users/set-role:
 *   post:
 *     tags: [Users]
 *     summary: Set user role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of user to update
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *                 description: New role to set
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/users/info:
 *   get:
 *     tags: [Users]
 *     summary: Get detailed user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     profile_picture:
 *                       type: string
 *                     enrolled_courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *                     teaching_courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           message:
 *                             type: string
 *                           read:
 *                             type: boolean
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                 stats:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: object
 *                       properties:
 *                         total_courses:
 *                           type: number
 *                         total_students:
 *                           type: number
 *                         total_revenue:
 *                           type: number
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: number
 *                     ratings:
 *                       type: object
 *                       properties:
 *                         average_rating:
 *                           type: number
 *                         total_reviews:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */ 