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

class CourseService {
  async getAll(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = "-createdAt",
      type,
      status,
      level,
      search
    } = options;

    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructor_id", "name email")
        .populate("thumbnail_id", "public_id")
        .populate("lessons")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(query)
    ]);

    return {
      data: courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getCourseById(courseId) {
    const course = await Course.findById(courseId)
      .populate("instructor_id", "name email")
      .populate("thumbnail_id", "public_id")
      .populate({
        path: "lessons",
        select: "title type duration is_free status"
      });

    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
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

    const course = await Course.create({
      ...courseData,
      instructor_id: instructorId,
      thumbnail_id: thumbnailId
    });

    return course;
  }

  async update(courseId, updateData, thumbnailFile) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError(i18next.t("course.notFound"));
    }

    // Upload new thumbnail if provided
    if (thumbnailFile) {
      const uploadedFile = await FileService.uploadFile(course.instructor_id, "Course", thumbnailFile, "thumbnail");
      updateData.thumbnail_id = uploadedFile._id;
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

    if (course.student_count > 0) {
      throw new BadRequestError(i18next.t("course.hasStudents"));
    }

    await course.remove();
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

    if (course.instructor.toString() !== userId.toString()) {
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

    const requests = await CourseDeleteRequest.find(filter)
      .populate("course_id", "title")
      .populate("instructor_id", "name email")
      .populate("admin_response.admin_id", "name")
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
      await this.deleteCourse(request.course_id);
    }

    // Gửi email thông báo cho instructor
    // TODO: Implement email notification

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
