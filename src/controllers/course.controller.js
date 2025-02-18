const CourseService = require('../services/course.service');
const { success } = require('../utils/logger');

class CourseController {
    // Public endpoints
    async getAllCourses(req, res, next) {
        try {
            const courses = await CourseService.getAllCourses(req.query);
            res.success(courses);
        } catch (error) {
            next(error);
        }
    }

    async getCourseById(req, res, next) {
        try {
            const course = await CourseService.getCourseById(req.params.id);
            res.success(course);
        } catch (error) {
            next(error);
        }
    }

    // Student endpoints
    async enrollCourse(req, res, next) {
        try {
            const result = await CourseService.enrollCourse(req.params.id, req.user._id);
            success.info('Course enrolled', { 
                userId: req.user._id,
                courseId: req.params.id 
            });
            res.success(result);
        } catch (error) {
            next(error);
        }
    }

    async getMyCourses(req, res, next) {
        try {
            const courses = await CourseService.getUserCourses(req.user._id);
            res.success(courses);
        } catch (error) {
            next(error);
        }
    }

    // Instructor endpoints
    async createCourse(req, res, next) {
        try {
            const courseData = {
                ...req.body,
                instructor_id: req.user._id
            };
            const course = await CourseService.createCourse(courseData);
            success.info('Course created', { 
                instructorId: req.user._id,
                courseId: course._id 
            });
            res.created(course);
        } catch (error) {
            next(error);
        }
    }

    async updateCourse(req, res, next) {
        try {
            const course = await CourseService.updateCourse(req.params.id, req.body);
            success.info('Course updated', { 
                instructorId: req.user._id,
                courseId: req.params.id 
            });
            res.success(course);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req, res, next) {
        try {
            await CourseService.deleteCourse(req.params.id);
            success.info('Course deleted', { 
                instructorId: req.user._id,
                courseId: req.params.id 
            });
            res.success({ message: 'Xóa khóa học thành công' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CourseController(); 