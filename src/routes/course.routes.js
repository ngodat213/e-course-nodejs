const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/course.controller');
const { verifyToken, restrictTo, isOwner } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { courseSchema } = require('../validators/course.validator');
const Course = require('../models/course.model');

// Public routes
router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getCourseById);

// Protected routes
router.use(verifyToken);

// Student routes
router.post('/enroll/:id', CourseController.enrollCourse);
router.get('/my-courses', CourseController.getMyCourses);

// Instructor routes
router.use(restrictTo('instructor', 'admin'));
router.post('/', validateRequest(courseSchema), CourseController.createCourse);
router.put('/:id', isOwner(Course), validateRequest(courseSchema), CourseController.updateCourse);
router.delete('/:id', isOwner(Course), CourseController.deleteCourse);

module.exports = router; 