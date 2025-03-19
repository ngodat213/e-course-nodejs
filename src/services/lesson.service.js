const Lesson = require("../models/lesson.model");
const Course = require("../models/course.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
const User = require("../models/user.model");

class LessonService {
  async createLesson(courseId, lessonData) {
    // Kiểm tra course tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    // Tạo lesson mới
    const lesson = await Lesson.create({
      ...lessonData,
      course_id: courseId
    });

    return lesson;
  }

  async updateLesson(lessonId, updateData) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound"));
    }

    // Cập nhật thông tin lesson
    Object.assign(lesson, updateData);
    await lesson.save();

    return lesson;
  }

  async deleteLesson(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound"));
    }

    await lesson.remove();
    return true;
  }

  async getLessonById(lessonId) {
    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: 'contents',
        populate: [
          { path: 'video'},
          { path: 'quiz' },
          { path: 'attachments'},
          { path: 'requirements', select: 'title' },
          { path: 'comments' }
        ]
      });

    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound"));
    }

    return lesson;
  }

  async getLessonsByCourse(courseId, userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    
    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    // Kiểm tra quyền truy cập
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Nếu không phải admin và không phải instructor của khóa học
    if (user.role !== 'admin' && course.instructor_id.toString() !== userId) {
      // Kiểm tra xem user đã đăng ký khóa học chưa
      const isEnrolled = user.enrolled_courses.includes(courseId);
      if (!isEnrolled) {
        throw new BadRequestError(i18next.t("course.notEnrolled"));
      }
    }

    const query = { course_id: courseId };
    if (status) {
      query.status = status;
    }

    // Lấy tổng số bài học
    const total = await Lesson.countDocuments(query);

    // Lấy danh sách bài học với phân trang
    const lessons = await Lesson.find(query)
      .populate({
        path: 'contents',
        populate: [
          { path: 'video'},
          { path: 'quiz' },
          { path: 'attachments'}
        ]
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data: lessons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new LessonService();
