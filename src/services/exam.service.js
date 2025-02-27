const Exam = require('../models/exam.model');
const ExamQuestion = require('../models/exam_question.model');
const ExamHistory = require('../models/exam_history.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const i18next = require('i18next');
const { getPaginationOptions, formatPaginationResponse } = require('../utils/pagination.helper');

class ExamService {
    async create(lessonId, examData) {
        const exam = await Exam.create({
            lesson_id: lessonId,
            ...examData
        });
        return exam;
    }

    async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            status,
            lesson_id
        } = options;

        const query = {};
        if (status) query.status = status;
        if (lesson_id) query.lesson_id = lesson_id;

        const exams = await Exam.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('lesson_id', 'title');

        const total = await Exam.countDocuments(query);

        return {
            exams,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit)
            }
        };
    }

    async findById(examId, includeQuestions = false) {
        const exam = await Exam.findById(examId)
            .populate('lesson_id', 'title course_id');

        if (!exam) {
            throw new NotFoundError(i18next.t('exam.notFound'));
        }

        if (includeQuestions) {
            const questions = await ExamQuestion.find({ exam_id: examId })
                .populate('video_id')
                .populate('image_id');
            return { ...exam.toObject(), questions };
        }

        return exam;
    }

    async update(examId, updateData) {
        const exam = await Exam.findById(examId);
        if (!exam) {
            throw new NotFoundError(i18next.t('exam.notFound'));
        }

        const updatedExam = await Exam.findByIdAndUpdate(
            examId,
            updateData,
            { new: true }
        ).populate('lesson_id', 'title course_id');

        return updatedExam;
    }

    async delete(examId) {
        const exam = await Exam.findById(examId);
        if (!exam) {
            throw new NotFoundError(i18next.t('exam.notFound'));
        }

        // Xóa tất cả câu hỏi liên quan
        await ExamQuestion.deleteMany({ exam_id: examId });

        await exam.remove();
        return { message: i18next.t('exam.deleted') };
    }

    async startExam(examId, userId) {
        const exam = await this.findById(examId);
        
        // Kiểm tra trạng thái exam
        if (exam.status !== 'published') {
            throw new BadRequestError(i18next.t('exam.notAvailable'));
        }

        // Lấy câu hỏi cho bài kiểm tra
        let questions;
        if (exam.random_questions) {
            questions = await ExamQuestion.aggregate([
                { $match: { exam_id: exam._id } },
                { $sample: { size: exam.questions_per_exam } }
            ]);
        } else {
            questions = await ExamQuestion.find({ exam_id: examId })
                .limit(exam.questions_per_exam);
        }

        // Loại bỏ đáp án đúng trước khi gửi về client
        const sanitizedQuestions = questions.map(q => ({
            _id: q._id,
            question: q.question,
            video_id: q.video_id,
            image_id: q.image_id,
            answers: q.answers.map(a => ({
                _id: a._id,
                text: a.text
            })),
            points: q.points
        }));

        return {
            exam_id: exam._id,
            title: exam.title,
            duration: exam.duration,
            total_questions: sanitizedQuestions.length,
            questions: sanitizedQuestions
        };
    }

    async submitExam(examId, userId, answers) {
        const exam = await Exam.findById(examId);
        if (!exam) {
            throw new NotFoundError(i18next.t('exam.notFound'));
        }

        // Get correct answers
        const questions = await ExamQuestion.find({
            _id: { $in: Object.keys(answers) }
        });

        // Calculate score
        let correctAnswers = 0;
        questions.forEach(q => {
            if (answers[q._id] === q.correct_answer) {
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
            passed: score >= exam.passing_score
        });

        return {
            score,
            passed: score >= exam.passing_score,
            total_questions: questions.length,
            correct_answers: correctAnswers
        };
    }

    async getExamsByLesson(lessonId, options = {}) {
        // Validate lesson exists
        const Lesson = require('../models/lesson.model');
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            throw new NotFoundError(i18next.t('lesson.notFound'));
        }

        const {
            page,
            limit,
            skip,
            sort
        } = getPaginationOptions(options);

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
                .populate('lesson_id', 'title course_id')
                .lean(),
            Exam.countDocuments(query)
        ]);

        // Thêm thông tin về số câu hỏi cho mỗi exam
        const examsWithQuestionCount = await Promise.all(
            exams.map(async (exam) => {
                const questionCount = await ExamQuestion.countDocuments({
                    exam_id: exam._id
                });
                return {
                    ...exam,
                    question_count: questionCount
                };
            })
        );

        return formatPaginationResponse(
            examsWithQuestionCount,
            total,
            page,
            limit
        );
    }
}

module.exports = new ExamService(); 