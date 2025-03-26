const express = require('express');
const router = express.Router();
const LessonContentController = require('../controllers/lesson_content.controller');
const { verifyToken, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { lessonContentSchema } = require('../validators/lesson.validator');

// Tất cả routes đều yêu cầu xác thực
router.use(verifyToken);

// Routes cho instructor
router.post('/:lessonId/contents',
  restrictTo('instructor', 'admin'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]),
  // validateRequest(lessonContentSchema),
  (req, res, next) => LessonContentController.createContent(req, res, next)
);

router.put('/:lessonId/contents/:contentId',
  restrictTo('instructor', 'admin'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]),
  (req, res, next) => LessonContentController.updateContent(req, res, next)
);

router.delete('/:lessonId/contents/:contentId',
  restrictTo('instructor', 'admin'),
  (req, res, next) => LessonContentController.deleteContent(req, res, next)
);

router.put('/:lessonId/contents/:contentId/order',
  restrictTo('instructor', 'admin'),
  (req, res, next) => LessonContentController.updateContentOrder(req, res, next)
);

// Routes cho student
router.get('/:lessonId/contents',
  (req, res, next) => LessonContentController.getContentsByLesson(req, res, next)
);

router.get('/:lessonId/contents/:contentId',
  (req, res, next) => LessonContentController.getContentById(req, res, next)
);

module.exports = router; 