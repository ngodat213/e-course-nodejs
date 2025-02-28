const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category.controller");
const { verifyToken, restrictTo } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const upload = require("../middleware/upload.middleware");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");

// Public routes
router.get("/", (req, res, next) => {
  CategoryController.getAll(req, res, next);
});

router.get("/:id", (req, res, next) => {
  CategoryController.getById(req, res, next);
});

// Thêm route để lấy khóa học theo category
router.get("/:id/courses", (req, res, next) => {
  CategoryController.getCourses(req, res, next);
});

// Protected routes
router.use(verifyToken);
router.use(restrictTo("admin"));

router.post(
  "/",
  upload.single("icon"),
  validateRequest(createCategorySchema),
  (req, res, next) => {
    CategoryController.create(req, res, next);
  }
);

router.put(
  "/:id",
  upload.single("icon"),
  validateRequest(updateCategorySchema),
  (req, res, next) => {
    CategoryController.update(req, res, next);
  }
);

router.delete("/:id", (req, res, next) => {
  CategoryController.delete(req, res, next);
});

module.exports = router; 