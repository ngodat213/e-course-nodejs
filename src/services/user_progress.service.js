const UserProgress = require("../models/user_progress.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Lesson = require("../models/lesson.model");
const LessonContent = require("../models/lesson_content.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
const UserService = require("../services/user.service");

class UserProgressService {
  async getAll(userId, courseId) {
    // Kiểm tra user và course tồn tại
    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);

    if (!user) throw new NotFoundError(i18next.t("user.notFound"));
    if (!course) throw new NotFoundError(i18next.t("course.notFound"));

    // Lấy tất cả progress của user trong course
    let progresses = await UserProgress.find({ 
      user_id: userId, 
      course_id: courseId 
    }).populate({
      path: 'content_id',
      populate: [
        { path: 'video'},
        { path: 'quiz' },
        { path: 'attachments'},
        { path: 'requirements', select: 'title' },
      ]
    });

    // Nếu chưa có progress nào, tạo progress đầu tiên với content đầu tiên
    if (progresses.length === 0) {
      const firstLesson = await Lesson.findOne({ 
        course_id: courseId 
      }).sort({ order: 1 });

      if (firstLesson) {
        const firstContent = await LessonContent.findOne({
          lesson_id: firstLesson._id
        }).sort({ order: 1 });

        if (firstContent) {
          const newProgress = await UserProgress.create({
            user_id: userId,
            course_id: courseId,
            lesson_id: firstLesson._id,
            content_id: firstContent._id,
            status: 'not_started'
          });

          progresses = [await newProgress.populate('content_id', 'title type duration order')];
        }
      }
    }

    return progresses;
  }

  async updateProgress(userId, contentId, progressData) {
    // Kiểm tra content tồn tại
    const content = await LessonContent.findById(contentId);
    if (!content) throw new NotFoundError(i18next.t("lessonContent.notFound"));

    const lesson = await Lesson.findById(content.lesson_id);
    if (!lesson) throw new NotFoundError(i18next.t("lesson.notFound"));

    // Cập nhật hoặc tạo mới progress
    const progress = await UserProgress.findOneAndUpdate(
      { 
        user_id: userId, 
        content_id: contentId 
      },
      {
        status: progressData.status,
        course_id: lesson.course_id,
        lesson_id: lesson._id
      },
      { 
        new: true, 
        upsert: true 
      }
    ).populate('content_id', 'title type duration order');

    // Cập nhật tổng progress của khóa học
    await this.updateCourseProgress(userId, lesson.course_id);

    return progress;
  }

  async markContentComplete(userId, contentId) {
    const progress = await this.updateProgress(userId, contentId, {
      status: 'completed'
    });

    // Cập nhật streak khi hoàn thành content
    await UserService.updateStreak(userId);

    return progress;
  }

  async getProgressByContent(userId, contentId) {
    const progress = await UserProgress.findOne({
      user_id: userId,
      content_id: contentId
    }).populate('content_id', 'title type duration order');

    if (!progress) {
      const content = await LessonContent.findById(contentId);
      if (!content) throw new NotFoundError(i18next.t("lessonContent.notFound"));

      const lesson = await Lesson.findById(content.lesson_id);
      if (!lesson) throw new NotFoundError(i18next.t("lesson.notFound"));


      // Tạo progress mới
      return await UserProgress.create({
        user_id: userId,
        course_id: lesson.course_id,
        lesson_id: lesson._id,
        content_id: contentId,
        status: 'not_started'
      });
    }

    return progress;
  }

  async updateCourseProgress(userId, courseId) {
    // Tìm tất cả lesson content trong khóa học
    const lessons = await Lesson.find({ course_id: courseId });
    const lessonIds = lessons.map(lesson => lesson._id);
    
    const totalContents = await LessonContent.countDocuments({
      lesson_id: { $in: lessonIds }
    });

    const completedContents = await UserProgress.countDocuments({
      user_id: userId,
      course_id: courseId,
      status: 'completed'
    });

    const progress_percent = totalContents > 0 ? 
      Math.round((completedContents / totalContents) * 100) : 0;

    return progress_percent;
  }

  async createProgress(userId, courseId, contentId) {
    // Kiểm tra user và content tồn tại
    const [user, content] = await Promise.all([
      User.findById(userId),
      LessonContent.findById(contentId)
    ]);

    if (!user) throw new NotFoundError(i18next.t("user.notFound"));
    if (!content) throw new NotFoundError(i18next.t("lessonContent.notFound"));

    const lesson = await Lesson.findById(content.lesson_id);
    if (!lesson) throw new NotFoundError(i18next.t("lesson.notFound"));

    // Kiểm tra lesson có thuộc course không
    if (lesson.course_id.toString() !== courseId) {
      throw new BadRequestError(i18next.t("lesson.notBelongToCourse"));
    }

    try {
      // Tạo progress mới với upsert để tránh race condition
      const progress = await UserProgress.findOneAndUpdate(
        {
          user_id: userId,
          content_id: contentId
        },
        {
          course_id: courseId,
          lesson_id: lesson._id,
          status: 'not_started'
        },
        {
          new: true,
          upsert: true
        }
      );

      return progress.populate('content_id', 'title type duration order');
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestError(i18next.t("progress.alreadyExists"));
      }
      throw error;
    }
  }

  async getAllLessonContents(userId, lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new NotFoundError(i18next.t("lesson.notFound"));

    // Kiểm tra user đã enrolled khóa học chưa
    const user = await User.findById(userId);
    const courseIdStr = lesson.course_id.toString();
    
    const isEnrolled = user.enrolled_courses.some(course => 
      course.toString() === courseIdStr
    );
    
    if (!isEnrolled) {
      throw new BadRequestError(i18next.t("course.notEnrolled"));
    }

    // Lấy tất cả content của lesson
    const contents = await LessonContent.find({
      lesson_id: lessonId
    }).sort({ order: 1 });

    // Lấy progress cho từng content
    const progressPromises = contents.map(async (content) => {
      let progress = await UserProgress.findOne({
        user_id: userId,
        content_id: content._id
      });

      // Nếu chưa có progress, tạo mới
      if (!progress) {
        progress = await UserProgress.create({
          user_id: userId,
          course_id: lesson.course_id,
          lesson_id: lessonId,
          content_id: content._id,
          status: 'not_started'
        });
      }

      return {
        content,
        progress: {
          status: progress.status
        }
      };
    });

    return Promise.all(progressPromises);
  }
}

module.exports = new UserProgressService(); 