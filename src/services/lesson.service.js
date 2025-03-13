const Lesson = require("../models/lesson.model");
const Course = require("../models/course.model");
const CloudinaryFile = require("../models/cloudinary_file.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const i18next = require("i18next");
const FileService = require("./file.service");

class LessonService {
  async createLesson(courseId, lessonData, files) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    // Tính order mới
    const lastLesson = await Lesson.findOne({ course_id: courseId })
      .sort({ order: -1 })
      .limit(1);
    const order = lastLesson ? lastLesson.order + 1 : 1;

    // Upload video nếu có
    let video, duration = 0;
    if (files?.video) {
      const uploadedFile = await FileService.uploadFile(courseId, "Course", files.video[0], "video");
      video = uploadedFile._id;
      duration = uploadedFile.duration;
    }

    // Upload attachments
    const attachments = [];
    if (files?.attachments) {
      for (const file of files.attachments) {
        const uploadedFile = await FileService.uploadFile(courseId, "Course", file, "attachment");
        attachments.push(uploadedFile._id);
      }
    }

    const lesson = await Lesson.create({
      ...lessonData,
      course_id: courseId,
      order,
      video,
      duration,
      attachments,
    });

    return lesson.populate([
      { path: "video", select: "file_url metadata" },
      { path: "attachments", select: "file_url original_name" },
    ]);
  }

  async updateLesson(lessonId, updateData, files) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound"));
    }

    // Upload và update video nếu có
    if (files?.video) {
      // Xóa video cũ
      if (lesson.video) {
        await FileService.deleteFile(lesson.video);
      }
      
      const uploadedFile = await FileService.uploadFile(lesson.course_id, "Course", files.video[0], "video");
      lesson.video = uploadedFile._id;
    }

    // Upload attachments mới
    if (files?.attachments) {
      for (const file of files.attachments) {
        const uploadedFile = await FileService.uploadFile(lesson.course_id, "Course", file, "attachment");
        lesson.attachments.push(uploadedFile._id);
      }
    }
    
    Object.assign(lesson, updateData);
    await lesson.save();

    return lesson.populate([
      { path: "video", select: "file_url metadata" },
      { path: "attachments", select: "file_url original_name" },
    ]);
  }

  async deleteLesson(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound"));
    }

    // Xóa files
    if (lesson.video) {
      await FileService.deleteFile(lesson.video);
    }
    
    for (const attachmentId of lesson.attachments) {
      await FileService.deleteFile(attachmentId);
    }

    await lesson.remove();

    // Reorder các lesson còn lại
    await Lesson.updateMany(
      {
        course_id: lesson.course_id,
        order: { $gt: lesson.order },
      },
      { $inc: { order: -1 } }
    );

    return true;
  }

  async getLessonById(lessonId) {
    const lesson = await Lesson.findById(lessonId).populate([
      { path: "video", select: "public_id metadata format" },
      { path: "attachments", select: "public_id metadata format" },
      { path: "quiz", select: "questions" },
      { path: "comments", select: "content user created_at" },
    ]);

    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound"));
    }

    return lesson;
  }

  async getLessonsByCourse(courseId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const query = { course_id: courseId };
    
    if (status) {
      query.status = status;
    }

    const [lessons, total] = await Promise.all([
      Lesson.find(query)
        .populate([
          { path: "video", select: "file_url metadata format" },
          { path: "attachments", select: "file_url metadata format" },
        ])
        .sort({ order: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Lesson.countDocuments(query),
    ]);

    return {
      data: lessons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateLessonOrder(lessonId, newOrder) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(i18next.t("lesson.notFound")); 
    }

    const totalLessons = await Lesson.countDocuments({
      course_id: lesson.course_id,
    });

    if (newOrder < 1 || newOrder > totalLessons) {
      throw new BadRequestError(i18next.t("lesson.invalidOrder"));
    }

    const oldOrder = lesson.order;
    if (newOrder > oldOrder) {
      await Lesson.updateMany(
        {
          course_id: lesson.course_id,
          order: { $gt: oldOrder, $lte: newOrder },
        },
        { $inc: { order: -1 } }
      );
    } else {
      await Lesson.updateMany(
        {
          course_id: lesson.course_id,
          order: { $gte: newOrder, $lt: oldOrder },
        },
        { $inc: { order: 1 } }
      );
    }

    lesson.order = newOrder;
    await lesson.save();

    return lesson;
  }
}

module.exports = new LessonService();
