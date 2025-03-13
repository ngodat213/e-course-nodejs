const User = require("../models/user.model");
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../utils/errors");
const i18next = require("i18next");
const CloudinaryService = require("./cloudinary.service");
const FileService = require("./file.service");
const Course = require("../models/course.model");
const UserProgress = require("../models/user_progress.model");
const CourseReview = require("../models/course_review.model");
const Certificate = require("../models/certificate.model");
const mongoose = require("mongoose");

class UserService {
  constructor() {
  }

  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, sort = "-createdAt", search } = options;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User
      .find(query)
      .select("-password")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("profile_picture", "public_id");

    const total = await User.countDocuments(query);

    // Generate signed URLs for all users' profile pictures
    const usersWithSignedUrls = await Promise.all(
      users.map(async (user) => {
        const sanitizedUser = this._sanitizeUser(user);
        if (sanitizedUser.profile_picture) {
          sanitizedUser.profile_picture =
            await CloudinaryService.generateSignedUrl(
              sanitizedUser.profile_picture.public_id,
              { expires_in: parseInt(process.env.SIGN_URL_EXPIRES) }
            );
        }
        return sanitizedUser;
      })
    );

    return {
      data: usersWithSignedUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await User
      .findById(id)
      .select("-password");

    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }
    return user;
  }

  async update(id, updateData) {
    const user = await User
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select("-password");

    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    return user;
  }

  async delete(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Xóa avatar nếu có
    if (user.profile_picture) {
      await FileService.deleteFile(user.profile_picture);
    }

    await user.remove();
    return { message: i18next.t("user.deleted") };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError(i18next.t("user.invalidPassword"));
    }

    user.password = newPassword;
    await user.save();

    return { message: i18next.t("user.passwordChanged") };
  }

  async setRole(userId, newRole, currentUser) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Kiểm tra quyền
    if (newRole === "super_admin") {
      throw new ForbiddenError(i18next.t("user.cannotSetSuperAdmin"));
    }

    if (newRole === "admin" && currentUser.role !== "super_admin") {
      throw new ForbiddenError(i18next.t("user.onlySuperAdminCanSetAdmin"));
    }

    if (
      newRole === "instructor" &&
      !["super_admin", "admin"].includes(currentUser.role)
    ) {
      throw new ForbiddenError(i18next.t("user.onlyAdminCanSetInstructor"));
    }

    // Không cho phép hạ cấp super_admin
    if (user.role === "super_admin") {
      throw new ForbiddenError(i18next.t("user.cannotModifySuperAdmin"));
    }

    // Không cho phép admin thường sửa role của admin khác
    if (user.role === "admin" && currentUser.role !== "super_admin") {
      throw new ForbiddenError(i18next.t("user.onlySuperAdminCanModifyAdmin"));
    }

    user.role = newRole;
    await user.save();

    return {
      message: i18next.t("user.roleUpdated"),
      user: this._sanitizeUser(user),
    };
  }

  _sanitizeUser(user) {
    const sanitized = user.toObject();
    delete sanitized.password;
    return sanitized;
  }

  async getAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      search,
      filter = {},
    } = options;

    let queryFilter = { ...filter };
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      User.find(queryFilter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(queryFilter),
    ]);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(userData) {
    return await User.create(userData);
  }

  async createUser(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      await User.findByIdAndDelete(existingUser._id);
    }
    return await this.create(userData);
  }

  async updateProfile(userId, updateData) {
    const { role, status, password, ...allowedUpdates } = updateData;

    const user = await this.update(userId, allowedUpdates);
    return user;
  }

  async updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    // Nếu cập nhật email, kiểm tra email đã tồn tại chưa
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
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
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    await user.remove();
    return true;
  }

  async getUserInfo(userId) {
    const user = await User
      .findById(userId)
      .select("-password")
      .populate([
        {
          path: "profile_picture",
        },
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
        }
        // ,
        // {
        //   path: "notifications",
        //   select: "type message read created_at",
        //   options: {
        //     sort: { created_at: -1 },
        //     limit: 10,
        //   },
        // },
      ]);

    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Thêm thống kê
    const stats = await this.getUserStats(userId);

    return {
      user: user,
      stats,
    };
  }

  async getUserStats(userId) {
    const user = await User.findById(userId);

    if (user.role === "instructor" || user.role === "admin") {
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

    // if (user.role === "student") {
    //   const [learningStats, certificateStats] = await Promise.all([
    //     this.getStudentLearningStats(userId),
    //     this.getStudentCertificateStats(userId),
    //   ]);

    //   return {
    //     learning: learningStats,
    //     certificates: certificateStats,
    //   };
    // }

    return null;
  }

  // Helper methods for stats
  async getInstructorCourseStats(userId) {
    return await Course.aggregate([
      { $match: { instructor_id: new mongoose.Types.ObjectId(userId) } },
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
      { $match: { instructor_id: new mongoose.Types.ObjectId(userId) } },
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
    return User.findOne({ email });
  }

  async followUser(targetUserId, currentUserId) {
    // Kiểm tra user tồn tại
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Kiểm tra không thể tự follow chính mình
    if (targetUserId === currentUserId.toString()) {
      throw new BadRequestError(i18next.t("user.cannotFollowSelf"));
    }

    // Kiểm tra đã follow chưa
    if (targetUser.followers.includes(currentUserId)) {
      throw new BadRequestError(i18next.t("user.alreadyFollowing"));
    }

    // Thêm vào danh sách followers và tăng followers_count
    targetUser.followers.push(currentUserId);
    targetUser.followers_count += 1;
    await targetUser.save();

    return {
      message: i18next.t("user.followSuccess"),
      followers_count: targetUser.followers_count
    };
  }

  async unfollowUser(targetUserId, currentUserId) {
    // Kiểm tra user tồn tại
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Kiểm tra đã follow chưa
    const followerIndex = targetUser.followers.indexOf(currentUserId);
    if (followerIndex === -1) {
      throw new BadRequestError(i18next.t("user.notFollowing"));
    }

    // Xóa khỏi danh sách followers và giảm followers_count
    targetUser.followers.splice(followerIndex, 1);
    targetUser.followers_count -= 1;
    await targetUser.save();

    return {
      message: i18next.t("user.unfollowSuccess"),
      followers_count: targetUser.followers_count
    };
  }

  async getFollowers(userId) {
    const user = await User.findById(userId)
      .populate({
        path: "followers",
        select: "first_name last_name email profile_picture"
      });

    if (!user) {
      throw new NotFoundError(i18next.t("user.notFound"));
    }

    // Generate signed URLs for followers' profile pictures
    const followersWithSignedUrls = await Promise.all(
      user.followers.map(async (follower) => {
        const sanitizedFollower = this._sanitizeUser(follower);
        if (sanitizedFollower.profile_picture) {
          sanitizedFollower.profile_picture = await CloudinaryService.generateSignedUrl(
            sanitizedFollower.profile_picture.public_id,
            { expires_in: parseInt(process.env.SIGN_URL_EXPIRES) }
          );
        }
        return sanitizedFollower;
      })
    );

    return {
      followers: followersWithSignedUrls,
      total: user.followers_count
    };
  }

  async getTeachers(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = "-followers_count",
      search,
      level 
    } = options;

    let query = { role: "instructor", status: "active" };

    // Tìm kiếm theo tên hoặc email
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Lọc theo level nếu có
    if (level) {
      query.level = level;
    }

    const teachers = await User
      .find(query)
      .select("-password -verification_token -verification_token_expires -otp -otp_expires -reset_password_token -reset_password_expires")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        {
          path: "profile_picture",
          select: "file_url",
        },
        {
          path: "teaching_courses",
          select: "title thumbnail student_count rating_average",
        }
      ]);

    const total = await User.countDocuments(query);

    // Xử lý và format dữ liệu trả về
    const formattedTeachers = teachers.map(teacher => {
      const sanitizedTeacher = this._sanitizeUser(teacher);
      return {
        ...sanitizedTeacher,
        total_students: sanitizedTeacher.teaching_courses.reduce((sum, course) => sum + (course.student_count || 0), 0),
        average_rating: sanitizedTeacher.teaching_courses.reduce((sum, course) => sum + (course.rating_average || 0), 0) / 
          (sanitizedTeacher.teaching_courses.length || 1)
      };
    });

    return {
      data: formattedTeachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTeacherById(teacherId) {
    // Tìm giảng viên và populate các thông tin liên quan
    const teacher = await User.findOne({ 
      _id: teacherId,
      role: "instructor",
      status: "active"
    })
    .select("-password -verification_token -verification_token_expires -otp -otp_expires -reset_password_token -reset_password_expires")
    .populate([
      {
        path: "profile_picture",
        select: "public_id file_url",
      },
      {
        path: "teaching_courses",
        select: "title thumbnail description student_count rating_average price level status created_at",
        match: { status: "published" },
        populate: [
          {
            path: "reviews",
            select: "rating content created_at",
            populate: {
              path: "user_id",
              select: "first_name last_name profile_picture"
            }
          }
        ]
      },
      {
        path: "followers",
        select: "first_name last_name profile_picture",
        populate: {
          path: "profile_picture",
          select: "file_url"
        }
      }
    ]);

    if (!teacher) {
      throw new NotFoundError(i18next.t("user.teacherNotFound"));
    }

    // Tính toán các thống kê
    const stats = await this.getTeacherStats(teacherId);

    // Chỉ lấy thông tin cần thiết từ teacher
    const sanitizedTeacher = this._sanitizeUser(teacher);

    // Xử lý reviews để lấy avatar từ file_url
    if (sanitizedTeacher.teaching_courses) {
      sanitizedTeacher.teaching_courses = sanitizedTeacher.teaching_courses.map(course => {
        if (course.reviews) {
          course.reviews = course.reviews.map(review => {
            if (review.user_id?.profile_picture) {
              review.user_id.profile_picture = review.user_id.profile_picture.file_url;
            }
            return review;
          });
        }
        return course;
      });
    }

    return {
      teacher: {
        ...sanitizedTeacher,
        total_students: stats.totalStudents,
        average_rating: stats.averageRating,
        total_reviews: stats.totalReviews
      },
      stats
    };
  }

  async getTeacherStats(teacherId) {
    const [courseStats, reviewStats] = await Promise.all([
      Course.aggregate([
        { 
          $match: { 
            instructor_id: new mongoose.Types.ObjectId(teacherId),
            status: "published"
          }
        },
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            totalStudents: { $sum: "$student_count" },
            totalRevenue: { $sum: "$total_revenue" },
            averageRating: { $avg: "$rating_average" },
            totalReviews: { $sum: "$review_count" }
          }
        }
      ]),
      CourseReview.aggregate([
        {
          $lookup: {
            from: "courses",
            localField: "course_id",
            foreignField: "_id",
            as: "course"
          }
        },
        {
          $unwind: "$course"
        },
        {
          $match: {
            "course.instructor_id": new mongoose.Types.ObjectId(teacherId)
          }
        },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = courseStats[0] || {
      totalCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalReviews: 0
    };

    // Tính phân bố rating
    const ratingDistribution = {};
    reviewStats.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });

    return {
      totalCourses: stats.totalCourses,
      totalStudents: stats.totalStudents,
      totalRevenue: stats.totalRevenue,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      ratingDistribution
    };
  }
}

module.exports = new UserService();
