const express = require("express");
const router = express.Router();
const CourseController = require("../controllers/course.controller");
const { restrictTo, verifyToken } = require("../middleware/auth.middleware");


// Auth required routes
router.use(verifyToken);
/**
 * @route POST /api/courses/:id/delete-request
 * @desc Yêu cầu xóa khóa học
 * @access Private (Instructor)
 * @param {string} id - Course ID
 */
router.post(
  "/:courseId",
  restrictTo("instructor", "admin"),
  (req, res, next) => {
    CourseController.requestDelete(req, res, next);
  }
);

/**
 * @route GET /api/courses/delete-requests
 * @desc Lấy danh sách yêu cầu xóa khóa học
 * @access Private (Admin)
 */
router.get("/", restrictTo("admin"), (req, res, next) => {
  CourseController.getDeleteRequests(req, res, next);
});

/**
 * @route PUT /api/courses/delete-requests/:requestId
 * @desc Xử lý yêu cầu xóa khóa học
 * @access Private (Admin)
 * @param {string} requestId - Request ID
 */
router.put(
  "/:requestId",
  restrictTo("admin"),
  (req, res, next) => {
    CourseController.handleDeleteRequest(req, res, next);
  }
);

module.exports = router;