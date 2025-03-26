const ExamQuestion = require("../models/exam_question.model");
const Exam = require("../models/exam.model");
const FileService = require("./file.service");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");

class QuizQuestionService {
  async create(examId, questionData, files = null) {
    // Validate exam_id
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new NotFoundError(i18next.t("exam.notFound"));
    }

    if (typeof questionData.answers === "string") {
      try {
        questionData.answers = JSON.parse(questionData.answers);
      } catch (error) {
        throw new BadRequestError("Định dạng JSON của answers không hợp lệ");
      }
    }

    // Upload files nếu có
    if (files) {
      if (files.video) {
        const videoResult = await FileService.uploadFile(
          examId,
          "Exam",
          files.video[0],
          "video"
        );
        questionData.video_id = videoResult._id;
      }

      if (files.image) {
        const imageResult = await FileService.uploadFile(
          examId,
          "Exam",
          files.image[0],
          "image"
        );
        questionData.image_id = imageResult._id;
      }
    }

    // Create question
    const question = await ExamQuestion.create({
      exam_id: examId,
      ...questionData,
    });

    return question;
  }

  async findAll(examId, options = {}) {
    const { page = 1, limit = 10, sort = "-createdAt" } = options;

    const questions = await ExamQuestion.find({ exam_id: examId })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("video_id")
      .populate("image_id");

    const total = await ExamQuestion.countDocuments({ exam_id: examId });

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(questionId) {
    const question = await ExamQuestion.findById(questionId)
      .populate("video_id")
      .populate("image_id");

    if (!question) {
      throw new NotFoundError(i18next.t("exam.questionNotFound"));
    }

    return question;
  }

  async update(questionId, updateData, files = null) {
    const question = await ExamQuestion.findById(questionId);
    if (!question) {
      throw new NotFoundError(i18next.t("exam.questionNotFound"));
    }

    // Upload files nếu có
    if (files) {
      if (files.video) {
        // Xóa video cũ nếu có
        if (question.video_id) {
          await CloudinaryService.deleteFile(question.video_id);
        }

        const videoResult = await CloudinaryService.uploadVideo(
          files.video.path,
          { folder: "quiz_questions" }
        );
        updateData.video_id = videoResult._id;
      }

      if (files.image) {
        // Xóa image cũ nếu có
        if (question.image_id) {
          await CloudinaryService.deleteFile(question.image_id);
        }

        const imageResult = await CloudinaryService.uploadImage(
          files.image.path,
          { folder: "quiz_questions" }
        );
        updateData.image_id = imageResult._id;
      }
    }

    const updatedQuestion = await ExamQuestion.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true }
    )
      .populate("video_id")
      .populate("image_id");

    return updatedQuestion;
  }

  async delete(questionId) {
    const question = await ExamQuestion.findById(questionId);
    if (!question) {
      throw new NotFoundError(i18next.t("exam.questionNotFound"));
    }

    // Xóa files liên quan
    if (question.video_id) {
      await CloudinaryService.deleteFile(question.video_id);
    }
    if (question.image_id) {
      await CloudinaryService.deleteFile(question.image_id);
    }

    await question.remove();

    return { message: i18next.t("exam.questionDeleted") };
  }
}

module.exports = new QuizQuestionService();
