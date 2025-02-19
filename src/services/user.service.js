const User = require('../models/user.model');
const { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } = require('../utils/errors');
const bcrypt = require('bcryptjs');
const i18next = require('i18next');
const CloudinaryService = require('./cloudinary.service');
const FileService = require('./file.service');
const Course = require("../models/course.model");
const UserProgress = require("../models/user_progress.model");
const CourseReview = require("../models/course_review.model");
const Certificate = require("../models/certificate.model");
const Notification = require("../models/notification.model");
const mongoose = require("mongoose");
const EmailTemplateService = require("./email_template.service");
const transporter = require("../config/mail.config");

class UserService {
    constructor() {
        this.model = User;
    }

    async getAllUsers(options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt', search } = options;
        
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await this.model.find(query)
            .select('-password')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('profile_picture', 'file_url');

        const total = await this.model.countDocuments(query);

        return {
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getUserById(id) {
        const user = await this.model.findById(id)
            .select('-password')
            .populate('profile_picture', 'file_url');
            
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }
        return user;
    }

    async update(id, updateData) {
        const user = await this.model.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        return user;
    }

    async delete(id) {
        const user = await this.model.findById(id);
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        // Xóa avatar nếu có
        if (user.profile_picture) {
            await FileService.deleteFile(user.profile_picture);
        }

        await user.remove();
        return { message: i18next.t('user.deleted') };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.model.findById(userId);
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new BadRequestError(i18next.t('user.invalidPassword'));
        }

        user.password = newPassword;
        await user.save();

        return { message: i18next.t('user.passwordChanged') };
    }

    async setRole(userId, newRole, currentUser) {
        const user = await this.model.findById(userId);
        if (!user) {
            throw new NotFoundError(i18next.t('user.notFound'));
        }

        // Kiểm tra quyền
        if (newRole === 'super_admin') {
            throw new ForbiddenError(i18next.t('user.cannotSetSuperAdmin'));
        }

        if (newRole === 'admin' && currentUser.role !== 'super_admin') {
            throw new ForbiddenError(i18next.t('user.onlySuperAdminCanSetAdmin'));
        }

        if (newRole === 'instructor' && !['super_admin', 'admin'].includes(currentUser.role)) {
            throw new ForbiddenError(i18next.t('user.onlyAdminCanSetInstructor'));
        }

        // Không cho phép hạ cấp super_admin
        if (user.role === 'super_admin') {
            throw new ForbiddenError(i18next.t('user.cannotModifySuperAdmin'));
        }

        // Không cho phép admin thường sửa role của admin khác
        if (user.role === 'admin' && currentUser.role !== 'super_admin') {
            throw new ForbiddenError(i18next.t('user.onlySuperAdminCanModifyAdmin'));
        }

        user.role = newRole;
        await user.save();

        return {
            message: i18next.t('user.roleUpdated'),
            user: this._sanitizeUser(user)
        };
    }

    _sanitizeUser(user) {
        const sanitized = user.toObject();
        delete sanitized.password;
        return sanitized;
    }

    async getAll(options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt', search, filter = {} } = options;
        
        let queryFilter = { ...filter };
        if (search) {
            queryFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model.find(queryFilter)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(queryFilter)
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

    async create(userData) {
        return await this.model.create(userData);
    }

    async createUser(userData) {
        const existingUser = await this.model.findOne({ email: userData.email });
        if (existingUser) {
          await this.model.findByIdAndDelete(existingUser._id);
        }
        return await this.create(userData);
    }

    async updateProfile(userId, updateData) {
        const { role, status, password, ...allowedUpdates } = updateData;

        const user = await this.update(userId, allowedUpdates);
        return user;
    }

    async getAllUsers(query) {
        const { search, role, status, ...paginationQuery } = query;

        let filter = {};

        if (search) {
            filter.$or = [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") },
            ];
        }

        if (role) filter.role = role;
        if (status) filter.status = status;

        return await this.getAll({ ...paginationQuery, filter });
    }

    async updateUser(id, updateData) {
        const user = await this.model.findById(id);
        if (!user) {
            throw new NotFoundError("Không tìm thấy người dùng");
        }

        // Nếu cập nhật email, kiểm tra email đã tồn tại chưa
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.model.findOne({
                email: updateData.email,
            });
            if (existingUser) {
                throw new BadRequestError("Email đã được sử dụng");
            }
        }

        Object.assign(user, updateData);
        await user.save();

        return this._sanitizeUser(user);
    }

    async deleteUser(id) {
        const user = await this.model.findById(id);
        if (!user) {
            throw new NotFoundError("Không tìm thấy người dùng");
        }

        // Có thể thêm logic kiểm tra các ràng buộc trước khi xóa
        // Ví dụ: kiểm tra user có khóa học đang dạy không

        await user.remove();
        return true;
    }

    async uploadAvatar(userId, file) {
        const user = await this.model.findById(userId);
        if (!user) {
            throw new NotFoundError(i18next.t("user.notFound"));
        }

        // Xóa avatar cũ nếu có
        if (user.profile_picture_id) {
            await FileService.deleteFile(user.profile_picture_id);
        }

        // Upload avatar mới
        const result = await CloudinaryService.uploadImage(file);

        // Cập nhật user
        user.profile_picture = result.url;
        user.profile_picture_id = result.public_id;
        await user.save();

        return {
            message: i18next.t("upload.success"),
            profile_picture: result.url,
        };
    }

    async getUserInfo(userId) {
        const user = await this.model
            .findById(userId)
            .select("-password")
            .populate([
                {
                    path: "enrolled_courses",
                    select: "title description thumbnail progress_percent",
                    populate: {
                        path: "instructor_id",
                        select: "name email profile_picture",
                    },
                },
                {
                    path: "teaching_courses",
                    select: "title description thumbnail student_count",
                    match: { instructor_id: userId },
                },
                {
                    path: "notifications",
                    select: "type message read created_at",
                    options: {
                        sort: { created_at: -1 },
                        limit: 10,
                    },
                },
            ]);

        if (!user) {
            throw new NotFoundError(i18next.t("user.notFound"));
        }

        // Thêm thống kê
        const stats = await this.getUserStats(userId);

        return {
            user: this._sanitizeUser(user),
            stats,
        };
    }

    async getUserStats(userId) {
        const user = await this.model.findById(userId);

        if (user.role === "instructor") {
            const [courseStats, studentStats, ratingStats] = await Promise.all([
                this.getInstructorCourseStats(userId),
                this.getInstructorStudentStats(userId),
                this.getInstructorRatingStats(userId),
            ]);

            return {
                courses: courseStats,
                students: studentStats,
                ratings: ratingStats,
            };
        }

        if (user.role === "student") {
            const [learningStats, certificateStats] = await Promise.all([
                this.getStudentLearningStats(userId),
                this.getStudentCertificateStats(userId),
            ]);

            return {
                learning: learningStats,
                certificates: certificateStats,
            };
        }

        return null;
    }

    // Helper methods for stats
    async getInstructorCourseStats(userId) {
        return await Course.aggregate([
            { $match: { instructor_id: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    total_courses: { $sum: 1 },
                    total_students: { $sum: "$student_count" },
                    total_revenue: { $sum: "$total_revenue" },
                },
            },
        ]).exec();
    }

    async getInstructorStudentStats(userId) {
        const courses = await Course.find({ instructor_id: userId });
        const courseIds = courses.map((c) => c._id);

        return await UserProgress.aggregate([
            { $match: { course_id: { $in: courseIds } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]).exec();
    }

    async getInstructorRatingStats(userId) {
        return await CourseReview.aggregate([
            { $match: { instructor_id: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    average_rating: { $avg: "$rating" },
                    total_reviews: { $sum: 1 },
                },
            },
        ]).exec();
    }

    async getStudentLearningStats(userId) {
        return await UserProgress.aggregate([
            { $match: { user_id: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    avg_progress: { $avg: "$progress_percent" },
                },
            },
        ]).exec();
    }

    async getStudentCertificateStats(userId) {
        return await Certificate.aggregate([
            { $match: { user_id: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    total_certificates: { $sum: 1 },
                    courses_completed: { $addToSet: "$course_id" },
                },
            },
        ]).exec();
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    async updateAvatar(userId, file) {
        const user = await this.model.findById(userId);

        if (user.profile_picture_id) {
            await CloudinaryService.deleteImage(user.profile_picture_id);
        }

        const uploadResult = await CloudinaryService.uploadImage(file, {
            folder: "avatars",
            transformation: [
                { width: 400, height: 400, crop: "fill" },
                { quality: "auto" },
            ],
        });

        return await this.update(userId, {
            profile_picture: uploadResult.secure_url,
            profile_picture_id: uploadResult.public_id,
        });
    }
}

module.exports = new UserService();
