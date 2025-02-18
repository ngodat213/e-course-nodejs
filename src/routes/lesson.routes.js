const express = require('express');
const router = express.Router();
const LessonController = require('../controllers/lesson.controller');
const { verifyToken, restrictTo, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { validateLessonContent } = require('../validators/lesson.validator');
const Course = require('../models/course.model');

// Tất cả routes đều yêu cầu xác thực
router.use(verifyToken);

// Routes cho instructor
router.post('/:courseId',
    restrictTo('instructor', 'admin', 'super_admin'),
    isOwnerOrAdmin(Course),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    validateLessonContent,
    LessonController.createLesson
);

router.put('/:id',
    restrictTo('instructor', 'admin', 'super_admin'),
    isOwnerOrAdmin(Course),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    validateLessonContent,
    LessonController.updateLesson
);

router.delete('/:id',
    restrictTo('instructor', 'admin', 'super_admin'),
    isOwnerOrAdmin(Course),
    LessonController.deleteLesson
);

// Routes cho student
router.get('/:courseId',
    LessonController.getLessonsByCourse
);

router.get('/:courseId/:lessonId',
    LessonController.getLessonById
);

module.exports = router; 