const Course = require('../models/course.model');
const UserProgress = require('../models/user_progress.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const EmailService = require('./email_template.service');
const i18next = require('i18next');

class CourseService extends require('./base.service') {
    constructor() {
        super(Course);
    }

    async getAllCourses(query) {
        const { search, minPrice, maxPrice, instructor, ...paginationQuery } = query;
        
        let filter = {};
        
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        if (minPrice !== undefined) filter.price = { $gte: Number(minPrice) };
        if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: Number(maxPrice) };
        if (instructor) filter.instructor_id = instructor;

        const courses = await super.getAll({ ...paginationQuery, filter });

        // Populate instructor information
        await Course.populate(courses.data, { path: 'instructor_id', select: 'name email' });

        return courses;
    }

    async getCourseById(id) {
        const course = await this.model.findById(id)
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

    async createCourse(courseData) {
        if (!courseData.title || !courseData.description || !courseData.price) {
            throw new BadRequestError(i18next.t('course.missingInfo'));
        }

        const course = await this.model.create(courseData);
        return course;
    }

    async updateCourse(id, updateData) {
        const course = await this.model.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!course) {
            throw new NotFoundError(i18next.t('course.notFound'));
        }

        return course;
    }

    async deleteCourse(id) {
        // Check if there are any enrolled students
        const enrollments = await UserProgress.find({ course_id: id });
        if (enrollments.length > 0) {
            throw new BadRequestError(i18next.t('course.hasStudents'));
        }

        const course = await this.model.findByIdAndDelete(id);
        if (!course) {
            throw new NotFoundError(i18next.t('course.notFound'));
        }

        // Delete related data (lessons, materials, etc.)
        // TODO: Implement cleanup logic

        return true;
    }

    async enrollCourse(courseId, userId) {
        const course = await this.model.findById(courseId);
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
        const firstLesson = await this.model.findOne({ course_id: courseId })
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

        const courses = await this.model.find({
            _id: { $in: enrollments }
        }).populate('instructor_id', 'name email');

        return courses;
    }

    buildSearchQuery(search) {
        return {
            $or: [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ]
        };
    }
}

module.exports = new CourseService(); 