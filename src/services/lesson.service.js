const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const CloudinaryService = require('./cloudinary.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const i18next = require('i18next');

class LessonService {
    async createLesson(courseId, lessonData, files) {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new NotFoundError(i18next.t('course.notFound'));
        }

        // Xử lý nội dung theo type
        switch (lessonData.type) {
            case 'video':
                if (!files.video) {
                    throw new BadRequestError('Video file is required for video type lesson');
                }
                const uploadResult = await CloudinaryService.uploadVideo(files.video[0], {
                    folder: 'course-videos',
                    resource_type: 'video'
                });
                lessonData.content = {
                    video_url: uploadResult.secure_url,
                    video_id: uploadResult.public_id
                };
                break;

            case 'article':
                if (!lessonData.content?.text) {
                    throw new BadRequestError('Text content is required for article type lesson');
                }
                break;

            case 'quiz':
                if (!lessonData.content?.questions?.length) {
                    throw new BadRequestError('Questions are required for quiz type lesson');
                }
                // Validate quiz structure
                lessonData.content.questions.forEach(question => {
                    if (!question.options?.some(opt => opt.is_correct)) {
                        throw new BadRequestError('Each question must have at least one correct answer');
                    }
                });
                break;
        }

        // Xử lý file đính kèm
        if (files.attachments?.length > 0) {
            lessonData.attachments = await Promise.all(
                files.attachments.map(async file => {
                    const uploadResult = await CloudinaryService.uploadFile(file, {
                        folder: 'course-attachments'
                    });
                    return {
                        name: file.originalname,
                        url: uploadResult.secure_url,
                        file_id: uploadResult.public_id
                    };
                })
            );
        }

        // Tự động set order
        const lastLesson = await Lesson.findOne({ course_id: courseId })
            .sort('-order');
        lessonData.order = (lastLesson?.order || 0) + 1;
        lessonData.course_id = courseId;

        const lesson = await Lesson.create(lessonData);
        return lesson;
    }

    async updateLesson(lessonId, updateData, videoFile, attachments) {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            throw new NotFoundError(i18next.t('lesson.notFound'));
        }

        // Xử lý video mới nếu có
        if (videoFile && updateData.type === 'video') {
            // Xóa video cũ
            if (lesson.content?.video_id) {
                await CloudinaryService.deleteVideo(lesson.content.video_id);
            }

            const uploadResult = await CloudinaryService.uploadVideo(videoFile, {
                folder: 'course-videos',
                resource_type: 'video'
            });
            updateData.content = {
                video_url: uploadResult.secure_url,
                video_id: uploadResult.public_id
            };
        }

        // Xử lý file đính kèm mới
        if (attachments?.length > 0) {
            // Xóa file cũ
            for (const attachment of lesson.attachments || []) {
                if (attachment.file_id) {
                    await CloudinaryService.deleteFile(attachment.file_id);
                }
            }

            updateData.attachments = await Promise.all(
                attachments.map(async file => {
                    const uploadResult = await CloudinaryService.uploadFile(file, {
                        folder: 'course-attachments'
                    });
                    return {
                        name: file.originalname,
                        url: uploadResult.secure_url,
                        file_id: uploadResult.public_id
                    };
                })
            );
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonId,
            updateData,
            { new: true, runValidators: true }
        );

        return updatedLesson;
    }

    async deleteLesson(lessonId) {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            throw new NotFoundError(i18next.t('lesson.notFound'));
        }

        // Xóa video và file đính kèm từ Cloudinary
        if (lesson.content?.video_id) {
            await CloudinaryService.deleteVideo(lesson.content.video_id);
        }

        for (const attachment of lesson.attachments || []) {
            if (attachment.file_id) {
                await CloudinaryService.deleteFile(attachment.file_id);
            }
        }

        await lesson.remove();

        // Cập nhật lại order của các bài học sau
        await Lesson.updateMany(
            { 
                course_id: lesson.course_id,
                order: { $gt: lesson.order }
            },
            { $inc: { order: -1 } }
        );

        return true;
    }

    // Các phương thức khác...
}

module.exports = new LessonService(); 