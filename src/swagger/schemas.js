/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         role:
 *           type: string
 *           enum: [student, instructor, admin]
 *           default: student
 *         status:
 *           type: string
 *           enum: [pending, active, blocked]
 *           default: pending
 *         profile_picture:
 *           type: string
 *           description: User's avatar URL
 *           default: Default avatar URL from environment variable
 *         profile_picture_id:
 *           type: string
 *           description: Cloudinary public ID of the avatar
 *           nullable: true
 *     
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           description: Course title
 *         description:
 *           type: string
 *           description: Course description
 *         price:
 *           type: number
 *           description: Course price
 *         instructor_id:
 *           type: string
 *           description: ID of instructor
 *         thumbnail:
 *           type: string
 *           nullable: true
 *     
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *     
 *     Success:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 */ 