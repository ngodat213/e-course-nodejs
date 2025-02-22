const express = require('express');
const router = express.Router();
const LessonController = require('../controllers/lesson.controller');
const { verifyToken, restrictTo, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { lessonContentSchema, lessonOrderSchema } = require('../validators/lesson.validator');
const Course = require('../models/course.model');

// Tất cả routes đều yêu cầu xác thực
router.use(verifyToken);

// Custom middleware để validate lesson content
const validateLessonContent = (req, res, next) => {
    try {
        const { type } = req.body;
        // const schema = lessonContentSchema(type);
        // const { error } = schema.validate(req.body);
        // if (error) {
        //     throw error;
        // }
        next();
    } catch (error) {
        next(error);
    }
};

// Routes cho instructor
router.post('/:id',
    restrictTo('instructor', 'admin'),
    isOwnerOrAdmin(Course),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    validateLessonContent,
    (req, res, next) => {
        LessonController.createLesson(req, res, next);
    },
);

router.put('/:lessonId',
    restrictTo(['instructor', 'admin']),
    isOwnerOrAdmin(Course),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    validateLessonContent,
    (req, res, next) => {
        LessonController.updateLesson(req, res, next);
    }
);

router.delete('/:lessonId',
    restrictTo(['instructor', 'admin']),
    isOwnerOrAdmin(Course),
    (req, res, next) => {
        LessonController.deleteLesson(req, res, next);
    }
);

router.put('/:lessonId/order',
    restrictTo(['instructor', 'admin']),
    isOwnerOrAdmin(Course),
    validateRequest(lessonOrderSchema),
    (req, res, next) => {
        LessonController.updateLessonOrder(req, res, next);
    }
);

// Routes cho student
router.get('/:courseId', (req, res, next) => LessonController.getLessonsByCourse(req, res, next));
router.get('/:courseId/:lessonId', (req, res, next) => LessonController.getLessonById(req, res, next));

module.exports = router; 