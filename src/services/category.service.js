const CourseCategory = require("../models/course_category.model");
const Course = require("../models/course.model");
const FileService = require("./file.service");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { getPaginationOptions, formatPaginationResponse } = require("../utils/pagination.helper");

class CategoryService {
  async getAll(query = {}) {
    const { 
      parent_id, 
      status,
      sort = "order" 
    } = query;

    const filter = {};
    if (parent_id) filter.parent_id = parent_id;
    if (status) filter.status = status;

    const categories = await CourseCategory.find(filter)
      .populate("parent_id", "name")
      .populate({
        path: "courses",
        match: { status: "published" },
        populate: [
          {
            path: 'instructor_id',
            select: 'first_name last_name email followers_count working_at address about level profile_picture'
          },
          {
            path: 'thumbnail_id'
          },
          {
            path: 'categories',
            select: '-courses'
          }
        ]
      })
      .sort(sort);

    return Promise.all(
      categories.map(category => this._transformCategoryData(category))
    );
  }

  async getById(id) {
    const category = await CourseCategory.findById(id)
      .populate("parent_id", "name")
      .populate({
        path: "courses",
        match: { status: "published" }
      });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return this._transformCategoryData(category);
  }

  async create(categoryData, iconFile) {
    // Check if name exists
    const existingCategory = await CourseCategory.findOne({ 
      name: categoryData.name 
    });
    if (existingCategory) {
      throw new BadRequestError("Category with this name already exists");
    }

    // Upload icon if provided
    let iconId;
    if (iconFile) {
      const uploadedFile = await FileService.uploadFile(
        "system", 
        "Category",
        iconFile,
        "icon"
      );
      iconId = uploadedFile._id;
    }

    // Validate parent_id if provided
    if (categoryData.parent_id) {
      const parentExists = await CourseCategory.exists({ 
        _id: categoryData.parent_id,
        status: "active"
      });
      if (!parentExists) {
        throw new BadRequestError("Parent category not found or inactive");
      }
    }

    const category = await CourseCategory.create({
      ...categoryData,
      icon: iconId
    });

    return this._transformCategoryData(category);
  }

  async update(id, updateData, iconFile) {
    const category = await CourseCategory.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Check if new name would conflict
    if (updateData.name) {
      const existingCategory = await CourseCategory.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      if (existingCategory) {
        throw new BadRequestError("Category with this name already exists");
      }
    }

    // Upload new icon if provided
    if (iconFile) {
      const uploadedFile = await FileService.uploadFile(
        "system",
        "Category",
        iconFile,
        "icon"
      );
      updateData.icon = uploadedFile._id;

      // Delete old icon if exists
      if (category.icon) {
        await FileService.deleteFile(category.icon);
      }
    }

    // Validate parent_id if being updated
    if (updateData.parent_id) {
      // Prevent setting self as parent
      if (updateData.parent_id === id) {
        throw new BadRequestError("Category cannot be its own parent");
      }

      const parentExists = await CourseCategory.exists({ 
        _id: updateData.parent_id,
        status: "active"
      });
      if (!parentExists) {
        throw new BadRequestError("Parent category not found or inactive");
      }
    }

    Object.assign(category, updateData);
    await category.save();

    return this._transformCategoryData(category);
  }

  async delete(id) {
    const category = await CourseCategory.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Check if category has child categories
    const hasChildren = await CourseCategory.exists({ parent_id: id });
    if (hasChildren) {
      throw new BadRequestError(
        "Cannot delete category that has child categories"
      );
    }

    // Check if category has active courses
    if (category.course_count > 0) {
      throw new BadRequestError(
        "Cannot delete category that has associated courses"
      );
    }

    // Delete icon if exists
    if (category.icon) {
      await FileService.deleteFile(category.icon);
    }

    await category.deleteOne();
  }

  async getCourses(categoryId, options = {}) {
    const category = await CourseCategory.findById(categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const { 
      page = 1, 
      limit = 10, 
      sort = "-created_at",
      status = "published" 
    } = options;

    const query = {
      categories: categoryId,
      status
    };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructor_id", "first_name last_name email")
        .populate("thumbnail_id", "public_id")
        .populate("categories", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
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

  /**
   * Transform category data including secure icon URL
   * @private
   */
  async _transformCategoryData(category) {
    if (!category.icon) return category;

    const { icon, ...categoryData } = category.toObject();

    return {
      ...categoryData,
      icon: await FileService.getSignedUrl(icon)
    };
  }
}

module.exports = new CategoryService(); 