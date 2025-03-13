class AppError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.code = code;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Dữ liệu không hợp lệ", error = null) {
    super(message, 400);
    this.error = error;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Không tìm thấy tài nguyên") {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Không có quyền truy cập") {
    super(message, 401); 
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Không đủ quyền thực hiện") {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
}; 