const User = require('../models/user.model');
const { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } = require('../utils/errors');
const bcrypt = require('bcryptjs');
const i18next = require('i18next');
const CloudinaryService = require('./cloudinary.service');
const Course = require('../models/course.model');
const UserProgress = require('../models/user_progress.model');
const CourseReview = require('../models/course_review.model');
const Certificate = require('../models/certificate.model');
const mongoose = require('mongoose');

class UserService extends require('./base.service') {
    constructor() {
        super(User);
    }

    async updateProfile(userId, updateData) {
        // Không cho phép cập nhật role và status qua route này
        const { role, status, password, ...allowedUpdates } = updateData;

        const user = await this.model.findByIdAndUpdate(
            userId,
            allowedUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        return user;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.model.findById(userId);
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedError(i18next.t('user.invalidPassword'));
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        return { message: i18next.t('user.passwordChanged') };
    }

    async getAllUsers(query) {
        const { search, role, status, ...paginationQuery } = query;
        
        let filter = {};
        
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        if (role) filter.role = role;
        if (status) filter.status = status;

        return await super.getAll({ ...paginationQuery, filter });
    }

    async getUserById(id) {
        const user = await this.model.findById(id).select('-password');
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }
        return user;
    }

    async updateUser(id, updateData) {
        const user = await this.model.findById(id);
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        // Nếu cập nhật email, kiểm tra email đã tồn tại chưa
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.model.findOne({ email: updateData.email });
            if (existingUser) {
                throw new BadRequestError('Email đã được sử dụng');
            }
        }

        Object.assign(user, updateData);
        await user.save();

        return this._sanitizeUser(user);
    }

    async deleteUser(id) {
        const user = await this.model.findById(id);
        if (!user) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        // Có thể thêm logic kiểm tra các ràng buộc trước khi xóa
        // Ví dụ: kiểm tra user có khóa học đang dạy không

        await user.remove();
        return true;
    }

    _sanitizeUser(user) {
        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }

    async uploadAvatar(userId, file) {
        const user = await this.model.findById(userId);
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        // Xóa avatar cũ nếu có
        if (user.profile_picture_id) {
            await CloudinaryService.deleteImage(user.profile_picture_id);
        }

        // Upload avatar mới
        const result = await CloudinaryService.uploadImage(file);

        // Cập nhật user
        user.profile_picture = result.url;
        user.profile_picture_id = result.public_id;
        await user.save();

        return {
            message: i18next.t('upload.success'),
            profile_picture: result.url
        };
    }

    async setUserRole(userId, newRole, currentUser) {
        const user = await this.model.findById(userId);
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        // Kiểm tra quyền
        if (newRole === 'super_admin') {
            throw new ForbiddenError(i18next.t('user.cannotSetSuperAdmin'));
        }

        if (newRole === 'admin') {
            if (currentUser.role !== 'super_admin') {
                throw new ForbiddenError(i18next.t('user.onlySuperAdminCanSetAdmin'));
            }
        }

        if (newRole === 'instructor') {
            if (!['super_admin', 'admin'].includes(currentUser.role)) {
                throw new ForbiddenError(i18next.t('user.onlyAdminCanSetInstructor'));
            }
        }

        // Không cho phép hạ cấp super_admin
        if (user.role === 'super_admin') {
            throw new ForbiddenError(i18next.t('user.cannotModifySuperAdmin'));
        }

        // Không cho phép admin thường sửa role của admin khác
        if (user.role === 'admin' && currentUser.role !== 'super_admin') {
            throw new ForbiddenError(i18next.t('user.onlySuperAdminCanModifyAdmin'));
        }

        // Cập nhật role
        user.set({ role: newRole }); // Sử dụng set để bypass immutable
        await user.save();

        return {
            message: i18next.t('user.roleUpdated'),
            user: this._sanitizeUser(user)
        };
    }

    async getUserInfo(userId) {
        const user = await this.model.findById(userId)
            .select('-password')
            .populate([
                {
                    path: 'enrolled_courses',
                    select: 'title description thumbnail progress_percent',
                    populate: {
                        path: 'instructor_id',
                        select: 'name email profile_picture'
                    }
                },
                {
                    path: 'teaching_courses',
                    select: 'title description thumbnail student_count',
                    match: { instructor_id: userId }
                },
                {
                    path: 'notifications',
                    select: 'type message read created_at',
                    options: { 
                        sort: { created_at: -1 },
                        limit: 10
                    }
                }
            ]);

        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        // Thêm thống kê
        const stats = await this.getUserStats(userId);

        return {
            user: this._sanitizeUser(user),
            stats
        };
    }

    async getUserStats(userId) {
        const user = await this.model.findById(userId);
        
        if (user.role === 'instructor') {
            const [courseStats, studentStats, ratingStats] = await Promise.all([
                this.getInstructorCourseStats(userId),
                this.getInstructorStudentStats(userId),
                this.getInstructorRatingStats(userId)
            ]);

            return {
                courses: courseStats,
                students: studentStats,
                ratings: ratingStats
            };
        }

        if (user.role === 'student') {
            const [learningStats, certificateStats] = await Promise.all([
                this.getStudentLearningStats(userId),
                this.getStudentCertificateStats(userId)
            ]);

            return {
                learning: learningStats,
                certificates: certificateStats
            };
        }

        return null;
    }

    // Helper methods for stats
    async getInstructorCourseStats(userId) {
        return await Course.aggregate([
            { $match: { instructor_id: mongoose.Types.ObjectId(userId) } },
            { $group: {
                _id: null,
                total_courses: { $sum: 1 },
                total_students: { $sum: '$student_count' },
                total_revenue: { $sum: '$total_revenue' }
            }}
        ]).exec();
    }

    async getInstructorStudentStats(userId) {
        const courses = await Course.find({ instructor_id: userId });
        const courseIds = courses.map(c => c._id);

        return await UserProgress.aggregate([
            { $match: { course_id: { $in: courseIds } } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]).exec();
    }

    async getInstructorRatingStats(userId) {
        return await CourseReview.aggregate([
            { $match: { instructor_id: mongoose.Types.ObjectId(userId) } },
            { $group: {
                _id: null,
                average_rating: { $avg: '$rating' },
                total_reviews: { $sum: 1 }
            }}
        ]).exec();
    }

    async getStudentLearningStats(userId) {
        return await UserProgress.aggregate([
            { $match: { user_id: mongoose.Types.ObjectId(userId) } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 },
                avg_progress: { $avg: '$progress_percent' }
            }}
        ]).exec();
    }

    async getStudentCertificateStats(userId) {
        return await Certificate.aggregate([
            { $match: { user_id: mongoose.Types.ObjectId(userId) } },
            { $group: {
                _id: null,
                total_certificates: { $sum: 1 },
                courses_completed: { $addToSet: '$course_id' }
            }}
        ]).exec();
    }
}

module.exports = new UserService(); 