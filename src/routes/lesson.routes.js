const express = require('express');
const router = express.Router();
const LessonController = require('../controllers/lesson.controller');
const { verifyToken, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { createLessonSchema, updateLessonSchema, lessonOrderSchema } = require('../validators/lesson.validator');

// Tất cả routes đều yêu cầu xác thực
router.use(verifyToken);

// Routes cho instructor/admin
router.post('/',
  restrictTo('instructor', 'admin'),
  validateRequest(createLessonSchema),
  (req, res, next) => LessonController.createLesson(req, res, next)
);

router.put('/:lessonId',
  restrictTo('instructor', 'admin'),
  validateRequest(updateLessonSchema),
  (req, res, next) => LessonController.updateLesson(req, res, next)
);

router.delete('/:lessonId',
  restrictTo('instructor', 'admin'),
  (req, res, next) => LessonController.deleteLesson(req, res, next)
);

/**
 * @route PUT /api/lessons/:lessonId/order
 * @desc Cập nhật thứ tự của lesson
 * @access Private
 */
router.put('/:lessonId/order',
  restrictTo('instructor', 'admin'),
  validateRequest(lessonOrderSchema),
  (req, res, next) => LessonController.updateLessonOrder(req, res, next)
);

// Routes cho tất cả users
router.get('/course/:courseId',
  (req, res, next) => LessonController.getLessonsByCourse(req, res, next)
);

router.get('/:lessonId',
  (req, res, next) => LessonController.getLessonById(req, res, next)
);

module.exports = router; 