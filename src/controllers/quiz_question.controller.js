const BaseController = require('./base.controller');
const QuizQuestionService = require('../services/quiz_question.service');

class QuizQuestionController extends BaseController {
    async create(req, res, next) {
        try {
            const question = await QuizQuestionService.create(
                req.params.examId,
                req.body,
                req.files
            );
            this.createdResponse(res, question);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async findAll(req, res, next) {
        try {
            const result = await QuizQuestionService.findAll(
                req.params.examId,
                req.query
            );
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async findOne(req, res, next) {
        try {
            const question = await QuizQuestionService.findOne(
                req.params.questionId
            );
            this.successResponse(res, question);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async update(req, res, next) {
        try {
            const question = await QuizQuestionService.update(
                req.params.questionId,
                req.body,
                req.files
            );
            this.successResponse(res, question);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await QuizQuestionService.delete(
                req.params.questionId
            );
            this.successResponse(res, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

module.exports = new QuizQuestionController(); 