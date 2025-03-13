const BaseController = require("./base.controller");
const CategoryService = require("../services/category.service");

class CategoryController extends BaseController {
  async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAll(req.query);
      this.successResponse(res, categories);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await CategoryService.getById(req.params.id);
      this.successResponse(res, category);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async create(req, res, next) {
    try {
      const category = await CategoryService.create(req.body, req.file);
      this.logInfo("Category created", { id: category._id });
      this.createdResponse(res, category);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async update(req, res, next) {
    try {
      const category = await CategoryService.update(req.params.id, req.body, req.file);
      this.logInfo("Category updated", { id: category._id });
      this.successResponse(res, category);
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async delete(req, res, next) {
    try {
      await CategoryService.delete(req.params.id);
      this.logInfo("Category deleted", { id: req.params.id });
      this.successResponse(res, { message: "Category deleted successfully" });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getCourses(req, res, next) {
    try {
      const { id } = req.params;
      const { page, limit, sort, status } = req.query;
      
      const result = await CategoryService.getCourses(id, {
        page,
        limit,
        sort,
        status
      });
      
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(error, next);
    }
  }
}

module.exports = new CategoryController(); 