const { success } = require("../utils/logger");

class BaseController {
  // Response helpers
  successResponse(res, data, message = "Success") {
    res.success(data, message);
  }

  createdResponse(res, data, message = "Created successfully") {
    res.created(data, message);
  }

  errorResponse(res, error) {
    res.error(error.message, {
      code: error.code,
    });
  }

  // Logging helpers
  logInfo(message, meta = {}) {
    success.info(message, meta);
  }

  logError(message, meta = {}) {
    success.error(message, meta);
  }

  // Error handling helper
  handleError(error, next) {
    this.logError(error.message, {
      code: error.code,
    });
    next(error);
  }

  // Pagination helper
  getPaginationData(total, page, limit) {
    return {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = BaseController;
