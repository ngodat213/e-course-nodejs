const Course = require('../models/course.model');
const UserProgress = require('../models/user_progress.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const EmailService = require('./email_template.service');
const CloudinaryService = require('./cloudinary.service');
const i18next = require('i18next');
const CourseDeleteRequest = require('../models/course_delete_request.model');
const Lesson = require('../models/lesson.model');
const LessonService = require('./lesson.service');

class CourseService {
    async getAll(options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt', search, filter = {} } = options;
        
        let queryFilter = { ...filter };
        if (search) {
            queryFilter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Course.find(queryFilter)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Course.countDocuments(queryFilter)
        ]);

        return {
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getCourseById(id) {
        const course = await Course.findById(id)
            .populate('instructor_id', 'name email')
            .populate({
                path: 'lessons',
                select: '-content -video_url' // Exclude sensitive data
            });

        if (!course) {
            throw new NotFoundError(i18next.t('course.notFound'));
        }

        return course;
    }

    async create(courseData, thumbnailFile, instructorId) {
        if (!courseData.title || !courseData.description || !courseData.price) {
            throw new BadRequestError(i18next.t('course.missingInfo'));
        }

        // Upload thumbnail to Cloudinary if provided
        if (thumbnailFile) {
            const uploadResult = await CloudinaryService.uploadImage(thumbnailFile, {
                folder: 'course-thumbnails',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [
                    { width: 720, height: 480, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });

            courseData.thumbnail = uploadResult.secure_url;
            courseData.thumbnail_id = uploadResult.public_id;
        }

        courseData.instructor_id = instructorId;

        const course = await Course.create(courseData);
        return course;
    }

    async update(id, updateData) {
        // Nếu có thumbnail mới, xóa thumbnail cũ
        if (updateData.thumbnail && updateData.thumbnail_id) {
            const course = await Course.findById(id);
            if (course && course.thumbnail_id) {
                await CloudinaryService.deleteImage(course.thumbnail_id);
            }
        }

        const course = await Course.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!course) {
            throw new NotFoundError(i18next.t('course.notFound'));
        }

        return course;
    }

    async delete(id) {
        const course = await Course.findById(id);
        if (!course) {
            throw new NotFoundError(i18next.t('course.notFound'));
        }

        // Check if there are any enrolled students
        const enrollments = await UserProgress.find({ course_id: id });
        if (enrollments.length > 0) {
            throw new BadRequestError(i18next.t('course.hasStudents'));
        }

        // Xóa thumbnail từ Cloudinary
        if (course.thumbnail_id) {
            await CloudinaryService.deleteImage(course.thumbnail_id);
        }

        // Xóa tất cả bài học và tài nguyên liên quan
        const lessons = await Lesson.find({ course_id: id });
        for (const lesson of lessons) {
            await LessonService.deleteLesson(lesson._id);
        }

        await course.remove();
        return true;
    }

    async enrollCourse(courseId, userId) {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new NotFoundError(i18next.t('course.notFound'));
        }

        // Check if already enrolled
        const existingProgress = await UserProgress.findOne({
            user_id: userId,
            course_id: courseId
        });

        if (existingProgress) {
            throw new BadRequestError(i18next.t('course.alreadyEnrolled'));
        }

        // Create progress record for first lesson
        const firstLesson = await Course.findOne({ course_id: courseId })
            .sort('createdAt')
            .select('_id');

        if (firstLesson) {
            await UserProgress.create({
                user_id: userId,
                course_id: courseId,
                lesson_id: firstLesson._id,
                status: 'not_started',
                progress_percent: 0
            });
        }

        // Send enrollment email
        await EmailService.sendCourseEnrollmentEmail(userId, course);

        return { message: i18next.t('course.enrolled') };
    }

    async getUserCourses(userId) {
        const enrollments = await UserProgress.find({ user_id: userId })
            .distinct('course_id');

        const courses = await Course.find({
            _id: { $in: enrollments }
        }).populate('instructor_id', 'name email');

        return courses;
    }

    buildSearchQuery(search) {
        if (!search) return {};
        return {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };
    }

    async createDeleteRequest(courseId, userId, reason) {
        const course = await Course.findById(courseId);
        
        if (course.instructor.toString() !== userId.toString()) {
            throw new BadRequestError(i18next.t('course.notInstructor'));
        }

        return await CourseDeleteRequest.create({
            course_id: courseId,
            instructor_id: userId,
            reason
        });
    }

    async getDeleteRequests(query) {
        const { status, page = 1, limit = 10 } = query;
        
        let filter = {};
        if (status) {
            filter.status = status;
        }

        const requests = await CourseDeleteRequest.find(filter)
            .populate('course_id', 'title')
            .populate('instructor_id', 'name email')
            .populate('admin_response.admin_id', 'name')
            .sort('-created_at')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await CourseDeleteRequest.countDocuments(filter);

        return {
            data: requests,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async handleDeleteRequest(requestId, adminId, { status, message }) {
        const request = await CourseDeleteRequest.findById(requestId);
        if (!request) {
            throw new NotFoundError('Delete request not found');
        }

        if (request.status !== 'pending') {
            throw new BadRequestError('This request has already been handled');
        }

        request.status = status;
        request.admin_response = {
            admin_id: adminId,
            message,
            action_date: new Date()
        };

        await request.save();

        // Nếu approved thì xóa khóa học
        if (status === 'approved') {
            await this.deleteCourse(request.course_id);
        }

        // Gửi email thông báo cho instructor
        // TODO: Implement email notification

        return request;
    }
}

module.exports = new CourseService(); 