const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/exam.controller');
const QuizQuestionController = require('../controllers/quiz_question.controller');
const { verifyToken, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const {
    createExamSchema,
    updateExamSchema,
    submitExamSchema
} = require('../validators/exam.validator');
const {
    createQuestionSchema,
    updateQuestionSchema
} = require('../validators/exam_question.validator');

// Tất cả routes yêu cầu xác thực
router.use(verifyToken);

// Routes cho exam
router.post(
    '/lessons/:lessonId/exams',
    restrictTo(['instructor', 'admin']),
    validateRequest(createExamSchema),
    (req, res, next) => ExamController.createExam(req, res, next)
);

router.get(
    '/lessons/:lessonId/exams',
    (req, res, next) => ExamController.getExamsByLesson(req, res, next)
);

router.get(
    '/exams/:examId',
    (req, res, next) => ExamController.getExam(req, res, next)
);

router.put(
    '/exams/:examId',
    restrictTo(['instructor', 'admin']),
    validateRequest(updateExamSchema),
    (req, res, next) => ExamController.updateExam(req, res, next)
);

router.delete(
    '/exams/:examId',
    restrictTo(['instructor', 'admin']),
    (req, res, next) => ExamController.deleteExam(req, res, next)
);

// Routes cho exam questions
router.post(
    '/exams/:examId/questions',
    restrictTo(['instructor', 'admin']),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    validateRequest(createQuestionSchema),
    (req, res, next) => QuizQuestionController.create(req, res, next)
);

router.get(
    '/exams/:examId/questions',
    (req, res, next) => QuizQuestionController.findAll(req, res, next)
);

router.get(
    '/exams/:examId/questions/:questionId',
    (req, res, next) => QuizQuestionController.findOne(req, res, next)
);

router.put(
    '/exams/:examId/questions/:questionId',
    restrictTo(['instructor', 'admin']),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    validateRequest(updateQuestionSchema),
    (req, res, next) => QuizQuestionController.update(req, res, next)
);

router.delete(
    '/exams/:examId/questions/:questionId',
    restrictTo(['instructor', 'admin']),
    (req, res, next) => QuizQuestionController.delete(req, res, next)
);

// Routes cho taking exam
router.post(
    '/exams/:examId/start',
    (req, res, next) => ExamController.startExam(req, res, next)
);

router.post(
    '/exams/:examId/submit',
    validateRequest(submitExamSchema),
    (req, res, next) => ExamController.submitExam(req, res, next)
);

module.exports = router; 