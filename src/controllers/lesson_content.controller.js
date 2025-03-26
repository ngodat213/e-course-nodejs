const BaseController = require('./base.controller');
const LessonContentService = require('../services/lesson_content.service');

class LessonContentController extends BaseController {
  async createContent(req, res, next) {
    try {
      const { lessonId } = req.params;
      const result = await LessonContentService.createContent(
        lessonId,
        req.body,
        req.files
      );
      this.createdResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateContent(req, res, next) {
    try {
      const { contentId } = req.params;
      const result = await LessonContentService.updateContent(
        contentId,
        req.body,
        req.files
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getContentsByLesson(req, res, next) {
    try {
      const { lessonId } = req.params;
      const result = await LessonContentService.getContentsByLesson(
        lessonId,
        req.query
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getContentById(req, res, next) {
    try {
      const { contentId } = req.params;
      const result = await LessonContentService.getContentById(contentId);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async deleteContent(req, res, next) {
    try {
      const { contentId } = req.params;
      await LessonContentService.deleteContent(contentId);
      this.successResponse(res, { message: 'Content deleted successfully' });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateContentOrder(req, res, next) {
    try {
      const { contentId } = req.params;
      const { order } = req.body;
      const result = await LessonContentService.updateContentOrder(contentId, order);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new LessonContentController(); 