const express = require("express");
const router = express.Router();
const CourseController = require("../controllers/course.controller");
const { verifyToken, restrictTo } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const {
  createCourseSchema,
  updateCourseSchema,
} = require("../validators/course.validator");

// Auth required routes
router.use(verifyToken);

/**
 * @route GET /api/courses
 * @desc Lấy danh sách khóa học
 * @access Public
 * @query {page, limit, search, sort}
 */
router.get("/", (req, res, next) => {

  CourseController.getAll(req, res, next);
});

/**
 * @route GET /api/courses/:id
 * @desc Lấy thông tin chi tiết khóa học
 * @access Public
 * @param {string} id - Course ID
 */
router.get("/:id", (req, res, next) => {
  CourseController.getById(req, res, next);
});

/**
 * @route GET /api/courses/my/enrolled
 * @desc Lấy danh sách khóa học đã đăng ký
 * @access Private
 */
router.get("/my/enrolled", (req, res, next) => {
  CourseController.getMyCourses(req, res, next);
});

/**
 * @route POST /api/courses/:id/enroll
 * @desc Đăng ký khóa học
 * @access Private
 * @param {string} id - Course ID
 */
router.post("/:id/enroll", (req, res, next) => {
  CourseController.enrollCourse(req, res, next);
});

/**
 * @route POST /api/courses
 * @desc Tạo khóa học mới
 * @access Private (Instructor, Admin)
 * @validate {title, description, price}
 */
router.post(
  "/",
  restrictTo("instructor", "admin"),
  upload.single("thumbnail"),
  validateRequest(createCourseSchema),
  (req, res, next) => {
    CourseController.create(req, res, next);
  }
);

/**
 * @route PUT /api/courses/:id
 * @desc Cập nhật khóa học
 * @access Private (Instructor, Admin)
 * @param {string} id - Course ID
 * @validate {title, description, price}
 */
router.put(
  "/:id",
  restrictTo("instructor", "admin"),
  upload.single("thumbnail"),
  validateRequest(updateCourseSchema),
  (req, res, next) => {
    CourseController.update(req, res, next);
  }
);

module.exports = router;
