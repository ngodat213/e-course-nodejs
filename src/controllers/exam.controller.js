const BaseController = require("./base.controller");
const ExamService = require("../services/exam.service");

class ExamController extends BaseController {
  async createExam(req, res, next) {
    try {
      const exam = await ExamService.create(req.params.lessonId, req.body);
      this.createdResponse(res, exam);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getExam(req, res, next) {
    try {
      const exam = await ExamService.findById(
        req.params.examId,
        req.query.include_questions === "true"
      );
      this.successResponse(res, exam);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async updateExam(req, res, next) {
    try {
      const exam = await ExamService.updateExam(req.params.id, req.body);
      this.successResponse(res, exam);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async deleteExam(req, res, next) {
    try {
      const result = await ExamService.deleteExam(req.params.id);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async startExam(req, res, next) {
    try {
      const examData = await ExamService.startExam(req.user.id, req.params.examId);
      this.successResponse(res, examData);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async submitExam(req, res, next) {
    try {
      const result = await ExamService.submitExam(
        req.params.examId,
        req.user.id,
        req.body.answers
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getExamsByLesson(req, res, next) {
    try {
      const result = await ExamService.getExamsByLesson(
        req.params.lessonId,
        {
          page: req.query.page,
          limit: req.query.limit,
          sort: req.query.sort,
          status: req.query.status
        }
      );
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new ExamController();
