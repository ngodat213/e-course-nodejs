const ExamQuestion = require('../models/exam_question.model');
const CloudinaryService = require('./cloudinary.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const FileService = require('./file.service');
const i18next = require('i18next');

class ExamQuestionService {
    async createQuestion(examId, questionData, files) {
        // Upload video nếu có
        if (files?.video) {
            const videoResult = await CloudinaryService.uploadVideo(
                files.video.path,
                {
                    resource_type: 'video',
                    folder: 'exam_questions'
                }
            );
            questionData.video_id = videoResult._id;
        }

        // Upload image nếu có
        if (files?.image) {
            const imageResult = await FileService.uploadFile(
                examId,
                "ExamQuestion",
                files.image,
                "image"
            );
            questionData.image_id = imageResult._id;
        }

        const question = await ExamQuestion.create({
            exam_id: examId,
            ...questionData
        });

        return question;
    }

    async updateQuestion(questionId, updateData, files) {
        const question = await ExamQuestion.findById(questionId);
        if (!question) {
            throw new NotFoundError(i18next.t('exam.questionNotFound'));
        }

        // Xử lý upload files tương tự như create
        if (files?.video) {
            const videoResult = await CloudinaryService.uploadVideo(
                files.video.path,
                {
                    resource_type: 'video',
                    folder: 'exam_questions'
                }
            );
            updateData.video_id = videoResult._id;
        }

        if (files?.image) {
            const imageResult = await CloudinaryService.uploadImage(
                files.image.path,
                {
                    folder: 'exam_questions'
                }
            );
            updateData.image_id = imageResult._id;
        }

        const updatedQuestion = await ExamQuestion.findByIdAndUpdate(
            questionId,
            updateData,
            { new: true }
        );

        return updatedQuestion;
    }

    // Các methods khác...
}

module.exports = new ExamQuestionService(); 