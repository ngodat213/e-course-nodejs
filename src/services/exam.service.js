const Exam = require("../models/exam.model");
const ExamQuestion = require("../models/exam_question.model");
const ExamHistory = require("../models/exam_history.model");
const LessonContent = require("../models/lesson_content.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
const {
  getPaginationOptions,
  formatPaginationResponse,
} = require("../utils/pagination.helper");

class ExamService {
  async create(lessonId, examData) {
    // Tạo exam mới
    const exam = await Exam.create({
      lesson_id: lessonId,
      ...examData,
    });

    // Tạo lesson content cho exam
    const lastContent = await LessonContent.findOne({
      lesson_id: lessonId,
    }).sort({ order: -1 });
    const order = lastContent ? lastContent.order + 1 : 1;

    await LessonContent.create({
      lesson_id: lessonId,
      title: examData.title || "Bài kiểm tra",
      type: examData.type || "quiz",
      order,
      duration: examData.duration,
      quiz: exam._id,
      status: examData.status || "draft",
    });

    return exam;
  }

  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      status,
      lesson_id,
    } = options;

    const query = {};
    if (status) query.status = status;
    if (lesson_id) query.lesson_id = lesson_id;

    const exams = await Exam.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("lesson_id", "title");

    const total = await Exam.countDocuments(query);

    return {
      exams,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(examId, includeQuestions = false) {
    const exam = await Exam.findById(examId).populate(
      "lesson_id",
      "title course_id"
    );

    if (!exam) {
      throw new NotFoundError(i18next.t("exam.notFound"));
    }

    if (includeQuestions) {
      const questions = await ExamQuestion.find({ exam_id: examId })
        .populate("video_id")
        .populate("image_id");
      return { ...exam.toObject(), questions };
    }

    return exam;
  }

  async update(examId, updateData) {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new NotFoundError(i18next.t("exam.notFound"));
    }

    const updatedExam = await Exam.findByIdAndUpdate(examId, updateData, {
      new: true,
    }).populate("lesson_id", "title course_id");

    // Cập nhật lesson content tương ứng
    await LessonContent.findOneAndUpdate(
      { quiz: examId },
      {
        duration: updateData.duration,
        status: updateData.status,
      }
    );

    return updatedExam;
  }

  async delete(examId) {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new NotFoundError(i18next.t("exam.notFound"));
    }

    // Xóa tất cả câu hỏi liên quan
    await ExamQuestion.deleteMany({ exam_id: examId });

    // Xóa lesson content liên quan
    await LessonContent.findOneAndDelete({ quiz: examId });

    await exam.remove();
    return { message: i18next.t("exam.deleted") };
  }

  async startExam(userId, examId) {
    const exam = await Exam.findById(examId);

    // Kiểm tra trạng thái exam
    if (exam.status !== "published") {
      throw new BadRequestError(i18next.t("exam.notAvailable"));
    }

    // Lấy câu hỏi cho bài kiểm tra
    let questions;
    if (exam.random_questions) {
      // Sử dụng aggregate với $lookup để populate
      questions = await ExamQuestion.aggregate([
        { $match: { exam_id: exam._id } },
        { $sample: { size: exam.questions_per_exam } },
        // Thêm lookup cho video_id
        {
          $lookup: {
            from: "cloudinaryfiles",
            localField: "video_id",
            foreignField: "_id",
            as: "video_id",
          },
        },
        // Thêm lookup cho image_id
        {
          $lookup: {
            from: "cloudinaryfiles",
            localField: "image_id",
            foreignField: "_id",
            as: "image_id",
          },
        },
        // Chuyển array thành single object
        {
          $addFields: {
            video_id: { $arrayElemAt: ["$video_id", 0] },
            image_id: { $arrayElemAt: ["$image_id", 0] },
          },
        },
      ]);
    } else {
      questions = await ExamQuestion.find({ exam_id: examId })
        .populate("video_id")
        .populate("image_id")
        .limit(exam.questions_per_exam);
    }

    // Loại bỏ đáp án đúng trước khi gửi về client
    const sanitizedQuestions = questions.map((q) => ({
      _id: q._id,
      question: q.question,
      video_id: q.video_id,
      image_id: q.image_id,
      answers: q.answers.map((a) => ({
        _id: a._id,
        text: a.text,
      })),
      points: q.points,
    }));

    return {
      exam_id: exam._id,
      duration: exam.duration,
      total_questions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    };
  }

  async submitExam(examId, userId, answers) {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new NotFoundError(i18next.t("exam.notFound"));
    }

    // Get questions with answers
    const questions = await ExamQuestion.find({
      _id: { $in: Object.keys(answers) },
    });

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question) => {
      const selectedAnswerId = answers[question._id];
      // Tìm đáp án được chọn trong mảng answers của câu hỏi
      const selectedAnswer = question.answers.find(
        answer => answer._id.toString() === selectedAnswerId
      );
      
      // Kiểm tra nếu đáp án được chọn là đúng
      if (selectedAnswer && selectedAnswer.is_correct) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;

    // Save exam history
    const examHistory = await ExamHistory.create({
      user_id: userId,
      exam_id: examId,
      score,
      answers,
      passed: score >= exam.passing_score,
    });

    return {
      score,
      passed: score >= exam.passing_score,
      total_questions: questions.length,
      correct_answers: correctAnswers,
    };
  }

  async getExamsByLesson(lessonId, options = {}) {
    // Validate lesson exists
    const Lesson = require("../models/lesson.model");
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound"));
    }

    const { page, limit, skip, sort } = getPaginationOptions(options);

    const query = { lesson_id: lessonId };

    // Thêm filter theo status nếu có
    if (options.status) {
      query.status = options.status;
    }

    const [exams, total] = await Promise.all([
      Exam.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("lesson_id", "title course_id")
        .lean(),
      Exam.countDocuments(query),
    ]);

    // Thêm thông tin về số câu hỏi cho mỗi exam
    const examsWithQuestionCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await ExamQuestion.countDocuments({
          exam_id: exam._id,
        });
        return {
          ...exam,
          question_count: questionCount,
        };
      })
    );

    return formatPaginationResponse(examsWithQuestionCount, total, page, limit);
  }
}

module.exports = new ExamService();
