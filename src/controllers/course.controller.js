const BaseController = require('./base.controller');
const CourseService = require('../services/course.service');
const { success } = require("../utils/logger");
const CloudinaryService = require("../services/cloudinary.service");

class CourseController extends BaseController {
  constructor() {
    super();
  }

  async getAll(req, res, next) {
    try {
      const courses = await CourseService.getAll(req.query);
      this.successResponse(res, courses);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getById(req, res, next) {
    try {
      const course = await CourseService.getCourseById(req.params.id);
      this.successResponse(res, course);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async update(req, res, next) {
    try {
      const course = await CourseService.update(req.params.id, req.body);
      this.successResponse(res, course);
    } catch (error) {
      this.handleError(error, next);  
    }
  }

  async create(req, res, next) {
    try {
      const course = await CourseService.create(req.body, req.file, req.user.id);
      this.logInfo('Course created', { id: course._id });
      this.createdResponse(res, course);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async enrollCourse(req, res, next) {
    try {
      const result = await CourseService.enrollCourse(
        req.params.id,
        req.user._id
      );
      this.logInfo('Course enrolled', {
        courseId: req.params.id,
        userId: req.user._id
      });
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getMyCourses(req, res, next) {
    try {
      const courses = await CourseService.getUserCourses(req.user._id);
      this.successResponse(res, courses);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async requestDelete(req, res, next) {
    try {
      const result = await CourseService.createDeleteRequest(
        req.params.courseId,
        req.user.id,
        req.body.reason
      );
      this.logInfo("Course delete requested", {
        courseId: req.params.courseId,
        userId: req.user.id,
      });
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getDeleteRequests(req, res, next) {
    try {
      const requests = await CourseService.getDeleteRequests(req.query);
      this.successResponse(res, requests);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async handleDeleteRequest(req, res, next) {
    try {
      const result = await CourseService.handleDeleteRequest(
        req.params.requestId,
        req.user._id,
        req.body
      );
      success.info("Delete request handled", {
        requestId: req.params.requestId,
        adminId: req.user._id,
        status: req.body.status,
      });
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new CourseController();
