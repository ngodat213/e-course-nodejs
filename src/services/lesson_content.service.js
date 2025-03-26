const LessonContent = require('../models/lesson_content.model');
const Lesson = require('../models/lesson.model');
const CloudinaryFile = require('../models/cloudinary_file.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const i18next = require('i18next');
const FileService = require('./file.service');

class LessonContentService {
  async createContent(lessonId, contentData, files) {
    // Kiểm tra lesson tồn tại
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(i18next.t('lesson.notFound'));
    }

    // Tính order mới
    const lastContent = await LessonContent.findOne({ lesson_id: lessonId })
      .sort({ order: -1 });
    const order = lastContent ? lastContent.order + 1 : 1;

    // Xử lý files dựa vào type
    let uploadedVideo, uploadedAttachments = [];

    if (contentData.type === 'video' && files?.video) {
      uploadedVideo = await FileService.uploadFile(
        lesson.course_id,
        'Course',
        files.video[0],
        'video'
      );
    }

    if (files?.attachments) {
      uploadedAttachments = await Promise.all(
        files.attachments.map(file => 
          FileService.uploadFile(lesson.course_id, 'Course', file, 'attachment')
        )
      );
    }

    // Tạo content mới
    const content = await LessonContent.create({
      lesson_id: lessonId,
      title: contentData.title,
      description: contentData.description,
      type: contentData.type,
      order,
      duration: uploadedVideo?.metadata?.duration || 0,
      video: uploadedVideo?._id,
      quiz: contentData.quiz_id,
      attachments: uploadedAttachments.map(file => file._id),
      status: contentData.status || 'draft'
    });

    return content.populate([
      { path: 'video', select: 'file_url metadata' },
      { path: 'quiz' },
      { path: 'attachments', select: 'file_url original_name' },
    ]);
  }

  async updateContent(contentId, updateData, files) {
    const content = await LessonContent.findById(contentId);
    if (!content) {
      throw new NotFoundError(i18next.t('lessonContent.notFound'));
    }

    // Xử lý video nếu có
    if (files?.video) {
      // Xóa video cũ
      if (content.video) {
        await FileService.deleteFile(content.video);
      }

      const uploadedVideo = await FileService.uploadFile(
        content.lesson_id,
        'Course',
        files.video[0],
        'video'
      );

      content.video = uploadedVideo._id;
      content.duration = uploadedVideo.metadata?.duration || 0;
    }

    // Xử lý attachments
    if (files?.attachments) {
      // Xóa attachments cũ nếu có yêu cầu
      if (updateData.removeAttachments) {
        for (const attachmentId of updateData.removeAttachments) {
          await FileService.deleteFile(attachmentId);
          content.attachments = content.attachments.filter(
            id => id.toString() !== attachmentId
          );
        }
      }

      // Upload attachments mới
      const uploadedFiles = await Promise.all(
        files.attachments.map(file => 
          FileService.uploadFile(content.lesson_id, 'Course', file, 'attachment')
        )
      );

      content.attachments.push(...uploadedFiles.map(file => file._id));
    }

    // Cập nhật các trường khác
    if (updateData.title) content.title = updateData.title;
    if (updateData.description) content.description = updateData.description;
    if (updateData.quiz_id) content.quiz = updateData.quiz_id;
    if (updateData.requirements) content.requirements = updateData.requirements;
    if (updateData.status) content.status = updateData.status;

    content.version += 1;
    await content.save();

    return content.populate([
      { path: 'video', select: 'file_url metadata' },
      { path: 'quiz' },
      { path: 'attachments', select: 'file_url original_name' },
      { path: 'requirements', select: 'title' },
      { path: 'comments' }
    ]);
  }

  async getContentsByLesson(lessonId, options = {}) {
    const { type, status, page = 1, limit = 10 } = options;

    const query = { lesson_id: lessonId };
    if (type) query.type = type;
    if (status) query.status = status;

    const contents = await LessonContent.find(query)
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        { path: 'video', select: 'file_url metadata' },
        { path: 'quiz' },
        { path: 'attachments', select: 'file_url original_name' },
        { path: 'requirements', select: 'title' },
        { path: 'comments' }
      ]);

    const total = await LessonContent.countDocuments(query);

    return {
      data: contents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getContentById(contentId) {
    const content = await LessonContent.findById(contentId)
      .populate([
        { path: 'video', select: 'file_url metadata' },
        { path: 'quiz' },
        { path: 'attachments', select: 'file_url original_name' },
        { path: 'requirements', select: 'title' },
        { path: 'comments' }
      ]);

    if (!content) {
      throw new NotFoundError(i18next.t('lessonContent.notFound'));
    }

    return content;
  }

  async deleteContent(contentId) {
    const content = await LessonContent.findById(contentId);
    if (!content) {
      throw new NotFoundError(i18next.t('lessonContent.notFound'));
    }

    // Xóa files liên quan
    if (content.video) {
      await FileService.deleteFile(content.video);
    }

    for (const attachmentId of content.attachments) {
      await FileService.deleteFile(attachmentId);
    }

    await content.remove();

    // Cập nhật order của các content còn lại
    await LessonContent.updateMany(
      {
        lesson_id: content.lesson_id,
        order: { $gt: content.order }
      },
      { $inc: { order: -1 } }
    );

    return true;
  }

  async updateContentOrder(contentId, newOrder) {
    const content = await LessonContent.findById(contentId);
    if (!content) {
      throw new NotFoundError(i18next.t('lessonContent.notFound'));
    }

    const maxOrder = await LessonContent.findOne({ lesson_id: content.lesson_id })
      .sort({ order: -1 });

    if (newOrder < 1 || newOrder > maxOrder.order + 1) {
      throw new BadRequestError(i18next.t('lessonContent.invalidOrder'));
    }

    if (newOrder > content.order) {
      await LessonContent.updateMany(
        {
          lesson_id: content.lesson_id,
          order: { $gt: content.order, $lte: newOrder }
        },
        { $inc: { order: -1 } }
      );
    } else {
      await LessonContent.updateMany(
        {
          lesson_id: content.lesson_id,
          order: { $gte: newOrder, $lt: content.order }
        },
        { $inc: { order: 1 } }
      );
    }

    content.order = newOrder;
    await content.save();

    return content;
  }
}

module.exports = new LessonContentService(); 