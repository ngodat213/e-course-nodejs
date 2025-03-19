const Course = require("../models/course.model");
const UserProgress = require("../models/user_progress.model");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const EmailService = require("./email_template.service");
const CloudinaryService = require("./cloudinary.service");
const i18next = require("i18next");
const CourseDeleteRequest = require("../models/course_delete_request.model");
const Lesson = require("../models/lesson.model");
const LessonService = require("./lesson.service");
const FileService = require("./file.service");
const CourseCategory = require("../models/course_category.model");
const User = require("../models/user.model");

class CourseService {
  async getAll(query, userId = null) {
    let filterQuery = this._buildFilterQuery(query);

    // Nếu có userId, loại bỏ các khóa học đã đăng ký
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.enrolled_courses && user.enrolled_courses.length > 0) {
        filterQuery._id = { $nin: user.enrolled_courses };
      }
    }

    const courses = await Course.find(filterQuery)
      .populate('instructor_id', 'first_name last_name email followers_count working_at address about level profile_picture')
      .populate('thumbnail_id')
      .populate('categories', 'name slug')
      .sort(query.sort || '-created_at')
      .skip(query.skip)
      .limit(query.limit);

    return courses;
  }

  async getCourseById(id) {
    const course = await Course.findById(id)
    .populate('instructor_id', 'first_name last_name email followers_count working_at address about level profile_picture')
    .populate('thumbnail_id')
    .populate('categories', 'name slug')

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return course;
  }

  async create(courseData, thumbnailFile, instructorId) {
    // Upload thumbnail if provided
    let thumbnailId;
    if (thumbnailFile) {
      const uploadedFile = await FileService.uploadFile(instructorId, "Course", thumbnailFile, "thumbnail");
      thumbnailId = uploadedFile._id;
    }

    // Validate categories exist
    if (courseData.categories) {
      const validCategories = await CourseCategory.find({
        _id: { $in: courseData.categories },
        status: 'active'
      });

      if (validCategories.length !== courseData.categories.length) {
        throw new BadRequestError('One or more categories are invalid');
      }
    }

    const course = await Course.create({
      ...courseData,
      instructor_id: instructorId,
      thumbnail_id: thumbnailId
    });

    return course;
  }

  async update(courseId, updateData) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    // Validate categories if being updated
    if (updateData.categories) {
      const validCategories = await CourseCategory.find({
        _id: { $in: updateData.categories },
        status: 'active'
      });

      if (validCategories.length !== updateData.categories.length) {
        throw new BadRequestError('One or more categories are invalid');
      }
    }

    Object.assign(course, updateData);
    await course.save();

    return course;
  }

  async delete(courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    await course.updateOne({ status: "deleted" });
    return { message: i18next.t("course.deleted") };
  }

  async enrollCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    // Check if already enrolled
    const existingProgress = await UserProgress.findOne({
      user_id: userId,
      course_id: courseId,
    });

    if (existingProgress) {
      throw new BadRequestError(i18next.t("course.alreadyEnrolled"));
    }

    // Create progress record for first lesson
    const firstLesson = await Course.findOne({ course_id: courseId })
      .sort("createdAt")
      .select("_id");

    if (firstLesson) {
      await UserProgress.create({
        user_id: userId,
        course_id: courseId,
        lesson_id: firstLesson._id,
        status: "not_started",
        progress_percent: 0,
      });
    }

    // Send enrollment email
    await EmailService.sendCourseEnrollmentEmail(userId, course);

    return { message: i18next.t("course.enrolled") };
  }

  async getUserCourses(userId) {
    const enrollments = await UserProgress.find({ user_id: userId }).distinct(
      "course_id"
    );

    const courses = await Course.find({
      _id: { $in: enrollments },
    }).populate("instructor_id", "name email");

    return courses;
  }

  buildSearchQuery(search) {
    if (!search) return {};
    return {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };
  }

  async createDeleteRequest(courseId, userId, reason) {
    const course = await Course.findById(courseId);

    if (course.instructor_id._id.toString() !== userId) {
      throw new BadRequestError(i18next.t("course.notInstructor"));
    }

    return await CourseDeleteRequest.create({
      course_id: courseId,
      instructor_id: userId,
      reason,
    });
  }

  async getDeleteRequests(query) {
    const { status, page = 1, limit = 10 } = query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await CourseDeleteRequest.find()
      .populate("course_id", "title description")
      .populate("instructor_id", "email")
      .populate("admin_response", "message action_date")
      .sort("-created_at")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CourseDeleteRequest.countDocuments(filter);

    return {
      data: requests,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async handleDeleteRequest(requestId, adminId, { status, message }) {
    const request = await CourseDeleteRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError("Delete request not found");
    }

    if (request.status !== "pending") {
      throw new BadRequestError("This request has already been handled");
    }

    request.status = status;
    request.admin_response = {
      admin_id: adminId,
      message,
      action_date: new Date(),
    };

    await request.save();

    // Nếu approved thì xóa khóa học
    if (status === "approved") {
      await this.delete(request.course_id);
    }

    // Send email to instructor
    await EmailService.sendCourseDeleteRequestEmail(
      request.instructor_id,
      request.course_id,
      status,
      message
    );

    return request;
  }

  // Helper method to build filter query
  _buildFilterQuery(filters) {
    const queryFilter = {};

    if (filters.search) {
      queryFilter.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.level) {
      queryFilter.level = filters.level;
    }

    if (filters.status) {
      queryFilter.status = filters.status;
    }

    if (filters.price) {
      queryFilter.price = { $lte: Number(filters.price) };
    }

    if (filters.instructor_id) {
      queryFilter.instructor_id = filters.instructor_id;
    }

    if (filters.category) {
      queryFilter.categories = filters.category;
    }

    return queryFilter;
  }

  /**
   * Transform course data including secure thumbnail URL
   * @private
   */
  async _transformCourseData(course) {
    if (!course.thumbnail_id) return course;

    const { thumbnail_id, ...courseData } = course;

    return {
      ...courseData,
      thumbnail: await CloudinaryService.generateSignedUrl(
        thumbnail_id.public_id,
        { expires_in: parseInt(process.env.SIGN_URL_EXPIRES) }
      ),
    };
  }
}

module.exports = new CourseService();
