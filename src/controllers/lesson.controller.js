const BaseController = require("./base.controller");
const LessonService = require("../services/lesson.service");

class LessonController extends BaseController {
  constructor() {
    super();
  }

  async createLesson(req, res, next) {
    try {
      const { id } = req.params;
      const result = await LessonService.createLesson(
        id,
        req.body,
        req.files
      );
      this.createdResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateLesson(req, res, next) {
    try {
      const { lessonId } = req.params;
      const result = await LessonService.updateLesson(
        lessonId,
        req.body,
        req.files
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async deleteLesson(req, res, next) {
    try {
      const { lessonId } = req.params;
      await LessonService.deleteLesson(lessonId);
      this.successResponse(res, { message: "Lesson deleted successfully" });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getLessonById(req, res, next) {
    try {
      const { lessonId } = req.params;
      const result = await LessonService.getLessonById(lessonId);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getLessonsByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const result = await LessonService.getLessonsByCourse(courseId, req.query);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateLessonOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { order } = req.body;
      const result = await LessonService.updateLessonOrder(id, order);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new LessonController(); 