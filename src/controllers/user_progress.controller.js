const BaseController = require("./base.controller");
const UserProgressService = require("../services/user_progress.service");

class UserProgressController extends BaseController {
  constructor() {
    super();
  }

  async getAll(req, res, next) {
    try {
      const { courseId } = req.params;
      const result = await UserProgressService.getAll(req.user.id, courseId);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateProgress(req, res, next) {
    try {
      const { contentId } = req.params;
      const result = await UserProgressService.updateProgress(
        req.user.id,
        contentId,
        req.body
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async markContentComplete(req, res, next) {
    try {
      const { contentId } = req.params;
      const result = await UserProgressService.markContentComplete(
        req.user.id,
        contentId
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getProgressByContent(req, res, next) {
    try {
      const { contentId } = req.params;
      const result = await UserProgressService.getProgressByContent(
        req.user.id,
        contentId
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async createProgress(req, res, next) {
    try {
      const { courseId, contentId } = req.params;
      const result = await UserProgressService.createProgress(
        req.user.id,
        courseId,
        contentId
      );
      this.createdResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getAllLessonContents(req, res, next) {
    try {
      const { lessonId } = req.params;
      const result = await UserProgressService.getAllLessonContents(
        req.user.id,
        lessonId
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new UserProgressController(); 