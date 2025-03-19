const express = require('express');
const router = express.Router();
const UserProgressController = require('../controllers/user_progress.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { updateProgressSchema } = require('../validators/user_progress.validator');

// Tất cả routes đều yêu cầu xác thực
router.use(verifyToken);

// Tạo progress mới cho một content
router.post('/course/:courseId/content/:contentId', (req, res, next) => 
  UserProgressController.createProgress(req, res, next)
);

// Lấy tất cả progress của user trong một khóa học
router.get('/course/:courseId', (req, res, next) => 
  UserProgressController.getAll(req, res, next)
);

// Lấy tất cả content và progress của một lesson
router.get('/lesson/:lessonId/contents', (req, res, next) => 
  UserProgressController.getAllLessonContents(req, res, next)
);

// Lấy progress của một content cụ thể
router.get('/content/:contentId', (req, res, next) => 
  UserProgressController.getProgressByContent(req, res, next)
);

// Cập nhật progress của một content
router.put('/content/:contentId', 
  validateRequest(updateProgressSchema),
  (req, res, next) => UserProgressController.updateProgress(req, res, next)
);

// Đánh dấu content đã hoàn thành
router.post('/content/:contentId/complete', (req, res, next) => 
  UserProgressController.markContentComplete(req, res, next)
);

module.exports = router; 